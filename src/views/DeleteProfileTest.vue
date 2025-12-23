<template>
  <div class="delete-profile-test">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>删除岗位画像测试</span>
          <el-tag type="danger" size="small">DELETE /api/enterprise/skill-profiles/{id}</el-tag>
        </div>
      </template>

      <!-- 操作说明 -->
      <el-alert
        title="测试说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>1. 点击"加载现有岗位画像"按钮获取可删除的岗位画像列表</p>
        <p>2. 选择要删除的岗位画像</p>
        <p>3. 点击"删除选中的岗位画像"执行删除操作</p>
        <p>4. 查看删除结果和API响应</p>
      </el-alert>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button 
          type="primary" 
          @click="loadProfiles" 
          :loading="loading"
          :icon="Refresh"
        >
          加载现有岗位画像
        </el-button>
      </div>

      <!-- 岗位画像列表 -->
      <div v-if="profileList.length > 0" class="profile-list">
        <h3>可删除的岗位画像：</h3>
        <el-radio-group v-model="selectedProfileId" class="profile-radio-group">
          <el-radio 
            v-for="profile in profileList" 
            :key="profile.id" 
            :label="profile.id"
            class="profile-radio"
          >
            <div class="profile-item">
              <div class="profile-header">
                <strong>{{ profile.name }}</strong>
                <el-tag :type="getTypeTag(profile.type)" size="small">
                  {{ getTypeName(profile.type) }}
                </el-tag>
              </div>
              <div class="profile-description">{{ profile.description }}</div>
              <div class="profile-skills">
                <el-tag
                  v-for="(skill, index) in profile.skills.slice(0, 5)"
                  :key="index"
                  size="small"
                  style="margin-right: 4px"
                >
                  {{ skill }}
                </el-tag>
                <span v-if="profile.skills.length > 5" class="more-skills">
                  +{{ profile.skills.length - 5 }}个技能
                </span>
              </div>
              <div class="profile-meta">
                <span>创建时间: {{ profile.createTime }}</span>
                <span v-if="profile.matchCount !== undefined">
                  匹配课程: {{ profile.matchCount }}门
                </span>
              </div>
            </div>
          </el-radio>
        </el-radio-group>

        <!-- 删除按钮 -->
        <div class="delete-section">
          <el-button
            type="danger"
            :disabled="!selectedProfileId"
            :loading="deleteLoading"
            @click="handleDelete"
            :icon="Delete"
            size="large"
          >
            删除选中的岗位画像
          </el-button>
          <el-alert
            v-if="selectedProfileId"
            :title="`即将删除ID为 ${selectedProfileId} 的岗位画像`"
            type="warning"
            :closable="false"
            style="margin-top: 10px"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-else-if="!loading" 
        description="暂无岗位画像数据" 
        style="margin-top: 30px"
      />

      <!-- 结果显示 -->
      <div v-if="result" class="result-section">
        <h3>删除结果：</h3>
        <el-alert
          :title="result.success ? '删除成功' : '删除失败'"
          :type="result.success ? 'success' : 'error'"
          :closable="false"
        >
          <p>{{ result.message }}</p>
        </el-alert>

        <!-- API响应详情 -->
        <el-collapse v-if="result.response" style="margin-top: 15px">
          <el-collapse-item title="API响应详情">
            <pre>{{ JSON.stringify(result.response, null, 2) }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Delete } from '@element-plus/icons-vue'
import { skillProfileApi } from '@/api'
import { getValidToken } from '@/utils/auth'

const loading = ref(false)
const deleteLoading = ref(false)
const profileList = ref([])
const selectedProfileId = ref(null)
const result = ref(null)

// 加载现有岗位画像
const loadProfiles = async () => {
  console.log('=== 开始加载岗位画像列表 ===')
  
  try {
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      return
    }
    
    console.log('🔄 开始获取岗位画像数据...')
    loading.value = true
    
    const response = await skillProfileApi.getEnterpriseList({
      page: 1,
      pageSize: 50,
      keyword: '',
      type: ''
    })
    
    console.log('📥 岗位画像API响应:', response)
    
    // 处理响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 尝试多种可能的数据结构
      let profiles = []
      
      if (Array.isArray(data)) {
        profiles = data
      } else if (typeof data === 'object') {
        profiles = data.list || data.records || data.data || data.profiles || []
      }
      
      profileList.value = profiles
      console.log('✅ 加载岗位画像成功:', profiles.length, '条')
      
      if (profiles.length === 0) {
        ElMessage.info('暂无可删除的岗位画像')
      } else {
        ElMessage.success(`成功加载 ${profiles.length} 个岗位画像`)
      }
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('获取数据成功，但数据格式需要调整')
      profileList.value = []
    }
    
  } catch (error) {
    console.error('❌ 加载岗位画像失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问岗位技能画像')
    } else if (error.response?.status === 404) {
      ElMessage.error('岗位技能画像API接口不存在 (404)')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`获取岗位画像失败: ${error.message || '未知错误'}`)
    }
    
    profileList.value = []
  } finally {
    loading.value = false
  }
}

