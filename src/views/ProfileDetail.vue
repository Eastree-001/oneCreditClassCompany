<template>
  <div class="profile-detail">
    <el-card shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>岗位画像详情</span>

          </div>
          <div class="header-right">
            <el-button @click="handleRefresh" :loading="loading">
              刷新
            </el-button>
            <el-button @click="goBack">返回列表</el-button>
          </div>
        </div>
      </template>

      <div v-if="profileDetail" class="detail-content">
        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="岗位名称">{{ profileDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="岗位类型">
            <el-tag :type="getTypeTag(profileDetail.type)">
              {{ getTypeName(profileDetail.type) }}
            </el-tag>
          </el-descriptions-item>
         
          <el-descriptions-item label="创建时间">{{ profileDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="匹配课程数">{{ profileDetail.matchCount || 0 }}</el-descriptions-item>
        </el-descriptions>

        <!-- 岗位描述 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <span>岗位描述</span>
          </template>
          <p>{{ profileDetail.description }}</p>
        </el-card>

        <!-- 技能要求 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <span>技能要求</span>
          </template>
          <div class="skills-container">
            <el-tag
              v-for="(skill, index) in profileDetail.skills"
              :key="index"
              type="primary"
              size="large"
              style="margin-right: 12px; margin-bottom: 8px"
            >
              {{ typeof skill === 'object' ? skill.name : skill }}
            </el-tag>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="goToMatch">
            查看课程匹配
          </el-button>
          <el-button @click="editProfile">
            编辑画像
          </el-button>
        </div>
      </div>

      <el-empty v-else description="暂无数据" />
    </el-card>

    <!-- 500错误状态提示 -->
    <el-alert
      v-if="hasServerError"
      title="服务器内部错误"
      type="error"
      :description="serverErrorInfo.message || '服务器发生内部错误'"
      show-icon
      closable
      @close="clearServerError"
      style="margin-top: 20px"
    >
      <template #default>
        <div>
          <p>当前遇到的服务器错误：</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>接口：{{ serverErrorInfo.url }}</li>
            <li>错误码：{{ serverErrorInfo.status }}</li>
            <li>时间：{{ serverErrorInfo.timestamp }}</li>
          </ul>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { skillProfileApi } from '@/api'
import { getValidToken, getUserInfoFromToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const profileDetail = ref(null)

// 服务器错误状态管理
const hasServerError = ref(false)
const serverErrorInfo = ref({
  url: '',
  status: '',
  message: '',
  timestamp: ''
})

// 清除服务器错误状态
const clearServerError = () => {
  hasServerError.value = false
  serverErrorInfo.value = {
    url: '',
    status: '',
    message: '',
    timestamp: ''
  }
}

// 记录服务器错误
const recordServerError = (error, url) => {
  hasServerError.value = true
  serverErrorInfo.value = {
    url: url || error.config?.url || '未知',
    status: error.response?.status || '未知',
    message: error.response?.data?.message || error.message || '服务器内部错误',
    timestamp: new Date().toLocaleString()
  }
}

// 获取岗位画像详情
const fetchProfileDetail = async (id) => {
  console.log('=== 开始获取岗位画像详情 ===')
  console.log('岗位画像ID:', id)
  
  try {
    // 1. 验证token
    const token = getValidToken()
    console.log('Token验证结果:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    })
    
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    // 2. 获取用户信息
    const userInfo = getUserInfoFromToken(token)
    console.log('用户信息:', userInfo)
    
    if (!userInfo) {
      ElMessage.error('Token无效，请重新登录')
      router.push('/login')
      return
    }
    
    // 3. 发起API请求获取岗位画像详情
    console.log('🔄 开始获取真实岗位画像详情数据...')
    loading.value = true
    
    console.log('📤 请求ID:', id)
    console.log('🌐 请求地址: /api/enterprise/skill-profiles/{id}')
    
    const response = await skillProfileApi.getDetail(id)
    
    console.log('📥 岗位画像详情API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200 || response.id)) {
      let data = response.data || response
      
      console.log('✅ 真实岗位画像详情数据处理完成:', {
        id: data.id,
        name: data.name,
        type: data.type,
        skills: data.skills,
        dataSource: 'real_api'
      })
      
      // 设置详情数据
      profileDetail.value = data
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('获取数据成功，但数据格式需要调整，请检查后端API')
      profileDetail.value = null
    }
    
  } catch (error) {
    console.error('❌ 获取真实岗位画像详情失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问该岗位技能画像')
    } else if (error.response?.status === 404) {
      ElMessage.error('岗位技能画像不存在 (404)')
      profileDetail.value = null
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
      // 记录服务器错误
      recordServerError(error, `/enterprise/skill-profiles/${id}`)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`获取岗位技能画像详情失败: ${error.message || '未知错误'}`)
    }
    
    // 不使用模拟数据，保持空状态
    profileDetail.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const profileId = route.params.id || route.query.id
  if (profileId) {
    fetchProfileDetail(profileId)
  } else {
    ElMessage.error('缺少岗位画像ID参数')
    goBack()
  }
})

const getTypeTag = (type) => {
  const map = {
    tech: 'primary',
    design: 'success',
    product: 'warning',
    operation: 'info'
  }
  return map[type] || 'info'
}

const getTypeName = (type) => {
  const map = {
    tech: '技术类',
    design: '设计类',
    product: '产品类',
    operation: '运营类'
  }
  return map[type] || type
}

const getEducationName = (education) => {
  const map = {
    college: '大专',
    bachelor: '本科',
    master: '硕士',
    doctor: '博士'
  }
  return map[education] || '不限'
}

const handleRefresh = () => {
  const profileId = route.params.id || route.query.id
  if (profileId) {
    // 清除可能存在的错误状态
    clearServerError()
    // 重新获取数据
    fetchProfileDetail(profileId)
  }
}

const goBack = () => {
  router.push('/skill-profile')
}

const goToMatch = () => {
  if (profileDetail.value) {
    router.push({ path: '/course-match', query: { profileId: profileDetail.value.id } })
  }
}

const editProfile = () => {
  if (profileDetail.value) {
    // 可以在这里实现编辑功能，或者跳转到编辑页面
    ElMessage.info('编辑功能开发中')
  }
}
</script>

<style lang="scss" scoped>
.profile-detail {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
    
    .header-left {
      display: flex;
      align-items: center;
    }
    
    .header-right {
      display: flex;
      gap: 10px;
    }
  }
  
  .detail-content {
    .section-card {
      margin-top: 20px;
      
      p {
        line-height: 1.6;
        color: var(--text-regular);
        margin: 0;
      }
    }
    
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .action-buttons {
      margin-top: 30px;
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}
</style>