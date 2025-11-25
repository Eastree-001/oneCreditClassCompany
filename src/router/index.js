import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

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
        meta: { title: '数据看板', icon: 'DataBoard' }
      },
      {
        path: 'skill-profile',
        name: 'SkillProfile',
        component: () => import('@/views/SkillProfile/index.vue'),
        meta: { title: '岗位技能画像', icon: 'User' }
      },
      {
        path: 'course-match',
        name: 'CourseMatch',
        component: () => import('@/views/CourseMatch/index.vue'),
        meta: { title: '课程匹配', icon: 'Connection' }
      },
      {
        path: 'talent-demand',
        name: 'TalentDemand',
        component: () => import('@/views/TalentDemand/index.vue'),
        meta: { title: '人才需求发布', icon: 'Promotion' }
      },
      {
        path: 'cooperation',
        name: 'Cooperation',
        component: () => import('@/views/Cooperation/index.vue'),
        meta: { title: '合作项目管理', icon: 'Document' }
      },
      {
        path: 'training',
        name: 'Training',
        component: () => import('@/views/Training/index.vue'),
        meta: { title: '培训计划管理', icon: 'Calendar' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

