// API 配置文件
export const API_CONFIG = {
  // 严格从环境变量读取 API 地址，确保修改.env即可生效
  // 注意：请确保.env文件中正确配置了VITE_API_BASE_URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL
}

// API 接口路径
export const API_ENDPOINTS = {
  // 用户相关
  USER: {
    LOGIN: '/enterprise/auth/login',
    REGISTER: '/enterprise/auth/register',
    LOGOUT: '/enterprise/auth/logout',
    ME: '/enterprise/auth/me',
    SEND_VERIFICATION: '/enterprise/auth/send-verification',
    SEND_RESET_CODE: '/enterprise/auth/send-reset-code',
    RESET_PASSWORD: '/enterprise/auth/reset-password-with-code'
  },
  
  // 统计数据相关
  DASHBOARD: {
    STATS: '/enterprise/dashboard/stats',
    MATCH_TREND: '/enterprise/dashboard/match-trend',
    PROFILE_DISTRIBUTION: '/enterprise/dashboard/profile-distribution',
    TRAINING_STATUS: '/enterprise/dashboard/training-status',
    COOPERATION_STATS: '/enterprise/dashboard/cooperation-stats',
    ACTIVITIES: '/enterprise/dashboard/activities'
  },
  
  // 课程相关
  COURSE: {
    LIST: '/course/list',
    DETAIL: '/course/detail',
    CREATE: '/course/create',
    UPDATE: '/course/update',
    DELETE: '/course/delete'
  },
  
  // 合作相关
  COOPERATION: {
    LIST: '/cooperation/list',
    CREATE: '/cooperation/create',
    UPDATE: '/cooperation/update',
    DELETE: '/cooperation/delete',
    // 企业侧「合作项目管理」（已存在）
    ENTERPRISE_LIST: '/enterprise/cooperation-projects',  // GET /enterprise/cooperation-projects
    ENTERPRISE_CREATE: '/enterprise/cooperation-projects',  // POST /enterprise/cooperation-projects
    ENTERPRISE_UPDATE: '/enterprise/cooperation-projects',  // PUT /enterprise/cooperation-projects/{id}
    ENTERPRISE_DELETE: '/enterprise/cooperation-projects',  // DELETE /enterprise/cooperation-projects/{id}
    ENTERPRISE_PROGRESS: '/enterprise/cooperation-projects',  // PUT /enterprise/cooperation-projects/{id}/progress
    DETAIL: '/enterprise/cooperation-projects',  // GET /enterprise/cooperation-projects/{id}

    // 企业侧「校企合作管理」（与高校端 /university/cooperation 对应的一套关系维度接口）
    ENTERPRISE_RELATION_LIST: '/enterprise/cooperations',           // GET  /enterprise/cooperations
    ENTERPRISE_RELATION_CREATE: '/enterprise/cooperations',        // POST /enterprise/cooperations
    ENTERPRISE_RELATION_UPDATE: '/enterprise/cooperations',        // PUT  /enterprise/cooperations/{id}
    ENTERPRISE_RELATION_DELETE: '/enterprise/cooperations',        // DELETE /enterprise/cooperations/{id}
    ENTERPRISE_RELATION_DETAIL: '/enterprise/cooperations',        // GET  /enterprise/cooperations/{id}
    ENTERPRISE_RELATION_CONFIRM: '/enterprise/cooperations',       // POST /enterprise/cooperations/{id}/confirm
    ENTERPRISE_RELATION_REJECT: '/enterprise/cooperations'         // POST /enterprise/cooperations/{id}/reject
  },
  
  // 人才需求相关
  TALENT_DEMAND: {
    LIST: '/talent-demand/list',
    CREATE: '/talent-demand/create',
    UPDATE: '/talent-demand/update',
    DELETE: '/talent-demand/delete',
    ENTERPRISE_LIST: '/enterprise/talent-demands',  // GET /enterprise/talent-demands
    ENTERPRISE_CREATE: '/enterprise/talent-demands',  // POST /enterprise/talent-demands
    ENTERPRISE_UPDATE: '/enterprise/talent-demands',  // PUT /enterprise/talent-demands/{id}
    ENTERPRISE_DELETE: '/enterprise/talent-demands',  // DELETE /enterprise/talent-demands/{id}
    ENTERPRISE_CLOSE: '/enterprise/talent-demands',  // PUT /enterprise/talent-demands/{id}/close
    DETAIL: '/enterprise/talent-demands',  // GET /enterprise/talent-demands/{id}
    // 人才需求申请相关
    APPLICATIONS_LIST: '/enterprise/talent-demands',  // GET /enterprise/talent-demands/{id}/applications
    APPLICATION_DETAIL: '/enterprise/talent-demands',  // GET /enterprise/talent-demands/{recruitmentId}/applications/{applicationId}
    APPLICATION_APPROVE: '/enterprise/talent-demands',  // POST /enterprise/talent-demands/{recruitmentId}/applications/{applicationId}/approve
    APPLICATION_REJECT: '/enterprise/talent-demands'  // POST /enterprise/talent-demands/{recruitmentId}/applications/{applicationId}/reject
  },
  
  // 技能画像相关
  SKILL_PROFILE: {
    LIST: '/skill-profile/list',
    CREATE: '/skill-profile/create',
    UPDATE: '/skill-profile/update',
    DELETE: '/skill-profile/delete',
    ENTERPRISE_LIST: '/enterprise/skill-profiles',
    ENTERPRISE_CREATE: '/enterprise/skill-profiles',  // POST /enterprise/skill-profiles
    ENTERPRISE_UPDATE: '/enterprise/skill-profiles',  // PUT /enterprise/skill-profiles/{id}
    ENTERPRISE_DELETE: '/enterprise/skill-profiles',  // DELETE /enterprise/skill-profiles/{id}
    DETAIL: '/enterprise/skill-profiles'  // GET /enterprise/skill-profiles/{id}
  },
  
  // AI课程计划相关
  AI_COURSE_PLAN: {
    LIST: '/ai-course-plan/list',
    CREATE: '/ai-course-plan/create',
    UPDATE: '/ai-course-plan/update',
    DELETE: '/ai-course-plan/delete',
    ENTERPRISE_LIST: '/enterprise/ai-course-plans',  // GET /enterprise/ai-course-plans
    ENTERPRISE_CREATE: '/enterprise/ai-course-plans',  // POST /enterprise/ai-course-plans
    ENTERPRISE_UPDATE: '/enterprise/ai-course-plans',  // PUT /enterprise/ai-course-plans/{id}
    ENTERPRISE_DELETE: '/enterprise/ai-course-plans',  // DELETE /enterprise/ai-course-plans/{id}
    ENTERPRISE_PROGRESS: '/enterprise/ai-course-plans',  // PUT /enterprise/ai-course-plans/{id}/progress
    ENTERPRISE_AVAILABLE_COURSES: '/enterprise/ai-course-plans/available-courses',  // GET /enterprise/ai-course-plans/available-courses
    DETAIL: '/enterprise/ai-course-plans',  // GET /enterprise/ai-course-plans/{id}
    // AI课程相关
    AI_COURSES: '/enterprise/ai-courses',  // GET /enterprise/ai-courses
    SELECT_UNIVERSITY: '/enterprise/ai-courses'  // POST /enterprise/ai-courses/:aiCourseId/select-university
  },
  
  // 课程匹配相关
  COURSE_MATCH: {
    MATCH: '/course-match/match',
    HISTORY: '/course-match/history',
    PROFILES: '/enterprise/course-match/profiles',
    RESULTS: '/enterprise/course-match/results',
    SUGGESTIONS: '/enterprise/course-match/suggestions',
    STATS: '/enterprise/course-match/stats',
    // AI 课程列表
    AI_COURSES: '/enterprise/ai-courses',
    // 生成AI课程
    GENERATE_COURSE: '/enterprise/dify/generate-course',
    // Coze智能体匹配课程
    COZE_MATCH: '/enterprise/course-match/coze-match',
    // 加入计划
    ADD_TO_PLAN: '/enterprise/course-match/add-to-plan',
    // 移除课程
    REMOVE_FROM_PLAN: '/enterprise/course-match/remove-from-plan'
  },

  // 高校端AI课程审批相关
  UNIVERSITY_AI_COURSE_AUDIT: {
    PENDING: '/university/ai-courses-audit/pending',
    LIST: '/university/ai-courses-audit/list',
    DETAIL: '/university/ai-courses-audit',
    APPROVE: '/university/ai-courses-audit'
  }
}

// 获取完整的 API URL
export const getApiUrl = (endpoint) => {
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`
  console.log('构建API URL:', {
    base_url: API_CONFIG.BASE_URL,
    endpoint: endpoint,
    full_url: fullUrl
  })
  return fullUrl
}