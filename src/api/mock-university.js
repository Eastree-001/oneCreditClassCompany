// 高校端模拟数据

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 用户相关模拟数据
export const mockUserData = {
  login: (credentials) => {
    return delay(800).then(() => {
      // 使用demo-token-university-前缀，以便store能识别
      const token = 'demo-token-university-' + Date.now()
      const userInfo = {
        id: 1,
        username: credentials.username,
        universityName: '演示高校',
        email: credentials.username + '@university.edu.cn',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }
      // 返回格式兼容store的处理逻辑
      return {
        code: 200,
        message: '登录成功',
        token: token,
        userInfo: userInfo,
        data: {
          token: token,
          userInfo: userInfo
        }
      }
    })
  },
  
  register: (data) => {
    return delay(1000).then(() => ({
      code: 200,
      message: '注册成功',
      data: {
        id: Date.now(),
        username: data.username,
        universityName: data.universityName
      }
    }))
  },
  
  logout: () => {
    return delay(300).then(() => ({
      code: 200,
      message: '退出成功'
    }))
  },
  
  getProfile: () => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        id: 1,
        username: 'admin',
        universityName: '演示高校',
        email: 'admin@university.edu.cn',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }
    }))
  }
}

// 统计数据模拟数据
export const mockDashboardData = {
  getStats: () => {
    return delay(600).then(() => ({
      code: 200,
      data: {
        courseSliceCount: 128,
        pendingProposalCount: 15,
        feedbackCount: 342,
        cooperationCount: 28
      }
    }))
  },
  
  getCourseSliceStats: () => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        categories: ['Java', 'Python', '前端', '数据库', '算法', '其他'],
        values: [32, 28, 24, 18, 15, 11]
      }
    }))
  },
  
  getProposalStats: () => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        pending: 8,
        approved: 5,
        rejected: 2
      }
    }))
  },
  
  getFeedbackTrend: () => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        values: [120, 132, 101, 134, 90, 230]
      }
    }))
  },
  
  getCooperationStats: () => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        categories: ['互联网', '金融', '制造业', '教育', '其他'],
        values: [12, 8, 5, 2, 1]
      }
    }))
  },
  
  getActivities: () => {
    return delay(500).then(() => ({
      code: 200,
      data: [
        { id: 1, title: '新增课程切片', content: '《Java程序设计》课程已创建5个技能切片', time: '2024-01-15 10:30' },
        { id: 2, title: '提案审批', content: '《人工智能专业共建》提案已通过审批', time: '2024-01-15 09:20' },
        { id: 3, title: '教学反馈', content: '收到15条新的教学反馈数据', time: '2024-01-14 16:45' },
        { id: 4, title: '校企合作', content: '与XX科技公司签署合作协议', time: '2024-01-14 14:20' }
      ]
    }))
  }
}

// 课程切片模拟数据
export const mockCourseSliceData = {
  getList: (params) => {
    return delay(600).then(() => ({
      code: 200,
      data: {
        list: [
          {
            id: 1,
            courseName: 'Java程序设计',
            category: '编程语言',
            sliceCount: 8,
            skillCount: 15,
            updateTime: '2024-01-15 10:30:00'
          },
          {
            id: 2,
            courseName: 'Python数据分析',
            category: '编程语言',
            sliceCount: 6,
            skillCount: 12,
            updateTime: '2024-01-14 15:20:00'
          },
          {
            id: 3,
            courseName: 'Vue.js前端开发',
            category: '前端开发',
            sliceCount: 10,
            skillCount: 18,
            updateTime: '2024-01-13 09:15:00'
          },
          {
            id: 4,
            courseName: 'MySQL数据库',
            category: '数据库',
            sliceCount: 5,
            skillCount: 10,
            updateTime: '2024-01-12 14:45:00'
          }
        ],
        total: 4
      }
    }))
  },
  
  create: (data) => {
    return delay(800).then(() => ({
      code: 200,
      message: '创建成功',
      data: {
        id: Date.now(),
        ...data
      }
    }))
  },
  
  update: (id, data) => {
    return delay(800).then(() => ({
      code: 200,
      message: '更新成功',
      data: {
        id,
        ...data
      }
    }))
  },
  
  delete: (id) => {
    return delay(500).then(() => ({
      code: 200,
      message: '删除成功'
    }))
  },
  
  getDetail: (id) => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        id: parseInt(id),
        courseName: 'Java程序设计',
        category: '编程语言',
        description: 'Java程序设计课程',
        slices: [
          {
            name: 'Java基础语法',
            skills: ['java-basic', 'oop']
          }
        ]
      }
    }))
  }
}

