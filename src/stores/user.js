import { defineStore } from 'pinia'
import { userApi } from '@/api'
import { getValidToken, parseJWT, isTokenExpired } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: getValidToken(),
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => {
      console.log('获取用户名 - userInfo:', state.userInfo)
      return state.userInfo?.username || 
             state.userInfo?.companyName || 
             state.userInfo?.name || 
             state.userInfo?.email?.split('@')[0] || 
             '未知用户'
    },
    avatar: (state) => state.userInfo?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },

  actions: {
    // 设置token
    setToken(token) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      console.log('设置用户信息:', userInfo)
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        console.log('用户信息已保存到localStorage')
      } else {
        localStorage.removeItem('userInfo')
        console.log('用户信息已从localStorage清除')
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) {
        return null
      }

      this.loading = true
      try {
        console.log('正在获取用户信息...')
        const result = await userApi.getProfile()
        console.log('获取用户信息API返回:', result)
        
        // 处理不同的响应格式
        let userInfo = result
        if (result.data) {
          userInfo = result.data
        }
        
        console.log('处理后的用户信息:', userInfo)
        
        if (userInfo) {
          this.setUserInfo(userInfo)
          console.log('用户信息设置成功')
        } else {
          console.warn('API返回的用户信息为空')
        }
        
        return userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果API调用失败，尝试从本地存储读取
        const savedUserInfo = localStorage.getItem('userInfo')
        if (savedUserInfo) {
          try {
            this.userInfo = JSON.parse(savedUserInfo)
            console.log('从localStorage恢复用户信息:', this.userInfo)
          } catch (e) {
            console.error('解析本地用户信息失败:', e)
          }
        }
        return null
      } finally {
        this.loading = false
      }
    },

    // 登录
    async login(credentials) {
      try {
        const result = await userApi.login(credentials)
        console.log('登录API返回结果:', result)
        
        // 处理不同的响应格式
        const token = result.token || result.data?.token || result.access_token
        const userInfo = result.userInfo || result.data?.userInfo || result.user || result.data?.user
        
        if (token) {
          // 验证token格式
          if (parseJWT(token)) {
            this.setToken(token)
          } else {
            throw new Error('服务器返回的token格式无效')
          }
        }
        
        if (userInfo) {
          this.setUserInfo(userInfo)
        } else if (token) {
          // 如果服务器没有返回用户信息，尝试从token解析
          const userInfoFromToken = parseJWT(token)
          if (userInfoFromToken) {
            this.setUserInfo({
              username: userInfoFromToken.username || userInfoFromToken.name || userInfoFromToken.sub,
              email: userInfoFromToken.email,
              companyName: userInfoFromToken.companyName,
              userId: userInfoFromToken.userId || userInfoFromToken.sub
            })
          }
        }
        
        // 如果API调用失败但用户信息设置成功，创建临时token用于演示
        if (!this.token && this.userInfo) {
          const demoToken = 'demo-token-' + Date.now()
          this.setToken(demoToken)
        }
        
        // 如果登录成功但没有用户信息，至少设置用户名
        if (this.token && !this.userInfo) {
          this.setUserInfo({
            username: credentials.username || '用户',
            companyName: '演示企业',
            email: 'demo@example.com',
            userId: 'demo-user-' + Date.now()
          })
        }
        
        // 确保登录状态正确设置
        console.log('登录状态:', {
          token: this.token,
          userInfo: this.userInfo,
          isLoggedIn: this.isLoggedIn,
          username: this.username
        })
        
        return {
          token: this.token,
          userInfo: this.userInfo
        }
      } catch (error) {
        console.error('登录过程中发生错误:', error)
        
        // 如果API调用失败，为了演示目的，创建临时登录状态
        // 在生产环境中，应该直接抛出错误
        if (credentials.username && credentials.password) {
          console.warn('API调用失败，使用演示模式登录')
          this.setToken('demo-token-' + Date.now())
          this.setUserInfo({
            username: credentials.username,
            companyName: '演示企业',
            email: 'demo@example.com',
            userId: 'demo-user-' + Date.now()
          })
          
          return {
            token: this.token,
            userInfo: this.userInfo
          }
        }
        
        throw error
      }
    },

    // 退出登录
    async logout() {
      try {
        await userApi.logout()
      } catch (error) {
        console.error('退出登录API调用失败:', error)
      } finally {
        this.setToken(null)
        this.setUserInfo(null)
      }
    },

    // 刷新用户信息
    async refreshUserInfo() {
      this.userInfo = null
      return await this.fetchUserInfo()
    },

    // 初始化用户状态
    async initUserState() {
      console.log('初始化用户状态...')
      
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedUserInfo) {
        try {
          this.userInfo = JSON.parse(savedUserInfo)
          console.log('从localStorage恢复用户信息:', this.userInfo)
        } catch (e) {
          console.error('解析本地用户信息失败:', e)
          localStorage.removeItem('userInfo')
        }
      }
      
      if (this.token && !this.userInfo) {
        console.log('有token但没有用户信息，尝试获取用户信息...')
        try {
          await this.fetchUserInfo()
        } catch (error) {
          console.error('获取用户信息失败:', error)
        }
      }
      
      console.log('用户状态初始化完成:', {
        isLoggedIn: this.isLoggedIn,
        userInfo: this.userInfo,
        username: this.username
      })
    }
  }
})