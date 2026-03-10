import { defineStore } from 'pinia'
import { userApiAdmin } from '@/api/admin'
import { parseJWT, isTokenExpired, isValidTokenFormat } from '@/utils/auth'

// 获取管理员端token
const getAdminToken = () => {
  const token = localStorage.getItem('token_admin')
  if (!token) return null
  
  // 简单的token验证
  if (token.startsWith('demo-token-admin-') || token.split('.').length === 3) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('token_admin')
      localStorage.removeItem('userInfo_admin')
      return null
    }
    return token
  }
  
  return null
}

export const useUserStoreAdmin = defineStore('userAdmin', {
  state: () => ({
    userInfo: null,
    token: getAdminToken(),
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => {
      return state.userInfo?.username || 
             state.userInfo?.adminName || 
             state.userInfo?.name || 
             state.userInfo?.email?.split('@')[0] || 
             '管理员用户'
    },
    avatar: (state) => state.userInfo?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    isSuperAdmin: (state) => state.userInfo?.role === 'super_admin'
  },

  actions: {
    // 设置token
    setToken(token) {
      this.token = token
      if (token) {
        localStorage.setItem('token_admin', token)
      } else {
        localStorage.removeItem('token_admin')
      }
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      if (userInfo) {
        localStorage.setItem('userInfo_admin', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('userInfo_admin')
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) {
        return null
      }

      this.loading = true
      try {
        const result = await userApiAdmin.getProfile()
        let userInfo = result
        if (result.data) {
          userInfo = result.data
        }
        
        if (userInfo) {
          this.setUserInfo(userInfo)
        }
        
        return userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
        const savedUserInfo = localStorage.getItem('userInfo_admin')
        if (savedUserInfo) {
          try {
            this.userInfo = JSON.parse(savedUserInfo)
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
      console.log('=== 管理员端登录开始 ===')
      console.log('登录凭证:', { username: credentials.username })

      try {
        const result = await userApiAdmin.login(credentials)

        console.log('API响应:', result)

        // 检查API响应结构，提取token
        let token = null
        let userInfo = null
        
        // 优先从data字段提取
        if (result.data && typeof result.data === 'object') {
          token = result.data.token || result.data.access_token
          userInfo = result.data.userInfo || result.data.user
        }
        
        // 如果data字段没有，尝试从根级提取
        if (!token) {
          token = result.token || result.access_token
          userInfo = result.userInfo || result.user
        }
        
        console.log('提取的token:', token ? `${token.substring(0, 30)}...` : 'null')
        console.log('提取的userInfo:', userInfo)

        if (token) {
          // 验证token格式
          if (isValidTokenFormat(token)) {
            this.setToken(token)
            console.log('✅ Token已设置')
            console.log('存储的token长度:', token.length)
          } else {
            console.error('❌ 服务器返回的token格式无效')
            throw new Error('服务器返回的token格式无效')
          }
        } else {
          console.error('❌ 未获取到token')
          throw new Error('登录失败：未获取到token')
        }

        if (userInfo) {
          this.setUserInfo(userInfo)
          console.log('✅ 用户信息已设置')
        } else if (token) {
          const userInfoFromToken = parseJWT(token)
          if (userInfoFromToken) {
            this.setUserInfo({
              username: userInfoFromToken.username || userInfoFromToken.name || userInfoFromToken.sub,
              email: userInfoFromToken.email,
              role: userInfoFromToken.role || 'admin',
              adminName: userInfoFromToken.adminName,
              userId: userInfoFromToken.userId || userInfoFromToken.sub
            })
            console.log('✅ 从Token提取用户信息')
          } else {
            console.error('❌ 无法从token中提取用户信息')
          }
        }

        // 验证token是否已正确存储
        const storedToken = localStorage.getItem('token_admin')
        if (!storedToken || storedToken !== token) {
          console.error('❌ Token存储失败')
          throw new Error('Token存储失败')
        }

        console.log('=== 管理员端登录成功 ===')
        return {
          token: this.token,
          userInfo: this.userInfo
        }
      } catch (error) {
        console.error('❌ 登录失败:', error)
        
        // 清除可能已存储的无效token
        localStorage.removeItem('token_admin')
        localStorage.removeItem('userInfo_admin')
        
        throw new Error(error.message || '登录失败，请检查用户名和密码')
      }
    },

    // 退出登录
    async logout() {
      // 先清除本地存储的token和用户信息
      this.setToken(null)
      this.setUserInfo(null)
      
      // 只有在有有效token的情况下才调用API登出
      if (this.token) {
        try {
          await userApiAdmin.logout()
        } catch (error) {
          console.error('退出登录API调用失败:', error)
          // API调用失败不影响本地登出
        }
      }
    },

    // 初始化用户状态
    async initUserState() {
      const savedUserInfo = localStorage.getItem('userInfo_admin')
      if (savedUserInfo) {
        try {
          this.userInfo = JSON.parse(savedUserInfo)
        } catch (e) {
          console.error('解析本地用户信息失败:', e)
          localStorage.removeItem('userInfo_admin')
        }
      }
      
      if (this.token && !this.userInfo) {
        try {
          await this.fetchUserInfo()
        } catch (error) {
          console.error('获取用户信息失败:', error)
        }
      }
    }
  }
})