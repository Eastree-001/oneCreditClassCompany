import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

// 用户相关 API
export const userApi = {
  // 用户登录
  login: (data) => {
    return request.post(API_ENDPOINTS.USER.LOGIN, data)
  },
  
  // 用户注册
  register: (data) => {
    return request.post(API_ENDPOINTS.USER.REGISTER, data)
  },
  
  // 发送验证码
  sendVerification: (data) => {
    return request.post(API_ENDPOINTS.USER.SEND_VERIFICATION, data)
  },
  
  // 发送重置密码验证码
  sendResetCode: (data) => {
    return request.post(API_ENDPOINTS.USER.SEND_RESET_CODE, data)
  },
  
  // 重置密码
  resetPassword: (data) => {
    return request.post(API_ENDPOINTS.USER.RESET_PASSWORD, data)
  },
  
  // 用户登出
  logout: () => {
    return request.post(API_ENDPOINTS.USER.LOGOUT)
  },
  
  // 获取用户信息
  getProfile: () => {
    return request.get(API_ENDPOINTS.USER.ME)
  }
}

// 统计数据 API
export const dashboardApi = {
  // 获取统计数据
  getStats: (params) => {
    console.log('=== 调用getStats API ===')
    console.log('端点:', API_ENDPOINTS.DASHBOARD.STATS)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.DASHBOARD.STATS, { params })
    console.log('API调用已发送，等待响应...')
    return result
  },
  
  // 获取课程匹配趋势
  getMatchTrend: (params) => {
    console.log('=== 调用getMatchTrend API ===')
    console.log('端点:', API_ENDPOINTS.DASHBOARD.MATCH_TREND)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.DASHBOARD.MATCH_TREND, { params })
    console.log('趋势API调用已发送，等待响应...')
    return result
  },
  
  // 获取岗位画像分布
  getProfileDistribution: (params) => {
    console.log('=== 调用getProfileDistribution API ===')
    console.log('端点:', API_ENDPOINTS.DASHBOARD.PROFILE_DISTRIBUTION)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.DASHBOARD.PROFILE_DISTRIBUTION, { params })
    console.log('岗位画像分布API调用已发送，等待响应...')
    return result
  },
  
  // 获取培训课程完成情况
  getTrainingStatus: (params) => {
    console.log('=== 调用getTrainingStatus API ===')
    console.log('端点:', API_ENDPOINTS.DASHBOARD.TRAINING_STATUS)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.DASHBOARD.TRAINING_STATUS, { params })
    console.log('培训课程完成情况API调用已发送，等待响应...')
    return result
  },
  
  // 获取合作高校统计
  getCooperationStats: (params) => {
    console.log('=== 调用getCooperationStats API ===')
    console.log('端点:', API_ENDPOINTS.DASHBOARD.COOPERATION_STATS)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.DASHBOARD.COOPERATION_STATS, { params })
    console.log('合作高校统计API调用已发送，等待响应...')
    return result
  },
  
  // 获取最近活动记录
  getActivities: (params) => {
    console.log('=== 调用getActivities API ===')
    console.log('端点:', API_ENDPOINTS.DASHBOARD.ACTIVITIES)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.DASHBOARD.ACTIVITIES, { params })
    console.log('最近活动记录API调用已发送，等待响应...')
    return result
  }
}

// 课程相关 API
export const courseApi = {
  // 获取课程列表
  getList: (params) => {
    return request.get(API_ENDPOINTS.COURSE.LIST, { params })
  },
  
  // 获取课程详情
  getDetail: (id) => {
    return request.get(`${API_ENDPOINTS.COURSE.DETAIL}/${id}`)
  },
  
  // 创建课程
  create: (data) => {
    return request.post(API_ENDPOINTS.COURSE.CREATE, data)
  },
  
  // 更新课程
  update: (id, data) => {
    return request.put(`${API_ENDPOINTS.COURSE.UPDATE}/${id}`, data)
  },
  
  // 删除课程
  delete: (id) => {
    return request.delete(`${API_ENDPOINTS.COURSE.DELETE}/${id}`)
  }
}

