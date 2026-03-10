import axios from 'axios'
import { getApiUrl } from '@/config/api'
import { ElMessage } from 'element-plus'
import { getValidToken } from '@/utils/auth'
import { analyze500Error } from './errorAnalyzer.js'

// 创建 axios 实例
const request = axios.create({
  baseURL: getApiUrl(''), // 使用配置文件中的 base URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 根据请求URL判断是哪个端
    let mode = 'enterprise'
    if (config.url && config.url.includes('/university/')) {
      mode = 'university'
    } else if (config.url && config.url.includes('/admin/')) {
      mode = 'admin'
    } else if (config.url && config.url.includes('/oss/')) {
      // 优先尝试管理员权限，如果失败则尝试企业端权限
      const adminToken = getValidToken('admin')
      mode = adminToken ? 'admin' : 'enterprise'
    }

    // 获取有效的token，自动过滤过期token
    const token = getValidToken(mode)

    // 添加调试信息
    console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`, {
      mode: mode,
      hasToken: !!token,
      token: token ? `${token.substring(0, 20)}...` : '无',
      headers: config.headers
    })

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const { data } = response
    
    // 打印响应数据用于调试
    console.log('API响应:', {
      url: response.config.url,
      status: response.status,
      data: data,
      headers: response.headers
    })
    
    // 检查是否是认证相关的响应
    const isAuthEndpoint = response.config.url.includes('/auth/')
    const isDashboardEndpoint = response.config.url.includes('/dashboard/')
    
    if (isAuthEndpoint || isDashboardEndpoint) {
      console.log('认证/统计相关API响应:', {
        url: response.config.url,
        success: data.code === 200 || data.success || data.access_token || data.token,
        hasData: !!data.data,
        dataKeys: Object.keys(data),
        isStats: isDashboardEndpoint && response.config.url.includes('/stats')
      })
    }
    
    // 这里可以根据后端的响应格式统一处理
    // 放宽条件，统计数据等API可能不返回code字段
    if (data.code === 200 || data.success || data.access_token || data.token || 
        (data.data !== undefined) || (typeof data === 'object' && Object.keys(data).length > 0)) {
      return data
    } else {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }
  },
  (error) => {
    // 对响应错误做点什么
    let message = '网络错误'

    if (error.response) {
      // 判断是哪个端的请求
      let tokenKey = 'token'
      let userInfoKey = 'userInfo'
      
      if (error.config.url && error.config.url.includes('/university/')) {
        tokenKey = 'token_university'
        userInfoKey = 'userInfo_university'
      } else if (error.config.url && error.config.url.includes('/admin/')) {
        tokenKey = 'token_admin'
        userInfoKey = 'userInfo_admin'
      } else if (error.config.url && error.config.url.includes('/oss/')) {
        tokenKey = 'token_admin' // OSS接口使用管理员权限
        userInfoKey = 'userInfo_admin'
      }

      switch (error.response.status) {
        case 401:
          message = '登录已过期，请重新登录'
          // 清除本地存储的用户信息和token
          localStorage.removeItem(tokenKey)
          localStorage.removeItem(userInfoKey)
          console.log('清除token:', { tokenKey, userInfoKey })
          // 跳转到登录页
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          // 使用错误分析器详细分析500错误
          try {
            const currentPath = window.location.pathname
            analyze500Error(error, {
              page: currentPath,
              component: 'API请求',
              action: '数据获取'
            })
          } catch (analysisError) {
            console.error('错误分析器失败:', analysisError)
            // 降级处理
            console.error('🔥 500错误详情:')
            console.error('URL:', error.config?.method?.toUpperCase(), error.config?.url)
            console.error('请求参数:', error.config?.params || error.config?.data)
            console.error('响应数据:', error.response?.data)
          }
          break
        default:
          message = error.response.data?.message || '请求失败'
      }
    } else if (error.request) {
      message = '网络连接失败'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request