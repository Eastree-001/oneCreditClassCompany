// 配置验证工具
// 用于验证API配置是否正确依赖环境变量

import { API_CONFIG, getApiUrl } from './api.js'

export const validateApiConfig = () => {
  console.log('=== API配置验证 ===')
  
  // 1. 验证BASE_URL是否从环境变量获取
  const baseUrl = API_CONFIG.BASE_URL
  console.log('当前BASE_URL:', baseUrl)
  
  // 2. 验证环境变量读取
  const envValue = import.meta.env.VITE_API_BASE_URL
  console.log('环境变量VITE_API_BASE_URL:', envValue)
  
  // 3. 验证是否完全依赖环境变量
  const isDependentOnEnv = baseUrl === envValue
  console.log('是否完全依赖环境变量:', isDependentOnEnv ? '✅ 是' : '❌ 否')
  
  // 4. 测试URL构建
  const testEndpoint = '/enterprise/dashboard/stats'
  const fullUrl = getApiUrl(testEndpoint)
  console.log('测试端点:', testEndpoint)
  console.log('完整URL:', fullUrl)
  
  // 5. 验证结果
  if (!envValue) {
    console.error('❌ 错误: 环境变量VITE_API_BASE_URL未设置')
    console.error('请检查.env文件是否正确配置')
    return false
  }
  
  if (!isDependentOnEnv) {
    console.error('❌ 错误: API配置未完全依赖环境变量')
    return false
  }
  
  console.log('✅ 配置验证通过')
  return true
}

export const getApiBaseInfo = () => {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    envValue: import.meta.env.VITE_API_BASE_URL,
    isConfigured: !!import.meta.env.VITE_API_BASE_URL,
    configSource: import.meta.env.VITE_API_BASE_URL ? '环境变量' : '默认值'
  }
}