import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

// 管理员相关 API
export const userApiAdmin = {
  // 管理员登录
  login: (data) => {
    return request.post(API_ENDPOINTS.ADMIN.LOGIN, data)
  },
  
  // 管理员登出
  logout: () => {
    return request.post(API_ENDPOINTS.ADMIN.LOGOUT)
  },
  
  // 获取管理员信息
  getProfile: () => {
    return request.get(API_ENDPOINTS.ADMIN.ME)
  },

  // 获取用户列表
  getUserList: (params) => {
    return request.get('/api/admin/users', { params })
  },

  // 获取企业列表
  getEnterpriseList: (params) => {
    return request.get('/api/admin/enterprises', { params })
  },

  // 获取高校列表
  getUniversityList: (params) => {
    return request.get('/api/admin/universities', { params })
  },

  // 获取合作项目列表
  getCooperationList: (params) => {
    return request.get('/api/admin/cooperations', { params })
  },

  // 审核合作项目
  auditCooperation: (id, data) => {
    return request.put(`/api/admin/cooperations/${id}/audit`, data)
  },

  // 获取系统统计
  getSystemStats: () => {
    return request.get('/api/admin/stats')
  },

  // 管理员上传视频
  uploadVideo: (data) => {
    return request({
      url: '/admin/videos',
      method: 'post',
      data
    })
  }
}

// 导出默认对象
export default userApiAdmin