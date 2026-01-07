import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/stores/user'
import { useUserStoreUniversity } from '@/stores/user-university'
import { useAppStore } from '@/stores/app'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: (to) => {
      const appStore = useAppStore()
      return appStore.isEnterprise ? '/dashboard' : '/dashboard-university'
    },
    children: [
      // 企业端路由
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板', icon: 'DataBoard', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'enterprise-cooperation',
        name: 'EnterpriseCooperation',
        component: () => import('@/views/EnterpriseCooperation/index.vue'),
        meta: { title: '校企合作管理', icon: 'Connection', requiresAuth: true, mode: 'enterprise' }
      },
      // 高校端路由
      {
        path: 'dashboard-university',
        name: 'DashboardUniversity',
        component: () => import('@/views/DashboardUniversity.vue'),
        meta: { title: '数据看板', icon: 'DataBoard', requiresAuth: true, mode: 'university' }
      },
      {
        path: 'course-slice',
        name: 'CourseSlice',
        component: () => import('@/views/CourseSlice/index.vue'),
        meta: { title: '课程切片与技能映射', icon: 'Document', requiresAuth: true, mode: 'university' }
      },
      {
        path: 'proposal-approval',
        name: 'ProposalApproval',
        component: () => import('@/views/ProposalApproval/index.vue'),
        meta: { title: '企业项目合作', icon: 'EditPen', requiresAuth: true, mode: 'university' }
      },
      {
        path: 'teaching-feedback',
        name: 'TeachingFeedback',
        component: () => import('@/views/TeachingFeedback/index.vue'),
        meta: { title: '教学评价', icon: 'DataAnalysis', requiresAuth: true, mode: 'university' }
      },
      {
        path: 'cooperation-university',
        name: 'CooperationUniversity',
        component: () => import('@/views/CooperationUniversity/index.vue'),
        meta: { title: '校企合作管理', icon: 'Connection', requiresAuth: true, mode: 'university' }
      },
      {
        path: 'cooperation-review/:cooperationId',
        name: 'CooperationReview',
        component: () => import('@/views/CooperationReview.vue'),
        meta: { title: '审核报名', icon: 'Connection', requiresAuth: true, mode: 'university' }
      },
      {
        path: 'skill-profile',
        name: 'SkillProfile',
        component: () => import('@/views/SkillProfile/index.vue'),
        meta: { title: '岗位技能画像', icon: 'User', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'skill-profile/:id',
        name: 'ProfileDetail',
        component: () => import('@/views/ProfileDetail.vue'),
        meta: { title: '岗位画像详情', icon: 'User', requiresAuth: true }
      },
      {
        path: 'course-match',
        name: 'CourseMatch',
        component: () => import('@/views/CourseMatch/index.vue'),
        meta: { title: '课程匹配', icon: 'Connection', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'talent-demand',
        name: 'TalentDemand',
        component: () => import('@/views/TalentDemand/index.vue'),
        meta: { title: '人才需求发布', icon: 'Promotion', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'talent-demand/:id',
        name: 'TalentDemandDetail',
        component: () => import('@/views/TalentDemandDetail.vue'),
        meta: { title: '人才需求详情', icon: 'Promotion', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'cooperation',
        name: 'Cooperation',
        component: () => import('@/views/Cooperation/index.vue'),
        meta: { title: '合作项目管理', icon: 'Document', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'cooperation/:id',
        name: 'CooperationDetail',
        component: () => import('@/views/CooperationDetail.vue'),
        meta: { title: '合作项目详情', icon: 'Document', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'training',
        name: 'Training',
        component: () => import('@/views/Training/index.vue'),
        meta: { title: '培训课程管理', icon: 'Calendar', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'training/:id',
        name: 'TrainingDetail',
        component: () => import('@/views/TrainingDetail.vue'),
        meta: { title: '培训课程详情', icon: 'Calendar', requiresAuth: true, mode: 'enterprise' }
      },
      {
        path: 'skill-profile/:id',
        name: 'ProfileDetail',
        component: () => import('@/views/ProfileDetail.vue'),
        meta: { title: '岗位画像详情', icon: 'User', requiresAuth: true, mode: 'enterprise' }
      },
      // 个人中心（企业端和高校端通用）
      {
        path: 'personal-center',
        name: 'PersonalCenter',
        component: () => import('@/views/PersonalCenter.vue'),
        meta: { title: '个人中心', icon: 'User', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const appStore = useAppStore()
  const userStore = useUserStore()
  const userStoreUniversity = useUserStoreUniversity()
  
  // 根据路由meta确定当前模式
  const routeMode = to.matched.find(record => record.meta.mode)?.meta.mode
  if (routeMode) {
    if (routeMode === 'enterprise' && !appStore.isEnterprise) {
      appStore.switchToEnterprise()
    } else if (routeMode === 'university' && !appStore.isUniversity) {
      appStore.switchToUniversity()
    }
  }
  
  // 根据当前模式选择对应的store
  const currentUserStore = appStore.isEnterprise ? userStore : userStoreUniversity
  
  console.log('路由守卫检查:', {
    to: to.path,
    mode: appStore.currentMode,
    isLoggedIn: currentUserStore.isLoggedIn,
    hasUserInfo: !!currentUserStore.userInfo,
    hasToken: !!currentUserStore.token
  })
  
  // 如果访问登录页
  if (to.path === '/login') {
    // 如果已经登录，重定向到首页
    if (currentUserStore.isLoggedIn) {
      console.log('用户已登录，重定向到首页')
      const redirectPath = appStore.isEnterprise ? '/dashboard' : '/dashboard-university'
      next(redirectPath)
      return
    }
    next()
    return
  }
  
  // 检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth !== false)) {
    // 如果没有token，重定向到登录页
    if (!currentUserStore.isLoggedIn) {
      console.log('用户未登录，重定向到登录页')
      next('/login')
      return
    }
    
    // 如果有token但没有用户信息，尝试获取用户信息
    if (!currentUserStore.userInfo) {
      try {
        console.log('获取用户信息...')
        await currentUserStore.fetchUserInfo()
        console.log('用户信息获取成功')
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 清除无效token
        currentUserStore.setToken(null)
        currentUserStore.setUserInfo(null)
        next('/login')
        return
      }
    }
  }
  
  console.log('路由守卫通过，允许访问')
  next()
})

export default router

