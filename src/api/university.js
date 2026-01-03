// 高校端 API - 使用真实接口
import request from '@/utils/request'

// 高校端用户相关 API
export const userApiUniversity = {
  // 用户登录
  login: (data) => {
    console.log('🔵 [高校端真实API] 登录请求:', data)
    console.log('🌐 请求地址: /api/university/auth/login')
    return request.post('/university/auth/login', data)
  },

  // 用户注册
  register: (data) => {
    console.log('🔵 [高校端真实API] 注册请求:', data)
    console.log('🌐 请求地址: /api/university/auth/register')
    return request.post('/university/auth/register', data)
  },

  // 发送验证码
  sendVerification: (data) => {
    console.log('🔵 [高校端真实API] 发送验证码请求:', data)
    console.log('🌐 请求地址: /api/university/auth/send-verification')
    return request.post('/university/auth/send-verification', data)
  },

  // 发送重置密码验证码
  sendResetCode: (data) => {
    console.log('🔵 [高校端真实API] 发送重置密码验证码请求:', data)
    console.log('🌐 请求地址: /api/university/auth/send-reset-code')
    return request.post('/university/auth/send-reset-code', data)
  },

  // 重置密码
  resetPassword: (data) => {
    console.log('🔵 [高校端真实API] 重置密码请求:', data)
    console.log('🌐 请求地址: /api/university/auth/reset-password-with-code')
    return request.post('/university/auth/reset-password-with-code', data)
  },

  // 用户登出
  logout: () => {
    console.log('🔵 [高校端真实API] 退出登录')
    console.log('🌐 请求地址: /api/university/auth/logout')
    return request.post('/university/auth/logout')
  },

  // 获取用户信息
  getProfile: () => {
    console.log('🔵 [高校端真实API] 获取用户信息')
    console.log('🌐 请求地址: /api/university/auth/me')
    return request.get('/university/auth/me')
  }
}

// 高校端统计数据 API（使用真实接口）
export const dashboardApiUniversity = {
  // 获取统计数据
  getStats: (params) => {
    console.log('🔵 [高校端真实API] 获取统计数据:', params)
    console.log('🌐 请求地址: /api/university/dashboard/stats')
    return request.get('/university/dashboard/stats', { params })
  },

  // 获取课程切片统计
  getCourseSliceStats: (params) => {
    console.log('🔵 [高校端真实API] 获取课程切片统计:', params)
    console.log('🌐 请求地址: /api/university/dashboard/course-slice-stats')
    return request.get('/university/dashboard/course-slice-stats', { params })
  },

  // 获取提案统计
  getProposalStats: (params) => {
    console.log('🔵 [高校端真实API] 获取提案统计:', params)
    console.log('🌐 请求地址: /api/university/dashboard/proposal-stats')
    return request.get('/university/dashboard/proposal-stats', { params })
  },

  // 获取反馈趋势
  getFeedbackTrend: (params) => {
    console.log('🔵 [高校端真实API] 获取反馈趋势:', params)
    console.log('🌐 请求地址: /api/university/dashboard/feedback-trend')
    return request.get('/university/dashboard/feedback-trend', { params })
  },

  // 获取合作统计
  getCooperationStats: (params) => {
    console.log('🔵 [高校端真实API] 获取合作统计:', params)
    console.log('🌐 请求地址: /api/university/dashboard/cooperation-stats')
    return request.get('/university/dashboard/cooperation-stats', { params })
  },

  // 获取最近活动
  getActivities: (params) => {
    console.log('🔵 [高校端真实API] 获取最近活动:', params)
    console.log('🌐 请求地址: /api/university/dashboard/activities')
    return request.get('/university/dashboard/activities', { params })
  }
}

