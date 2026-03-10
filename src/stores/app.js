import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 当前端类型：'enterprise'、'university' 或 'admin'
    currentMode: localStorage.getItem('appMode') || 'enterprise'
  }),

  getters: {
    isEnterprise: (state) => state.currentMode === 'enterprise',
    isUniversity: (state) => state.currentMode === 'university',
    isAdmin: (state) => state.currentMode === 'admin'
  },

  actions: {
    // 切换到企业端
    switchToEnterprise() {
      this.currentMode = 'enterprise'
      localStorage.setItem('appMode', 'enterprise')
    },

    // 切换到高校端
    switchToUniversity() {
      this.currentMode = 'university'
      localStorage.setItem('appMode', 'university')
    },

    // 切换到管理员端
    switchToAdmin() {
      this.currentMode = 'admin'
      localStorage.setItem('appMode', 'admin')
    },

    // 切换端类型
    toggleMode() {
      if (this.currentMode === 'enterprise') {
        this.switchToUniversity()
      } else if (this.currentMode === 'university') {
        this.switchToAdmin()
      } else {
        this.switchToEnterprise()
      }
    }
  }
})

