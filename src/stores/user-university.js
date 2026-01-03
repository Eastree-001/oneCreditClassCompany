import { defineStore } from 'pinia'
import { userApiUniversity } from '@/api/university'
import { parseJWT, isTokenExpired } from '@/utils/auth'

// 获取高校端token
const getUniversityToken = () => {
  const token = localStorage.getItem('token_university')
  if (!token) return null
  
  // 简单的token验证
  if (token.startsWith('demo-token-university-') || token.split('.').length === 3) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('token_university')
      localStorage.removeItem('userInfo_university')
      return null
    }
    return token
  }
  
  return null
}

export const useUserStoreUniversity = defineStore('userUniversity', {
  state: () => ({
    userInfo: null,
    token: getUniversityToken(),
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => {
      return state.userInfo?.username || 
             state.userInfo?.universityName || 
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
        localStorage.setItem('token_university', token)
      } else {
        localStorage.removeItem('token_university')
      }
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      if (userInfo) {
        localStorage.setItem('userInfo_university', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('userInfo_university')
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) {
        return null
      }

      this.loading = true
      try {
        const result = await userApiUniversity.getProfile()
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
        const savedUserInfo = localStorage.getItem('userInfo_university')
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
      console.log('=== 高校端登录开始 ===')
      console.log('登录凭证:', { username: credentials.username })

      try {
        const result = await userApiUniversity.login(credentials)

        console.log('API响应:', result)

        const token = result.token || result.data?.token || result.access_token
        const userInfo = result.userInfo || result.data?.userInfo || result.user || result.data?.user

        if (token) {
          if (parseJWT(token)) {
            this.setToken(token)
            console.log('✅ Token已设置')
          } else {
            throw new Error('服务器返回的token格式无效')
          }
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
              universityName: userInfoFromToken.universityName,
              userId: userInfoFromToken.userId || userInfoFromToken.sub
            })
            console.log('✅ 从Token提取用户信息')
          }
        }

        if (!this.token) {
          throw new Error('登录失败：未获取到token')
        }

        console.log('=== 高校端登录成功 ===')
        return {
          token: this.token,
          userInfo: this.userInfo
        }
      } catch (error) {
        console.error('❌ 登录失败:', error)
        throw new Error(error.message || '登录失败，请检查用户名和密码')
      }
    },

    // 退出登录
    async logout() {
      try {
        await userApiUniversity.logout()
      } catch (error) {
        console.error('退出登录API调用失败:', error)
      } finally {
        this.setToken(null)
        this.setUserInfo(null)
      }
    },

    // 初始化用户状态
    async initUserState() {
      const savedUserInfo = localStorage.getItem('userInfo_university')
      if (savedUserInfo) {
        try {
          this.userInfo = JSON.parse(savedUserInfo)
        } catch (e) {
          console.error('解析本地用户信息失败:', e)
          localStorage.removeItem('userInfo_university')
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

