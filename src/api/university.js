// 使用虚拟接口模式，直接返回模拟数据
import {
  mockUserData,
  mockDashboardData,
  mockCourseSliceData,
  mockProposalData,
  mockTeachingFeedbackData,
  mockCooperationData
} from './mock-university'

// 高校端用户相关 API（使用虚拟接口）
export const userApiUniversity = {
  // 用户登录
  login: (data) => {
    console.log('🔵 [高校端虚拟接口] 登录请求:', data)
    return mockUserData.login(data)
  },
  
  // 用户注册
  register: (data) => {
    console.log('🔵 [高校端虚拟接口] 注册请求:', data)
    return mockUserData.register(data)
  },
  
  // 用户登出
  logout: () => {
    console.log('🔵 [高校端虚拟接口] 退出登录')
    return mockUserData.logout()
  },
  
  // 获取用户信息
  getProfile: () => {
    console.log('🔵 [高校端虚拟接口] 获取用户信息')
    return mockUserData.getProfile()
  }
}

// 高校端统计数据 API（使用虚拟接口）
export const dashboardApiUniversity = {
  // 获取统计数据
  getStats: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取统计数据:', params)
    return mockDashboardData.getStats(params)
  },
  
  // 获取课程切片统计
  getCourseSliceStats: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取课程切片统计:', params)
    return mockDashboardData.getCourseSliceStats(params)
  },
  
  // 获取提案统计
  getProposalStats: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取提案统计:', params)
    return mockDashboardData.getProposalStats(params)
  },
  
  // 获取反馈趋势
  getFeedbackTrend: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取反馈趋势:', params)
    return mockDashboardData.getFeedbackTrend(params)
  },
  
  // 获取合作统计
  getCooperationStats: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取合作统计:', params)
    return mockDashboardData.getCooperationStats(params)
  },
  
  // 获取最近活动
  getActivities: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取最近活动:', params)
    return mockDashboardData.getActivities(params)
  }
}

// 高校端课程切片 API（使用虚拟接口）
export const courseSliceApi = {
  // 获取列表
  getList: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取课程切片列表:', params)
    return mockCourseSliceData.getList(params)
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
  },
  
  // 获取详情
  getDetail: (id) => {
    console.log('🔵 [高校端虚拟接口] 获取课程切片详情:', id)
    return mockCourseSliceData.getDetail(id)
  }
}

// 高校端提案审批 API（使用虚拟接口）
export const proposalApi = {
  // 获取列表
  getList: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取提案列表:', params)
    return mockProposalData.getList(params)
  },
  
  // 创建
  create: (data) => {
    console.log('🔵 [高校端虚拟接口] 创建提案:', data)
    return mockProposalData.create(data)
  },
  
  // 审批通过
  approve: (id, data) => {
    console.log('🔵 [高校端虚拟接口] 审批通过:', id, data)
    return mockProposalData.approve(id, data)
  },
  
  // 审批拒绝
  reject: (id, data) => {
    console.log('🔵 [高校端虚拟接口] 审批拒绝:', id, data)
    return mockProposalData.reject(id, data)
  },
  
  // 获取详情
  getDetail: (id) => {
    console.log('🔵 [高校端虚拟接口] 获取提案详情:', id)
    return mockProposalData.getDetail(id)
  }
}

// 高校端教学反馈 API（使用虚拟接口）
export const teachingFeedbackApi = {
  // 获取列表
  getList: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取教学反馈列表:', params)
    return mockTeachingFeedbackData.getList(params)
  },
  
  // 获取统计
  getStats: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取教学反馈统计:', params)
    return mockTeachingFeedbackData.getStats(params)
  },
  
  // 获取趋势
  getTrend: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取教学反馈趋势:', params)
    return mockTeachingFeedbackData.getTrend(params)
  },
  
  // 获取详情
  getDetail: (id) => {
    console.log('🔵 [高校端虚拟接口] 获取教学反馈详情:', id)
    return mockTeachingFeedbackData.getDetail(id)
  }
}

// 高校端校企合作 API（使用虚拟接口）
export const cooperationApiUniversity = {
  // 获取列表
  getList: (params) => {
    console.log('🔵 [高校端虚拟接口] 获取校企合作列表:', params)
    return mockCooperationData.getList(params)
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
    console.log('🔵 [高校端虚拟接口] 获取校企合作详情:', id)
    return mockCooperationData.getDetail(id)
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