// 合作相关 API
export const cooperationApi = {
  // 获取合作列表
  getList: (params) => {
    return request.get(API_ENDPOINTS.COOPERATION.LIST, { params })
  },
  
  // 创建合作
  create: (data) => {
    return request.post(API_ENDPOINTS.COOPERATION.CREATE, data)
  },
  
  // 更新合作
  update: (id, data) => {
    return request.put(`${API_ENDPOINTS.COOPERATION.UPDATE}/${id}`, data)
  },
  
  // 删除合作
  delete: (id) => {
    return request.delete(`${API_ENDPOINTS.COOPERATION.DELETE}/${id}`)
  },
  
  // 获取企业合作项目列表（需要token验证）
  getEnterpriseList: (params) => {
    console.log('=== 调用getEnterpriseList API ===')
    console.log('端点:', API_ENDPOINTS.COOPERATION.ENTERPRISE_LIST)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.COOPERATION.ENTERPRISE_LIST, { params })
    console.log('企业合作项目API调用已发送，等待响应...')
    return result
  },
  
  // 获取单个合作项目详情（需要token验证）
  getDetail: (id) => {
    console.log('=== 调用getDetail API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.DETAIL}/${id}`)
    console.log('合作项目ID:', id)
    
    const result = request.get(`${API_ENDPOINTS.COOPERATION.DETAIL}/${id}`)
    console.log('合作项目详情API调用已发送，等待响应...')
    return result
  },
  
  // 创建企业合作项目（需要token验证）
  createEnterprise: (data) => {
    console.log('=== 调用createEnterprise API ===')
    console.log('端点:', API_ENDPOINTS.COOPERATION.ENTERPRISE_CREATE)
    console.log('请求数据:', data)
    
    const result = request.post(API_ENDPOINTS.COOPERATION.ENTERPRISE_CREATE, data)
    console.log('企业合作项目创建API调用已发送，等待响应...')
    return result
  },
  
  // 更新企业合作项目（需要token验证）
  updateEnterprise: (id, data) => {
    console.log('=== 调用updateEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.ENTERPRISE_UPDATE}/${id}`)
    console.log('合作项目ID:', id)
    console.log('更新数据:', data)
    
    const result = request.put(`${API_ENDPOINTS.COOPERATION.ENTERPRISE_UPDATE}/${id}`, data)
    console.log('企业合作项目更新API调用已发送，等待响应...')
    return result
  },
  
  // 更新企业合作项目进度（需要token验证）
  updateProgress: (id, progressData) => {
    console.log('=== 调用updateProgress API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.ENTERPRISE_PROGRESS}/${id}/progress`)
    console.log('合作项目ID:', id)
    console.log('进度数据:', progressData)
    
    const result = request.put(`${API_ENDPOINTS.COOPERATION.ENTERPRISE_PROGRESS}/${id}/progress`, progressData)
    console.log('企业合作项目进度更新API调用已发送，等待响应...')
    return result
  },
  
  // 删除企业合作项目（需要token验证）
  deleteEnterprise: (id) => {
    console.log('=== 调用deleteEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.ENTERPRISE_DELETE}/${id}`)
    console.log('合作项目ID:', id)
    
    const result = request.delete(`${API_ENDPOINTS.COOPERATION.ENTERPRISE_DELETE}/${id}`)
    console.log('企业合作项目删除API调用已发送，等待响应...')
    return result
  },

  // ===== 企业端「校企合作管理」（关系维度）API =====
  // 获取企业侧校企合作关系列表
  getEnterpriseRelationList: (params) => {
    console.log('=== 调用getEnterpriseRelationList API ===')
    console.log('端点:', API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_LIST)
    console.log('参数:', params)

    const result = request.get(API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_LIST, { params })
    console.log('企业侧校企合作关系列表API调用已发送，等待响应...')
    return result
  },

  // 获取单条企业侧校企合作关系详情
  getEnterpriseRelationDetail: (id) => {
    console.log('=== 调用getEnterpriseRelationDetail API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_DETAIL}/${id}`)
    console.log('合作关系ID:', id)

    const result = request.get(`${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_DETAIL}/${id}`)
    console.log('企业侧校企合作关系详情API调用已发送，等待响应...')
    return result
  },

  // 创建企业侧校企合作关系（企业发起合作意向）
  createEnterpriseRelation: (data) => {
    console.log('=== 调用createEnterpriseRelation API ===')
    console.log('端点:', API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_CREATE)
    console.log('请求数据:', data)

    const result = request.post(API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_CREATE, data)
    console.log('企业侧校企合作关系创建API调用已发送，等待响应...')
    return result
  },

  // 更新企业侧校企合作关系（修改备注、时间等基础信息，不改变确认状态）
  updateEnterpriseRelation: (id, data) => {
    console.log('=== 调用updateEnterpriseRelation API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_UPDATE}/${id}`)
    console.log('合作关系ID:', id)
    console.log('更新数据:', data)

    const result = request.put(`${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_UPDATE}/${id}`, data)
    console.log('企业侧校企合作关系更新API调用已发送，等待响应...')
    return result
  },

  // 删除企业侧校企合作关系（逻辑删除或取消）
  deleteEnterpriseRelation: (id) => {
    console.log('=== 调用deleteEnterpriseRelation API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_DELETE}/${id}`)
    console.log('合作关系ID:', id)

    const result = request.delete(`${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_DELETE}/${id}`)
    console.log('企业侧校企合作关系删除API调用已发送，等待响应...')
    return result
  },

  // 企业确认高校发起 / 双方合作关系（双向确认的一方）
  confirmEnterpriseRelation: (id, data) => {
    console.log('=== 调用confirmEnterpriseRelation API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_CONFIRM}/${id}/confirm`)
    console.log('合作关系ID:', id)
    console.log('确认附加数据:', data)

    const result = request.post(`${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_CONFIRM}/${id}/confirm`, data)
    console.log('企业侧校企合作关系确认API调用已发送，等待响应...')
    return result
  },

  // 企业拒绝高校发起 / 取消合作关系
  rejectEnterpriseRelation: (id, data) => {
    console.log('=== 调用rejectEnterpriseRelation API ===')
    console.log('端点:', `${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_REJECT}/${id}/reject`)
    console.log('合作关系ID:', id)
    console.log('拒绝原因数据:', data)

    const result = request.post(`${API_ENDPOINTS.COOPERATION.ENTERPRISE_RELATION_REJECT}/${id}/reject`, data)
    console.log('企业侧校企合作关系拒绝API调用已发送，等待响应...')
    return result
  }
}

// 人才需求相关 API
export const talentDemandApi = {
  // 获取人才需求列表
  getList: (params) => {
    return request.get(API_ENDPOINTS.TALENT_DEMAND.LIST, { params })
  },
  
  // 获取企业人才需求列表（需要token验证）
  getEnterpriseList: (params) => {
    console.log('=== 调用getEnterpriseList API ===')
    console.log('端点:', API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_LIST)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_LIST, { params })
    console.log('企业人才需求API调用已发送，等待响应...')
    return result
  },
  
  // 获取单个人才需求详情（需要token验证）
  getDetail: (id) => {
    console.log('=== 调用getDetail API ===')
    console.log('端点:', `${API_ENDPOINTS.TALENT_DEMAND.DETAIL}/${id}`)
    console.log('人才需求ID:', id)
    
    const result = request.get(`${API_ENDPOINTS.TALENT_DEMAND.DETAIL}/${id}`)
    console.log('人才需求详情API调用已发送，等待响应...')
    return result
  },
  
  // 创建企业人才需求（需要token验证）
  createEnterprise: (data) => {
    console.log('=== 调用createEnterprise API ===')
    console.log('端点:', API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_CREATE)
    console.log('请求数据:', data)
    
    const result = request.post(API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_CREATE, data)
    console.log('企业人才需求创建API调用已发送，等待响应...')
    return result
  },
  
  // 更新企业人才需求（需要token验证）
  updateEnterprise: (id, data) => {
    console.log('=== 调用updateEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_UPDATE}/${id}`)
    console.log('人才需求ID:', id)
    console.log('更新数据:', data)
    
    const result = request.put(`${API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_UPDATE}/${id}`, data)
    console.log('企业人才需求更新API调用已发送，等待响应...')
    return result
  },
  
  // 关闭企业人才需求（需要token验证）
  closeEnterprise: (id) => {
    console.log('=== 调用closeEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_CLOSE}/${id}/close`)
    console.log('人才需求ID:', id)
    
    const result = request.put(`${API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_CLOSE}/${id}/close`)
    console.log('企业人才需求关闭API调用已发送，等待响应...')
    return result
  },
  
  // 删除企业人才需求（需要token验证）
  deleteEnterprise: (id) => {
    console.log('=== 调用deleteEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_DELETE}/${id}`)
    console.log('人才需求ID:', id)
    
    const result = request.delete(`${API_ENDPOINTS.TALENT_DEMAND.ENTERPRISE_DELETE}/${id}`)
    console.log('企业人才需求删除API调用已发送，等待响应...')
    return result
  },
  
  // 获取人才需求申请列表（需要token验证）
  getApplications: (recruitmentId, params) => {
    console.log('=== 调用getApplications API ===')
    console.log('端点:', `${API_ENDPOINTS.TALENT_DEMAND.APPLICATIONS_LIST}/${recruitmentId}/applications`)
    console.log('人才需求ID:', recruitmentId)
    console.log('参数:', params)
    
    const result = request.get(`${API_ENDPOINTS.TALENT_DEMAND.APPLICATIONS_LIST}/${recruitmentId}/applications`, { params })
    console.log('人才需求申请列表API调用已发送，等待响应...')
    return result
  },
  
  // 获取单个申请详情（需要token验证）
  getApplicationDetail: (recruitmentId, applicationId) => {
    console.log('=== 调用getApplicationDetail API ===')
    console.log('端点:', `${API_ENDPOINTS.TALENT_DEMAND.APPLICATION_DETAIL}/${recruitmentId}/applications/${applicationId}`)
    console.log('人才需求ID:', recruitmentId)
    console.log('申请ID:', applicationId)
    
    const result = request.get(`${API_ENDPOINTS.TALENT_DEMAND.APPLICATION_DETAIL}/${recruitmentId}/applications/${applicationId}`)
    console.log('申请详情API调用已发送，等待响应...')
    return result
  },
  
  // 审核通过申请（需要token验证）
  approveApplication: (recruitmentId, applicationId, data) => {
    console.log('=== 调用approveApplication API ===')
    console.log('端点:', `${API_ENDPOINTS.TALENT_DEMAND.APPLICATION_APPROVE}/${recruitmentId}/applications/${applicationId}/approve`)
    console.log('人才需求ID:', recruitmentId)
    console.log('申请ID:', applicationId)
    console.log('审核数据:', data)
    
    const result = request.post(`${API_ENDPOINTS.TALENT_DEMAND.APPLICATION_APPROVE}/${recruitmentId}/applications/${applicationId}/approve`, data)
    console.log('审核通过API调用已发送，等待响应...')
    return result
  },
  
  // 审核拒绝申请（需要token验证）
  rejectApplication: (recruitmentId, applicationId, data) => {
    console.log('=== 调用rejectApplication API ===')
    console.log('端点:', `${API_ENDPOINTS.TALENT_DEMAND.APPLICATION_REJECT}/${recruitmentId}/applications/${applicationId}/reject`)
    console.log('人才需求ID:', recruitmentId)
    console.log('申请ID:', applicationId)
    console.log('拒绝数据:', data)
    
    const result = request.post(`${API_ENDPOINTS.TALENT_DEMAND.APPLICATION_REJECT}/${recruitmentId}/applications/${applicationId}/reject`, data)
    console.log('审核拒绝API调用已发送，等待响应...')
    return result
  },
  
  // 创建人才需求（普通版本）
  create: (data) => {
    return request.post(API_ENDPOINTS.TALENT_DEMAND.CREATE, data)
  },
  
  // 更新人才需求
  update: (id, data) => {
    return request.put(`${API_ENDPOINTS.TALENT_DEMAND.UPDATE}/${id}`, data)
  },
  
  // 删除人才需求
  delete: (id) => {
    return request.delete(`${API_ENDPOINTS.TALENT_DEMAND.DELETE}/${id}`)
  }
}

// 技能画像相关 API
export const skillProfileApi = {
  // 获取技能画像列表
  getList: (params) => {
    return request.get(API_ENDPOINTS.SKILL_PROFILE.LIST, { params })
  },
  
  // 获取企业技能画像列表（需要token验证）
  getEnterpriseList: (params) => {
    console.log('=== 调用getEnterpriseList API ===')
    console.log('端点:', API_ENDPOINTS.SKILL_PROFILE.ENTERPRISE_LIST)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.SKILL_PROFILE.ENTERPRISE_LIST, { params })
    console.log('企业技能画像API调用已发送，等待响应...')
    return result
  },
  
  // 获取单个岗位画像详情（需要token验证）
  getDetail: (id) => {
    console.log('=== 调用getDetail API ===')
    console.log('端点:', `${API_ENDPOINTS.SKILL_PROFILE.DETAIL}/${id}`)
    console.log('岗位画像ID:', id)
    
    const result = request.get(`${API_ENDPOINTS.SKILL_PROFILE.DETAIL}/${id}`)
    console.log('岗位画像详情API调用已发送，等待响应...')
    return result
  },
  
  // 创建企业岗位画像（需要token验证）
  createEnterprise: (data) => {
    console.log('=== 调用createEnterprise API ===')
    console.log('端点:', API_ENDPOINTS.SKILL_PROFILE.ENTERPRISE_CREATE)
    console.log('请求数据:', data)
    
    const result = request.post(API_ENDPOINTS.SKILL_PROFILE.ENTERPRISE_CREATE, data)
    console.log('企业岗位画像创建API调用已发送，等待响应...')
    return result
  },
  
  // 更新企业岗位画像（需要token验证）
  updateEnterprise: (id, data) => {
    console.log('=== 调用updateEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.SKILL_PROFILE.ENTERPRISE_UPDATE}/${id}`)
    console.log('岗位画像ID:', id)
    console.log('更新数据:', data)
    
    const result = request.put(`${API_ENDPOINTS.SKILL_PROFILE.ENTERPRISE_UPDATE}/${id}`, data)
    console.log('企业岗位画像更新API调用已发送，等待响应...')
    return result
  },
  
  // 删除企业岗位画像（需要token验证）
  deleteEnterprise: (id) => {
    console.log('=== 调用deleteEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.SKILL_PROFILE.ENTERPRISE_DELETE}/${id}`)
    console.log('岗位画像ID:', id)
    
    const result = request.delete(`${API_ENDPOINTS.SKILL_PROFILE.ENTERPRISE_DELETE}/${id}`)
    console.log('企业岗位画像删除API调用已发送，等待响应...')
    return result
  },
  
  // 创建技能画像（普通版本）
  create: (data) => {
    return request.post(API_ENDPOINTS.SKILL_PROFILE.CREATE, data)
  },
  
  // 更新技能画像
  update: (id, data) => {
    return request.put(`${API_ENDPOINTS.SKILL_PROFILE.UPDATE}/${id}`, data)
  },
  
  // 删除技能画像
  delete: (id) => {
    return request.delete(`${API_ENDPOINTS.SKILL_PROFILE.DELETE}/${id}`)
  }
}

// 培训相关 API
export const trainingApi = {
  // 获取培训列表
  getList: (params) => {
    return request.get(API_ENDPOINTS.TRAINING.LIST, { params })
  },
  
  // 获取企业培训课程列表（需要token验证）
  getEnterpriseList: (params) => {
    console.log('=== 调用getEnterpriseList API ===')
    console.log('端点:', API_ENDPOINTS.TRAINING.ENTERPRISE_LIST)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.TRAINING.ENTERPRISE_LIST, { params })
    console.log('企业培训课程API调用已发送，等待响应...')
    return result
  },
  
  // 获取可选课程列表（需要token验证）
  getAvailableCourses: (params) => {
    console.log('=== 调用getAvailableCourses API ===')
    console.log('端点:', API_ENDPOINTS.TRAINING.ENTERPRISE_AVAILABLE_COURSES)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.TRAINING.ENTERPRISE_AVAILABLE_COURSES, { params })
    console.log('可选课程API调用已发送，等待响应...')
    return result
  },
  
  // 获取单个培训课程详情（需要token验证）
  getDetail: (id) => {
    console.log('=== 调用getDetail API ===')
    console.log('端点:', `${API_ENDPOINTS.TRAINING.DETAIL}/${id}`)
    console.log('培训课程ID:', id)
    
    const result = request.get(`${API_ENDPOINTS.TRAINING.DETAIL}/${id}`)
    console.log('培训课程详情API调用已发送，等待响应...')
    return result
  },
  
  // 创建企业培训课程（需要token验证）
  createEnterprise: (data) => {
    console.log('=== 调用createEnterprise API ===')
    console.log('端点:', API_ENDPOINTS.TRAINING.ENTERPRISE_CREATE)
    console.log('请求数据:', data)
    
    const result = request.post(API_ENDPOINTS.TRAINING.ENTERPRISE_CREATE, data)
    console.log('企业培训课程创建API调用已发送，等待响应...')
    return result
  },
  
  // 更新企业培训课程（需要token验证）
  updateEnterprise: (id, data) => {
    console.log('=== 调用updateEnterprise API ===')
    const url = `${API_ENDPOINTS.TRAINING.ENTERPRISE_UPDATE}/${id}`
    console.log('完整URL:', url)
    console.log('端点:', API_ENDPOINTS.TRAINING.ENTERPRISE_UPDATE)
    console.log('培训课程ID:', id)
    console.log('更新数据:', data)
    console.log('课程数据详情:', {
      courses: data.courses,
      coursesType: typeof data.courses,
      coursesLength: data.courses ? data.courses.length : 0
    })
    
    const result = request.put(url, data)
    console.log('企业培训课程更新API调用已发送，等待响应...')
    return result
  },
  
  // 更新企业培训课程进度（需要token验证）
  updateProgress: (id, progressData) => {
    console.log('=== 调用updateProgress API ===')
    console.log('端点:', `${API_ENDPOINTS.TRAINING.ENTERPRISE_PROGRESS}/${id}/progress`)
    console.log('培训课程ID:', id)
    console.log('进度数据:', progressData)
    
    const result = request.put(`${API_ENDPOINTS.TRAINING.ENTERPRISE_PROGRESS}/${id}/progress`, progressData)
    console.log('企业培训课程进度更新API调用已发送，等待响应...')
    return result
  },
  
  // 删除企业培训课程（需要token验证）
  deleteEnterprise: (id) => {
    console.log('=== 调用deleteEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.TRAINING.ENTERPRISE_DELETE}/${id}`)
    console.log('培训课程ID:', id)
    
    const result = request.delete(`${API_ENDPOINTS.TRAINING.ENTERPRISE_DELETE}/${id}`)
    console.log('企业培训课程删除API调用已发送，等待响应...')
    return result
  },
  
  // 创建培训（普通版本）
  create: (data) => {
    return request.post(API_ENDPOINTS.TRAINING.CREATE, data)
  },
  
  // 更新培训
  update: (id, data) => {
    return request.put(`${API_ENDPOINTS.TRAINING.UPDATE}/${id}`, data)
  },
  
  // 删除培训
  delete: (id) => {
    return request.delete(`${API_ENDPOINTS.TRAINING.DELETE}/${id}`)
  }
}

// 课程匹配相关 API
export const courseMatchApi = {
  // 课程匹配
  match: (data) => {
    return request.post(API_ENDPOINTS.COURSE_MATCH.MATCH, data)
  },
  
  // 获取匹配历史
  getHistory: (params) => {
    return request.get(API_ENDPOINTS.COURSE_MATCH.HISTORY, { params })
  },
  
  // 获取岗位画像列表
  getProfiles: (params) => {
    console.log('=== 调用getProfiles API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.PROFILES)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.COURSE_MATCH.PROFILES, { params })
    console.log('岗位画像列表API调用已发送，等待响应...')
    return result
  },
  
  // 获取匹配结果
  getResults: (params) => {
    console.log('=== 调用getResults API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.RESULTS)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.COURSE_MATCH.RESULTS, { params })
    console.log('匹配结果API调用已发送，等待响应...')
    return result
  },
  
  // 刷新匹配结果
  refreshResults: (params) => {
    console.log('=== 调用refreshResults API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.REFRESH)
    console.log('参数:', params)
    
    const result = request.post(API_ENDPOINTS.COURSE_MATCH.REFRESH, params)
    console.log('刷新匹配结果API调用已发送，等待响应...')
    return result
  },
  
  // 获取匹配度分析
  getAnalysis: (params) => {
    console.log('=== 调用getAnalysis API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.ANALYSIS)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.COURSE_MATCH.ANALYSIS, { params })
    console.log('匹配度分析API调用已发送，等待响应...')
    return result
  },
  
  // 获取优化建议
  getSuggestions: (params) => {
    console.log('=== 调用getSuggestions API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.SUGGESTIONS)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.COURSE_MATCH.SUGGESTIONS, { params })
    console.log('优化建议API调用已发送，等待响应...')
    return result
  },
  
  // 获取课程匹配统计数据
  getStats: (params) => {
    console.log('=== 调用getStats API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.STATS)
    console.log('参数:', params)
    
    const result = request.get(API_ENDPOINTS.COURSE_MATCH.STATS, { params })
    console.log('课程匹配统计API调用已发送，等待响应...')
    return result
  }
}

// 导出所有 API
export default {
  userApi,
  dashboardApi,
  courseApi,
  cooperationApi,
  talentDemandApi,
  skillProfileApi,
  trainingApi,
  courseMatchApi
}