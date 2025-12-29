import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 当前端类型：'enterprise' 或 'university'
    currentMode: localStorage.getItem('appMode') || 'enterprise'
  }),

  getters: {
    isEnterprise: (state) => state.currentMode === 'enterprise',
    isUniversity: (state) => state.currentMode === 'university'
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

    // 切换端类型
    toggleMode() {
      if (this.currentMode === 'enterprise') {
        this.switchToUniversity()
      } else {
        this.switchToEnterprise()
      }
    }
  }
})

