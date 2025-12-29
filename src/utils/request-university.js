import axios from 'axios'
import { getApiUrlUniversity } from '@/config/api-university'
import { ElMessage } from 'element-plus'

// 获取高校端token
const getUniversityToken = () => {
  const token = localStorage.getItem('token_university')
  if (!token) return null
  
  // 简单的token验证
  if (token.startsWith('demo-token-university-') || token.split('.').length === 3) {
    return token
  }
  
  return null
}

// 创建高校端 axios 实例
const request = axios.create({
  baseURL: getApiUrlUniversity(''),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = getUniversityToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response
    
    if (data.code === 200 || data.success || data.access_token || data.token || 
        (data.data !== undefined) || (typeof data === 'object' && Object.keys(data).length > 0)) {
      return data
    } else {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }
  },
  (error) => {
    let message = '网络错误'
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '登录已过期，请重新登录'
          localStorage.removeItem('token_university')
          localStorage.removeItem('userInfo_university')
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

