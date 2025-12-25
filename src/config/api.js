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
    ENTERPRISE_LIST: '/enterprise/cooperation-projects',  // GET /enterprise/cooperation-projects
    ENTERPRISE_CREATE: '/enterprise/cooperation-projects',  // POST /enterprise/cooperation-projects
    ENTERPRISE_UPDATE: '/enterprise/cooperation-projects',  // PUT /enterprise/cooperation-projects/{id}
    ENTERPRISE_DELETE: '/enterprise/cooperation-projects',  // DELETE /enterprise/cooperation-projects/{id}
    ENTERPRISE_PROGRESS: '/enterprise/cooperation-projects',  // PUT /enterprise/cooperation-projects/{id}/progress
    DETAIL: '/enterprise/cooperation-projects'  // GET /enterprise/cooperation-projects/{id}
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
    DETAIL: '/enterprise/talent-demands'  // GET /enterprise/talent-demands/{id}
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
  
  // 培训相关
  TRAINING: {
    LIST: '/training/list',
    CREATE: '/training/create',
    UPDATE: '/training/update',
    DELETE: '/training/delete',
    ENTERPRISE_LIST: '/enterprise/training-plans',  // GET /enterprise/training-plans
    ENTERPRISE_CREATE: '/enterprise/training-plans',  // POST /enterprise/training-plans
    ENTERPRISE_UPDATE: '/enterprise/training-plans',  // PUT /enterprise/training-plans/{id}
    ENTERPRISE_DELETE: '/enterprise/training-plans',  // DELETE /enterprise/training-plans/{id}
    ENTERPRISE_PROGRESS: '/enterprise/training-plans',  // PUT /enterprise/training-plans/{id}/progress
    ENTERPRISE_AVAILABLE_COURSES: '/enterprise/training-plans/available-courses',  // GET /enterprise/training-plans/available-courses
    DETAIL: '/enterprise/training-plans'  // GET /enterprise/training-plans/{id}
  },
  
  // 课程匹配相关
  COURSE_MATCH: {
    MATCH: '/course-match/match',
    HISTORY: '/course-match/history',
    PROFILES: '/enterprise/course-match/profiles',
    RESULTS: '/enterprise/course-match/results',
    REFRESH: '/enterprise/course-match/refresh',
    ANALYSIS: '/enterprise/course-match/analysis',
    SUGGESTIONS: '/enterprise/course-match/suggestions'
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