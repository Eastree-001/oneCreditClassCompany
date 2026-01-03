<template>
  <div class="personal-center-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else-if="userInfo" class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <el-avatar :size="120" :src="avatar" />
          <div class="username">{{ username }}</div>
        </div>

        <!-- 用户信息区域 -->
        <el-descriptions :column="2" border class="info-section">
          <el-descriptions-item label="用户名">
            {{ userInfo.username || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ userInfo.email || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ userInfo.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="高校名称">
            {{ userInfo.universityName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ userInfo.userId || userInfo.id || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag type="success">{{ userInfo.role || '高校用户' }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新信息
          </el-button>
          <el-button @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>
      </div>

      <div v-else class="no-data">
        <el-empty description="暂无用户信息" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, Refresh, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useUserStoreUniversity } from '@/stores/user-university'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const userStoreUniversity = useUserStoreUniversity()

const loading = ref(false)

// 根据当前模式选择对应的store
const currentUserStore = computed(() => {
  return appStore.isEnterprise ? userStore : userStoreUniversity
})

const userInfo = computed(() => currentUserStore.value.userInfo)
const username = computed(() => currentUserStore.value.username)
const avatar = computed(() => currentUserStore.value.avatar)

// 刷新用户信息
const handleRefresh = async () => {
  loading.value = true
  try {
    await currentUserStore.value.fetchUserInfo()
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新用户信息失败:', error)
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await currentUserStore.value.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  }
}

// 页面加载时刷新用户信息
onMounted(() => {
  if (currentUserStore.value.isLoggedIn) {
    handleRefresh()
  }
})
</script>

<style scoped>
.personal-center-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card {
  background: #fff;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  gap: 10px;
}

.loading-container .el-icon {
  font-size: 40px;
}

.profile-content {
  padding: 20px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #ebeef5;
}

.username {
  margin-top: 15px;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.info-section {
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.no-data {
  padding: 60px 0;
}
</style>
