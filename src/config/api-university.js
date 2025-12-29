// 高校端 API 配置文件
export const API_CONFIG_UNIVERSITY = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL
}

// 高校端 API 接口路径
export const API_ENDPOINTS_UNIVERSITY = {
  // 用户相关
  USER: {
    LOGIN: '/university/auth/login',
    REGISTER: '/university/auth/register',
    LOGOUT: '/university/auth/logout',
    ME: '/university/auth/me'
  },
  
  // 统计数据相关
  DASHBOARD: {
    STATS: '/university/dashboard/stats',
    COURSE_SLICE_STATS: '/university/dashboard/course-slice-stats',
    PROPOSAL_STATS: '/university/dashboard/proposal-stats',
    FEEDBACK_TREND: '/university/dashboard/feedback-trend',
    COOPERATION_STATS: '/university/dashboard/cooperation-stats',
    ACTIVITIES: '/university/dashboard/activities'
  },
  
  // 课程切片相关
  COURSE_SLICE: {
    LIST: '/university/course-slice/list',
    CREATE: '/university/course-slice/create',
    UPDATE: '/university/course-slice/update',
    DELETE: '/university/course-slice/delete',
    DETAIL: '/university/course-slice'
  },
  
  // 提案审批相关
  PROPOSAL: {
    LIST: '/university/proposal/list',
    CREATE: '/university/proposal/create',
    APPROVE: '/university/proposal/approve',
    REJECT: '/university/proposal/reject',
    DETAIL: '/university/proposal'
  },
  
  // 教学反馈相关
  TEACHING_FEEDBACK: {
    LIST: '/university/teaching-feedback/list',
    STATS: '/university/teaching-feedback/stats',
    TREND: '/university/teaching-feedback/trend',
    DETAIL: '/university/teaching-feedback'
  },
  
  // 校企合作相关
  COOPERATION: {
    LIST: '/university/cooperation/list',
    CREATE: '/university/cooperation/create',
    UPDATE: '/university/cooperation/update',
    DELETE: '/university/cooperation/delete',
    DETAIL: '/university/cooperation'
  }
}

// 获取完整的 API URL
export const getApiUrlUniversity = (endpoint) => {
  const fullUrl = `${API_CONFIG_UNIVERSITY.BASE_URL}${endpoint}`
  return fullUrl
}

