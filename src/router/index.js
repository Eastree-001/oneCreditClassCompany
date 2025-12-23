import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/stores/user'

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
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板', icon: 'DataBoard', requiresAuth: true }
      },
      {
        path: 'skill-profile',
        name: 'SkillProfile',
        component: () => import('@/views/SkillProfile/index.vue'),
        meta: { title: '岗位技能画像', icon: 'User', requiresAuth: true }
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
        meta: { title: '课程匹配', icon: 'Connection', requiresAuth: true }
      },
      {
        path: 'talent-demand',
        name: 'TalentDemand',
        component: () => import('@/views/TalentDemand/index.vue'),
        meta: { title: '人才需求发布', icon: 'Promotion', requiresAuth: true }
      },
      {
        path: 'talent-demand/:id',
        name: 'TalentDemandDetail',
        component: () => import('@/views/TalentDemandDetail.vue'),
        meta: { title: '人才需求详情', icon: 'Promotion', requiresAuth: true }
      },
      {
        path: 'cooperation',
        name: 'Cooperation',
        component: () => import('@/views/Cooperation/index.vue'),
        meta: { title: '合作项目管理', icon: 'Document', requiresAuth: true }
      },
      {
        path: 'cooperation/:id',
        name: 'CooperationDetail',
        component: () => import('@/views/CooperationDetail.vue'),
        meta: { title: '合作项目详情', icon: 'Document', requiresAuth: true }
      },
      {
        path: 'training',
        name: 'Training',
        component: () => import('@/views/Training/index.vue'),
        meta: { title: '培训计划管理', icon: 'Calendar', requiresAuth: true }
      },
      {
        path: 'training/:id',
        name: 'TrainingDetail',
        component: () => import('@/views/TrainingDetail.vue'),
        meta: { title: '培训计划详情', icon: 'Calendar', requiresAuth: true }
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
  const userStore = useUserStore()
  
  console.log('路由守卫检查:', {
    to: to.path,
    isLoggedIn: userStore.isLoggedIn,
    hasUserInfo: !!userStore.userInfo,
    hasToken: !!userStore.token
  })
  
  // 如果访问登录页
  if (to.path === '/login') {
    // 如果已经登录，重定向到首页
    if (userStore.isLoggedIn) {
      console.log('用户已登录，重定向到首页')
      next('/')
      return
    }
    next()
    return
  }
  
  // 检查是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth !== false)) {
    // 如果没有token，重定向到登录页
    if (!userStore.isLoggedIn) {
      console.log('用户未登录，重定向到登录页')
      next('/login')
      return
    }
    
    // 如果有token但没有用户信息，尝试获取用户信息
    if (!userStore.userInfo) {
      try {
        console.log('获取用户信息...')
        await userStore.fetchUserInfo()
        console.log('用户信息获取成功')
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 清除无效token
        userStore.setToken(null)
        userStore.setUserInfo(null)
        next('/login')
        return
      }
    }
  }
  
  console.log('路由守卫通过，允许访问')
  next()
})

export default router