// 执行删除操作
const handleDelete = async () => {
  if (!selectedProfileId.value) {
    ElMessage.warning('请先选择要删除的岗位画像')
    return
  }
  
  const selectedProfile = profileList.value.find(p => p.id === selectedProfileId.value)
  
  try {
    await ElMessageBox.confirm(
      `确定要删除岗位画像"${selectedProfile.name}"吗？\n\n删除后不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    
    console.log('=== 开始删除岗位画像 ===')
    console.log('删除目标:', selectedProfile)
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      return
    }
    
    deleteLoading.value = true
    result.value = null
    
    console.log('🗑️ 调用删除API')
    console.log('📤 删除ID:', selectedProfileId.value)
    
    const response = await skillProfileApi.deleteEnterprise(selectedProfileId.value)
    
    console.log('📥 删除API响应:', response)
    
    // 处理删除响应
    if (response && (response.data || response.code === 200 || response.success)) {
      result.value = {
        success: true,
        message: `成功删除岗位画像"${selectedProfile.name}"`,
        response: response
      }
      
      ElMessage.success('岗位画像删除成功')
      
      // 从列表中移除已删除的项
      const index = profileList.value.findIndex(p => p.id === selectedProfileId.value)
      if (index > -1) {
        profileList.value.splice(index, 1)
      }
      
      // 清除选中状态
      selectedProfileId.value = null
      
    } else {
      result.value = {
        success: false,
        message: '删除成功，但响应格式需要调整',
        response: response
      }
      
      ElMessage.warning('删除操作已执行，请检查后端响应格式')
      
      // 即使响应格式异常，也认为删除成功并移除本地数据
      const index = profileList.value.findIndex(p => p.id === selectedProfileId.value)
      if (index > -1) {
        profileList.value.splice(index, 1)
      }
      selectedProfileId.value = null
    }
    
  } catch (error) {
    if (error === 'cancel') {
      console.log('🚫 用户取消删除操作')
      return
    }
    
    console.error('❌ 删除岗位画像失败:', error)
    
    let errorMessage = '删除失败'
    
    if (error.response?.status === 401) {
      errorMessage = '登录已过期，请重新登录'
    } else if (error.response?.status === 403) {
      errorMessage = '没有权限删除岗位技能画像'
    } else if (error.response?.status === 404) {
      errorMessage = '删除API接口不存在 (404)'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      errorMessage = '网络连接失败，请检查网络连接'
    } else {
      errorMessage = `删除失败: ${error.message || '未知错误'}`
    }
    
    result.value = {
      success: false,
      message: errorMessage,
      response: error.response?.data || error.message
    }
    
    ElMessage.error(errorMessage)
  } finally {
    deleteLoading.value = false
  }
}

// 获取类型标签
const getTypeTag = (type) => {
  const map = {
    tech: 'primary',
    design: 'success',
    product: 'warning',
    operation: 'info'
  }
  return map[type] || 'info'
}

// 获取类型名称
const getTypeName = (type) => {
  const map = {
    tech: '技术类',
    design: '设计类',
    product: '产品类',
    operation: '运营类'
  }
  return map[type] || type
}
</script>

<style lang="scss" scoped>
.delete-profile-test {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }
  
  .action-buttons {
    margin: 20px 0;
    text-align: center;
  }
  
  .profile-list {
    margin-top: 20px;
    
    h3 {
      margin-bottom: 15px;
      color: #333;
    }
  }
  
  .profile-radio-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .profile-radio {
    width: 100%;
    
    :deep(.el-radio__label) {
      width: 100%;
    }
  }
  
  .profile-item {
    padding: 15px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background-color: #fafafa;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409eff;
      background-color: #f0f9ff;
    }
    
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      strong {
        font-size: 16px;
        color: #333;
      }
    }
    
    .profile-description {
      color: #666;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    
    .profile-skills {
      margin-bottom: 8px;
      
      .more-skills {
        color: #999;
        font-size: 12px;
      }
    }
    
    .profile-meta {
      font-size: 12px;
      color: #999;
      
      span {
        margin-right: 15px;
      }
    }
  }
  
  .delete-section {
    margin-top: 30px;
    text-align: center;
    padding: 20px;
    border-top: 2px dashed #e4e7ed;
  }
  
  .result-section {
    margin-top: 30px;
    padding: 20px;
    border-top: 1px solid #e4e7ed;
    
    h3 {
      margin-bottom: 15px;
      color: #333;
    }
    
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
    }
  }
}
</style>