// 提案审批模拟数据
export const mockProposalData = {
  getList: (params) => {
    return delay(600).then(() => ({
      code: 200,
      data: {
        list: [
          {
            id: 1,
            title: '人工智能专业共建提案',
            type: '专业共建',
            proposer: '张教授',
            proposalTime: '2024-01-10 14:30:00',
            status: '待审批',
            approver: '',
            approvalTime: '',
            content: '为适应人工智能产业发展需求，建议与企业合作共建人工智能专业，培养符合行业需求的高素质人才...',
            attachments: [
              { name: '提案文档.pdf', url: '#' }
            ]
          },
          {
            id: 2,
            title: 'Java企业级开发共建课程',
            type: '共建课程',
            proposer: '李老师',
            proposalTime: '2024-01-08 10:20:00',
            status: '已通过',
            approver: '王主任',
            approvalTime: '2024-01-12 16:45:00',
            content: '与企业合作开发Java企业级开发课程，引入真实项目案例...',
            attachments: []
          },
          {
            id: 3,
            title: '大数据分析专业共建',
            type: '专业共建',
            proposer: '刘教授',
            proposalTime: '2024-01-05 09:15:00',
            status: '已拒绝',
            approver: '王主任',
            approvalTime: '2024-01-07 11:30:00',
            content: '建议与企业合作共建大数据分析专业...',
            attachments: []
          }
        ],
        total: 3
      }
    }))
  },
  
  create: (data) => {
    return delay(800).then(() => ({
      code: 200,
      message: '创建成功',
      data: {
        id: Date.now(),
        ...data
      }
    }))
  },
  
  approve: (id, data) => {
    return delay(800).then(() => ({
      code: 200,
      message: '审批通过',
      data: {
        id: parseInt(id),
        status: '已通过',
        ...data
      }
    }))
  },
  
  reject: (id, data) => {
    return delay(800).then(() => ({
      code: 200,
      message: '审批拒绝',
      data: {
        id: parseInt(id),
        status: '已拒绝',
        ...data
      }
    }))
  },
  
  getDetail: (id) => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        id: parseInt(id),
        title: '人工智能专业共建提案',
        type: '专业共建',
        proposer: '张教授',
        proposalTime: '2024-01-10 14:30:00',
        status: '待审批',
        content: '为适应人工智能产业发展需求，建议与企业合作共建人工智能专业...',
        attachments: []
      }
    }))
  }
}

// 教学反馈模拟数据
export const mockTeachingFeedbackData = {
  getList: (params) => {
    return delay(600).then(() => ({
      code: 200,
      data: {
        list: [
          {
            id: 1,
            courseName: 'Java程序设计',
            studentName: '张三',
            type: '课程评价',
            score: 5,
            content: '课程内容很丰富，老师讲解清晰，实践项目很有帮助。',
            feedbackTime: '2024-01-15 10:30:00'
          },
          {
            id: 2,
            courseName: 'Python数据分析',
            studentName: '李四',
            type: '教学建议',
            score: 4,
            content: '建议增加更多实际案例，让学习更有针对性。',
            feedbackTime: '2024-01-14 15:20:00'
          },
          {
            id: 3,
            courseName: 'Vue.js前端开发',
            studentName: '王五',
            type: '问题反馈',
            score: 4,
            content: '课程视频有些地方不够清晰，希望能优化一下。',
            feedbackTime: '2024-01-13 09:15:00'
          }
        ],
        total: 3
      }
    }))
  },
  
  getStats: () => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        totalFeedback: 342,
        averageScore: 4.6,
        courseEvaluation: 256,
        studentCount: 128
      }
    }))
  },
  
  getTrend: () => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        scores: [4.2, 4.5, 4.3, 4.7, 4.6, 4.8]
      }
    }))
  },
  
  getDetail: (id) => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        id: parseInt(id),
        courseName: 'Java程序设计',
        studentName: '张三',
        type: '课程评价',
        score: 5,
        content: '课程内容很丰富，老师讲解清晰，实践项目很有帮助。',
        feedbackTime: '2024-01-15 10:30:00'
      }
    }))
  }
}

// 校企合作模拟数据
export const mockCooperationData = {
  getList: (params) => {
    return delay(600).then(() => ({
      code: 200,
      data: {
        list: [
          {
            id: 1,
            enterpriseName: 'XX科技有限公司',
            type: '项目实训',
            projectName: 'Java企业级开发实训',
            startTime: '2024-01-01',
            endTime: '2024-06-30',
            status: '进行中',
            studentCount: 45,
            contact: '张经理',
            phone: '13800138000',
            description: '与企业合作开展Java企业级开发实训项目，学生参与真实项目开发...'
          },
          {
            id: 2,
            enterpriseName: 'YY互联网公司',
            type: '课程共建',
            projectName: '前端开发课程共建',
            startTime: '2023-09-01',
            endTime: '2024-01-31',
            status: '已完成',
            studentCount: 60,
            contact: '李总监',
            phone: '13900139000',
            description: '与企业合作共建前端开发课程，引入企业真实案例...'
          },
          {
            id: 3,
            enterpriseName: 'ZZ数据公司',
            type: '人才培养',
            projectName: '大数据分析人才培养',
            startTime: '2024-02-01',
            endTime: '2024-12-31',
            status: '进行中',
            studentCount: 30,
            contact: '王经理',
            phone: '13700137000',
            description: '与企业合作培养大数据分析人才，提供实习机会...'
          }
        ],
        total: 3
      }
    }))
  },
  
  create: (data) => {
    return delay(800).then(() => ({
      code: 200,
      message: '创建成功',
      data: {
        id: Date.now(),
        ...data
      }
    }))
  },
  
  update: (id, data) => {
    return delay(800).then(() => ({
      code: 200,
      message: '更新成功',
      data: {
        id: parseInt(id),
        ...data
      }
    }))
  },
  
  delete: (id) => {
    return delay(500).then(() => ({
      code: 200,
      message: '删除成功'
    }))
  },
  
  getDetail: (id) => {
    return delay(500).then(() => ({
      code: 200,
      data: {
        id: parseInt(id),
        enterpriseName: 'XX科技有限公司',
        type: '项目实训',
        projectName: 'Java企业级开发实训',
        startTime: '2024-01-01',
        endTime: '2024-06-30',
        status: '进行中',
        studentCount: 45,
        contact: '张经理',
        phone: '13800138000',
        description: '与企业合作开展Java企业级开发实训项目，学生参与真实项目开发...'
      }
    }))
  }
}

