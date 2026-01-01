<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
      <div class="logo">
        <transition name="fade">
          <span v-if="!isCollapse" class="logo-text">一学分课堂</span>
          <span v-else class="logo-icon">一</span>
        </transition>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar 
                :size="32" 
                :src="currentUserStore.avatar" 
              />
              <span class="username">{{ currentUserStore.loading ? '加载中...' : currentUserStore.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useUserStoreUniversity } from '@/stores/user-university'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const userStoreUniversity = useUserStoreUniversity()
const isCollapse = ref(false)

// 根据当前模式选择对应的store
const currentUserStore = computed(() => {
  return appStore.isEnterprise ? userStore : userStoreUniversity
})

const enterpriseMenuList = [
  { path: '/dashboard', title: '数据看板', icon: 'DataBoard' },
  { path: '/skill-profile', title: '岗位技能画像', icon: 'User' },
  { path: '/course-match', title: '课程匹配', icon: 'Connection' },
  { path: '/talent-demand', title: '人才需求发布', icon: 'Promotion' },
  { path: '/cooperation', title: '合作项目管理', icon: 'Document' },
  { path: '/training', title: '培训计划管理', icon: 'Calendar' }
]

const universityMenuList = [
  { path: '/dashboard-university', title: '数据看板', icon: 'DataBoard' },
  { path: '/course-slice', title: '课程切片与技能映射', icon: 'Document' },
  { path: '/proposal-approval', title: '共建课程/专业提案审批', icon: 'EditPen' },
  { path: '/teaching-feedback', title: '数据化教学反馈面板', icon: 'DataAnalysis' },
  { path: '/cooperation-university', title: '校企合作管理', icon: 'Connection' }
]

const menuList = computed(() => {
  return appStore.isEnterprise ? enterpriseMenuList : universityMenuList
})

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => {
  const menu = menuList.value.find(item => item.path === route.path)
  return menu ? menu.title : ''
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command) => {
  if (command === 'logout') {
    await currentUserStore.value.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/personal-center')
  } else if (command === 'settings') {
    ElMessage.info('设置功能开发中')
  }
}

// 页面加载时初始化用户状态
onMounted(async () => {
  console.log('Layout组件加载，初始化用户状态...')
  if (appStore.isEnterprise) {
    await userStore.initUserState()
  } else {
    await userStoreUniversity.initUserState()
  }
  console.log('Layout组件用户状态:', {
    mode: appStore.currentMode,
    loading: currentUserStore.value.loading,
    username: currentUserStore.value.username,
    userInfo: currentUserStore.value.userInfo,
    isLoggedIn: currentUserStore.value.isLoggedIn
  })
})

// 监听用户信息变化
watch(
  () => currentUserStore.value.userInfo,
  (newUserInfo) => {
    console.log('用户信息发生变化:', newUserInfo)
    console.log('当前用户名:', currentUserStore.value.username)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 20px;
    font-weight: bold;
    
    .logo-text {
      white-space: nowrap;
    }
    
    .logo-icon {
      font-size: 24px;
    }
  }
  
  .el-menu {
    border-right: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .collapse-icon {
      font-size: 20px;
      cursor: pointer;
      color: #606266;
      transition: color 0.3s;
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 4px;
      transition: background 0.3s;
      
      &:hover {
        background: #f5f7fa;
      }
      
      .username {
        font-size: 14px;
        color: var(--text-primary);
      }
    }
  }
}

.main-content {
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
}

// 过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