// 高校端课程切片 API（使用真实接口）
export const courseSliceApi = {
  // 获取列表
  getList: (params) => {
    console.log('🔵 [高校端真实API] 获取课程切片列表:', params)
    console.log('🌐 请求地址: /api/university/course-slice/list')
    return request.get('/university/course-slice/list', { params })
  },

  // 获取详情
  getDetail: (id) => {
    console.log('🔵 [高校端真实API] 获取课程切片详情:', id)
    console.log('🌐 请求地址: /api/university/course-slice/:id')
    return request.get(`/university/course-slice/${id}`)
  },

  // 审批
  approve: (id, data) => {
    console.log('🔵 [高校端真实API] 审批课程切片:', id, data)
    console.log('🌐 请求地址: /api/university/course-slice/:id/approve')
    return request.post(`/university/course-slice/${id}/approve`, data)
  },

  // 创建
  create: (data) => {
    console.log('🔵 [高校端虚拟接口] 创建课程切片:', data)
    return mockCourseSliceData.create(data)
  },

  // 更新
  update: (id, data) => {
    console.log('🔵 [高校端虚拟接口] 更新课程切片:', id, data)
    return mockCourseSliceData.update(id, data)
  },

  // 删除
  delete: (id) => {
    console.log('🔵 [高校端虚拟接口] 删除课程切片:', id)
    return mockCourseSliceData.delete(id)
  }
}

// 高校端提案审批 API（使用真实接口）
export const proposalApi = {
  // 获取列表
  getList: (params) => {
    console.log('🔵 [高校端真实API] 获取提案列表:', params)
    console.log('🌐 请求地址: /api/university/proposal/list')
    return request.get('/university/proposal/list', { params })
  },

  // 获取详情
  getDetail: (id) => {
    console.log('🔵 [高校端真实API] 获取提案详情:', id)
    console.log('🌐 请求地址: /api/university/proposal/:id')
    return request.get(`/university/proposal/${id}`)
  },

  // 审批
  approve: (id, data) => {
    console.log('🔵 [高校端真实API] 审批提案:', id, data)
    console.log('🌐 请求地址: /api/university/proposal/:id/approve')
    return request.post(`/university/proposal/${id}/approve`, data)
  },

  // 创建
  create: (data) => {
    console.log('🔵 [高校端虚拟接口] 创建提案:', data)
    return mockProposalData.create(data)
  }
}

// 高校端教学反馈 API（使用真实接口）
export const teachingFeedbackApi = {
  // 获取列表
  getList: (params) => {
    console.log('🔵 [高校端真实API] 获取教学反馈列表:', params)
    console.log('🌐 请求地址: /api/university/teaching-feedback/list')
    return request.get('/university/teaching-feedback/list', { params })
  },

  // 获取统计
  getStats: (params) => {
    console.log('🔵 [高校端真实API] 获取教学反馈统计:', params)
    console.log('🌐 请求地址: /api/university/teaching-feedback/stats')
    return request.get('/university/teaching-feedback/stats', { params })
  },

  // 获取趋势
  getTrend: (params) => {
    console.log('🔵 [高校端真实API] 获取教学反馈趋势:', params)
    console.log('🌐 请求地址: /api/university/teaching-feedback/trend')
    return request.get('/university/teaching-feedback/trend', { params })
  },

  // 获取详情
  getDetail: (id) => {
    console.log('🔵 [高校端真实API] 获取教学反馈详情:', id)
    console.log('🌐 请求地址: /api/university/teaching-feedback/:id')
    return request.get(`/university/teaching-feedback/${id}`)
  }
}

// 高校端校企合作 API（使用真实接口）
export const cooperationApiUniversity = {
  // 获取列表
  getList: (params) => {
    console.log('🔵 [高校端真实API] 获取校企合作列表:', params)
    console.log('🌐 请求地址: /api/university/cooperation/list')
    return request.get('/university/cooperation/list', { params })
  },
  
  // 创建
  create: (data) => {
    console.log('🔵 [高校端虚拟接口] 创建校企合作:', data)
    return mockCooperationData.create(data)
  },
  
  // 更新
  update: (id, data) => {
    console.log('🔵 [高校端虚拟接口] 更新校企合作:', id, data)
    return mockCooperationData.update(id, data)
  },
  
  // 删除
  delete: (id) => {
    console.log('🔵 [高校端虚拟接口] 删除校企合作:', id)
    return mockCooperationData.delete(id)
  },
  
  // 获取详情
  getDetail: (id) => {
    console.log('🔵 [高校端真实API] 获取校企合作详情:', id)
    console.log('🌐 请求地址: /api/university/cooperation/:id')
    return request.get(`/university/cooperation/${id}`)
  }
}

// 导出所有 API
export default {
  userApiUniversity,
  dashboardApiUniversity,
  courseSliceApi,
  proposalApi,
  teachingFeedbackApi,
  cooperationApiUniversity
}

