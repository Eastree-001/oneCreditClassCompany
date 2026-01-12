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
  },

  // 获取企业列表
  getEnterpriseList: (params) => {
    console.log('📋 获取企业列表:', params)
    return request.get('/common/enterprise/list', { params })
  },

  // 获取高校列表
  getUniversityList: (params) => {
    console.log('📋 获取高校列表:', params)
    return request.get('/common/university/list', { params })
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

  // 获取技能列表（用于下拉选择）
  getSkillsList: () => {
    console.log('=== 调用getSkillsList API ===')
    console.log('端点:', '/enterprise/skill-profiles/skills')

    const result = request.get('/enterprise/skill-profiles/skills')
    console.log('技能列表API调用已发送，等待响应...')
    return result
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

// AI课程计划相关 API
export const aiCoursePlanApi = {
  // 获取AI课程计划列表
  getList: (params) => {
    return request.get(API_ENDPOINTS.AI_COURSE_PLAN.LIST, { params })
  },

  // 获取企业AI课程计划列表（需要token验证）
  getEnterpriseList: (params) => {
    console.log('=== 调用getEnterpriseList API ===')
    console.log('端点:', API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_LIST)
    console.log('参数:', params)

    const result = request.get(API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_LIST, { params })
    console.log('企业AI课程计划API调用已发送，等待响应...')
    return result
  },

  // 获取可选课程列表（需要token验证）
  getAvailableCourses: (params) => {
    console.log('=== 调用getAvailableCourses API ===')
    console.log('端点:', API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_AVAILABLE_COURSES)
    console.log('参数:', params)

    const result = request.get(API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_AVAILABLE_COURSES, { params })
    console.log('可选课程API调用已发送，等待响应...')
    return result
  },

  // 获取单个AI课程计划详情（需要token验证）
  getDetail: (id) => {
    console.log('=== 调用getDetail API ===')
    console.log('端点:', `${API_ENDPOINTS.AI_COURSE_PLAN.DETAIL}/${id}`)
    console.log('AI课程计划ID:', id)

    const result = request.get(`${API_ENDPOINTS.AI_COURSE_PLAN.DETAIL}/${id}`)
    console.log('AI课程计划详情API调用已发送，等待响应...')
    return result
  },

  // 创建企业AI课程计划（需要token验证）
  createEnterprise: (data) => {
    console.log('=== 调用createEnterprise API ===')
    console.log('端点:', API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_CREATE)
    console.log('请求数据:', data)

    const result = request.post(API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_CREATE, data)
    console.log('企业AI课程计划创建API调用已发送，等待响应...')
    return result
  },

  // 更新企业AI课程计划（需要token验证）
  updateEnterprise: (id, data) => {
    console.log('=== 调用updateEnterprise API ===')
    const url = `${API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_UPDATE}/${id}`
    console.log('完整URL:', url)
    console.log('端点:', API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_UPDATE)
    console.log('AI课程计划ID:', id)
    console.log('更新数据:', data)
    console.log('课程数据详情:', {
      courses: data.courses,
      coursesType: typeof data.courses,
      coursesLength: data.courses ? data.courses.length : 0
    })

    const result = request.put(url, data)
    console.log('企业AI课程计划更新API调用已发送，等待响应...')
    return result
  },

  // 更新企业AI课程计划进度（需要token验证）
  updateProgress: (id, progressData) => {
    console.log('=== 调用updateProgress API ===')
    console.log('端点:', `${API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_PROGRESS}/${id}/progress`)
    console.log('AI课程计划ID:', id)
    console.log('进度数据:', progressData)

    const result = request.put(`${API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_PROGRESS}/${id}/progress`, progressData)
    console.log('企业AI课程计划进度更新API调用已发送，等待响应...')
    return result
  },

  // 删除企业AI课程计划（需要token验证）
  deleteEnterprise: (id) => {
    console.log('=== 调用deleteEnterprise API ===')
    console.log('端点:', `${API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_DELETE}/${id}`)
    console.log('AI课程计划ID:', id)

    const result = request.delete(`${API_ENDPOINTS.AI_COURSE_PLAN.ENTERPRISE_DELETE}/${id}`)
    console.log('企业AI课程计划删除API调用已发送，等待响应...')
    return result
  },

  // 创建AI课程计划（普通版本）
  create: (data) => {
    return request.post(API_ENDPOINTS.AI_COURSE_PLAN.CREATE, data)
  },

  // 更新AI课程计划
  update: (id, data) => {
    return request.put(`${API_ENDPOINTS.AI_COURSE_PLAN.UPDATE}/${id}`, data)
  },

  // 删除AI课程计划
  delete: (id) => {
    return request.delete(`${API_ENDPOINTS.AI_COURSE_PLAN.DELETE}/${id}`)
  },

  // 选择高校审批课程
  selectUniversity: (aiCourseId, data) => {
    console.log('=== 调用selectUniversity API ===')
    console.log('端点:', `${API_ENDPOINTS.AI_COURSE_PLAN.SELECT_UNIVERSITY}/${aiCourseId}/select-university`)
    console.log('AI课程ID:', aiCourseId)
    console.log('请求数据:', data)

    const result = request.post(`${API_ENDPOINTS.AI_COURSE_PLAN.SELECT_UNIVERSITY}/${aiCourseId}/select-university`, data)
    console.log('选择高校审批API调用已发送，等待响应...')
    return result
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
  },

  // 获取 AI 课程列表
  getAiCourses: (params) => {
    console.log('=== 调用getAiCourses API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.AI_COURSES)
    console.log('参数:', params)

    const result = request.get(API_ENDPOINTS.COURSE_MATCH.AI_COURSES, { params })
    console.log('AI课程列表API调用已发送，等待响应...')
    return result
  },

  // 根据岗位画像获取匹配的 AI 课程
  getAiCoursesByProfile: (skillProfileId) => {
    console.log('=== 调用getAiCoursesByProfile API ===')
    console.log('端点:', `/enterprise/ai-courses/skill-profile/${skillProfileId}`)
    console.log('岗位画像ID:', skillProfileId)

    const result = request.get(`/enterprise/ai-courses/skill-profile/${skillProfileId}`)
    console.log('根据岗位画像获取AI课程API调用已发送，等待响应...')
    return result
  },

  // 根据岗位画像ID生成AI课程
  generateAiCourse: (skillProfileId) => {
    console.log('=== 调用generateAiCourse API ===')
    console.log('端点:', `/enterprise/dify/generate-course/${skillProfileId}`)
    console.log('岗位画像ID:', skillProfileId)

    const result = request.post(`/enterprise/dify/generate-course/${skillProfileId}`)
    console.log('生成AI课程API调用已发送，等待响应...')
    return result
  },

  // 根据岗位画像ID获取AI课程列表(包含详细章节内容)
  getAiCoursesBySkillProfile: (skillProfileId) => {
    console.log('=== 调用getAiCoursesBySkillProfile API ===')
    console.log('端点:', `/enterprise/ai-courses/skill-profile/${skillProfileId}`)
    console.log('岗位画像ID:', skillProfileId)

    const result = request.get(`/enterprise/ai-courses/skill-profile/${skillProfileId}`)
    console.log('根据岗位画像获取AI课程详细内容API调用已发送，等待响应...')
    return result
  },


  // Coze智能体匹配课程
  cozeMatch: (profileId) => {
    console.log('=== 调用cozeMatch API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.COZE_MATCH)
    console.log('岗位画像ID:', profileId)

    const result = request.post(API_ENDPOINTS.COURSE_MATCH.COZE_MATCH, { profileId })
    console.log('Coze智能体匹配课程API调用已发送，等待响应...')
    return result
  },

  // 加入计划
  addToPlan: (data) => {
    console.log('=== 调用addToPlan API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.ADD_TO_PLAN)
    console.log('请求数据:', data)

    const result = request.post(API_ENDPOINTS.COURSE_MATCH.ADD_TO_PLAN, data)
    console.log('加入计划API调用已发送，等待响应...')
    return result
  },

  // 获取已加入计划的课程
  getAddedToPlan: (params) => {
    console.log('=== 调用getAddedToPlan API ===')
    console.log('端点:', '/enterprise/course-match/added-to-plan')
    console.log('参数:', params)

    const result = request.get('/enterprise/course-match/added-to-plan', { params })
    console.log('获取已加入计划课程API调用已发送，等待响应...')
    return result
  },

  // 移除课程
  removeFromPlan: (data) => {
    console.log('=== 调用removeFromPlan API ===')
    console.log('端点:', API_ENDPOINTS.COURSE_MATCH.REMOVE_FROM_PLAN)
    console.log('请求数据:', data)

    const result = request.post(API_ENDPOINTS.COURSE_MATCH.REMOVE_FROM_PLAN, data)
    console.log('移除课程API调用已发送，等待响应...')
    return result
  }
}

// 高校端AI课程审批相关 API
export const universityAiCourseAuditApi = {
  // 获取待审批列表
  getPendingList: (params) => {
    console.log('=== 调用getPendingList API ===')
    console.log('端点:', API_ENDPOINTS.UNIVERSITY_AI_COURSE_AUDIT.PENDING)
    console.log('参数:', params)

    const result = request.get(API_ENDPOINTS.UNIVERSITY_AI_COURSE_AUDIT.PENDING, { params })
    console.log('待审批列表API调用已发送，等待响应...')
    return result
  },

  // 获取所有审批记录列表
  getList: (params) => {
    console.log('=== 调用getList API ===')
    console.log('端点:', API_ENDPOINTS.UNIVERSITY_AI_COURSE_AUDIT.LIST)
    console.log('参数:', params)

    const result = request.get(API_ENDPOINTS.UNIVERSITY_AI_COURSE_AUDIT.LIST, { params })
    console.log('审批记录列表API调用已发送，等待响应...')
    return result
  },

  // 获取审批详情
  getDetail: (auditId) => {
    console.log('=== 调用getDetail API ===')
    console.log('端点:', `${API_ENDPOINTS.UNIVERSITY_AI_COURSE_AUDIT.DETAIL}/${auditId}`)
    console.log('审批ID:', auditId)

    const result = request.get(`${API_ENDPOINTS.UNIVERSITY_AI_COURSE_AUDIT.DETAIL}/${auditId}`)
    console.log('审批详情API调用已发送，等待响应...')
    return result
  },

  // 审批AI课程
  approve: (auditId, data) => {
    console.log('=== 调用approve API ===')
    console.log('端点:', `${API_ENDPOINTS.UNIVERSITY_AI_COURSE_AUDIT.APPROVE}/${auditId}/approve`)
    console.log('审批ID:', auditId)
    console.log('请求数据:', data)

    const result = request.post(`${API_ENDPOINTS.UNIVERSITY_AI_COURSE_AUDIT.APPROVE}/${auditId}/approve`, data)
    console.log('审批AI课程API调用已发送，等待响应...')
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
  aiCoursePlanApi,
  courseMatchApi,
  universityAiCourseAuditApi
}