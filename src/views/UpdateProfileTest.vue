<template>
  <div class="update-profile-test">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>更新岗位画像测试</span>
          <el-tag type="info" size="small">API测试工具</el-tag>
        </div>
      </template>

      <div class="test-section">
        <!-- 选择要更新的岗位画像 -->
        <h3>1. 选择要更新的岗位画像</h3>
        <el-form :inline="true" style="margin-bottom: 20px">
          <el-form-item label="选择画像">
            <el-select
              v-model="selectedProfileId"
              placeholder="请选择要更新的岗位画像"
              style="width: 300px"
              @change="loadProfileDetail"
              :loading="profilesLoading"
            >
              <el-option
                v-for="profile in profileList"
                :key="profile.id"
                :label="profile.name"
                :value="profile.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="loadProfiles" :loading="profilesLoading">
              刷新列表
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 当前岗位画像信息 -->
        <div v-if="selectedProfile" class="current-profile">
          <h3>2. 当前岗位画像信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ selectedProfile.id }}</el-descriptions-item>
            <el-descriptions-item label="名称">{{ selectedProfile.name }}</el-descriptions-item>
            <el-descriptions-item label="类型">
              <el-tag :type="getTypeTag(selectedProfile.type)">
                {{ getTypeName(selectedProfile.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ selectedProfile.createTime }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 更新表单 -->
        <h3>3. 更新岗位画像</h3>
        <el-form
          ref="updateFormRef"
          :model="updateFormData"
          :rules="formRules"
          label-width="120px"
          style="margin-bottom: 20px"
        >
          <el-form-item label="岗位名称" prop="name">
            <el-input v-model="updateFormData.name" placeholder="更新岗位名称" />
          </el-form-item>
          <el-form-item label="岗位类型" prop="type">
            <el-select v-model="updateFormData.type" placeholder="请选择">
              <el-option label="技术类" value="tech" />
              <el-option label="设计类" value="design" />
              <el-option label="产品类" value="product" />
              <el-option label="运营类" value="operation" />
            </el-select>
          </el-form-item>
          <el-form-item label="岗位描述" prop="description">
            <el-input
              v-model="updateFormData.description"
              type="textarea"
              :rows="3"
              placeholder="更新岗位描述"
            />
          </el-form-item>
          <el-form-item label="技能要求" prop="skills">
            <el-input
              v-model="skillsText"
              type="textarea"
              :rows="4"
              placeholder="更新技能要求，如：React, Vue.js, TypeScript"
            />
          </el-form-item>
          <el-form-item label="经验要求">
            <el-input v-model="updateFormData.experience" placeholder="如：1-3年工作经验" />
          </el-form-item>
          <el-form-item label="学历要求">
            <el-select v-model="updateFormData.education" placeholder="请选择">
              <el-option label="不限" value="" />
              <el-option label="大专" value="college" />
              <el-option label="本科" value="bachelor" />
              <el-option label="硕士" value="master" />
              <el-option label="博士" value="doctor" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="action-buttons">
          <el-button type="primary" @click="updateTestProfile" :loading="updating">
            更新岗位画像
          </el-button>
          <el-button @click="resetUpdateForm">重置表单</el-button>
          <el-button @click="clearSelection">清除选择</el-button>
        </div>

        <!-- 更新结果 -->
        <div v-if="updateResult" class="update-result">
          <h3>4. 更新结果</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="更新状态">
              <el-tag :type="updateResult.success ? 'success' : 'danger'">
                {{ updateResult.success ? '成功' : '失败' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="请求URL" v-if="updateResult.url">
              <code>{{ updateResult.url }}</code>
            </el-descriptions-item>
            <el-descriptions-item label="请求方法" v-if="updateResult.method">
              <el-tag type="warning">{{ updateResult.method }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="更新数据" v-if="updateResult.requestData">
              <pre>{{ JSON.stringify(updateResult.requestData, null, 2) }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="响应数据" v-if="updateResult.responseData">
              <pre>{{ JSON.stringify(updateResult.responseData, null, 2) }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="错误信息" v-if="updateResult.error">
              <el-alert
                :title="updateResult.error"
                type="error"
                show-icon
                :closable="false"
              />
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { skillProfileApi } from '@/api'
import { getValidToken } from '@/utils/auth'

const updateFormRef = ref(null)
const profilesLoading = ref(false)
const updating = ref(false)

const profileList = ref([])
const selectedProfileId = ref(null)
const selectedProfile = ref(null)

const updateFormData = ref({
  name: '',
  type: '',
  description: '',
  skills: [],
  experience: '',
  education: ''
})

const updateResult = ref(null)

const skillsText = computed({
  get: () => updateFormData.value.skills.join(', '),
  set: (val) => {
    updateFormData.value.skills = val
      .split(/[,，\n]/)
      .map(s => s.trim())
      .filter(s => s)
  }
})

const formRules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择岗位类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入岗位描述', trigger: 'blur' }],
  skills: [{ required: true, message: '请输入至少一个技能要求', trigger: 'change' }]
}

onMounted(() => {
  loadProfiles()
})

const loadProfiles = async () => {
  console.log('=== 加载岗位画像列表用于更新测试 ===')
  profilesLoading.value = true
  
  try {
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      return
    }
    
    const response = await skillProfileApi.getEnterpriseList({
      page: 1,
      pageSize: 100 // 获取更多数据用于测试
    })
    
    console.log('岗位画像列表响应:', response)
    
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      profileList.value = data.list || data.records || data.data || data.profiles || data || []
      console.log('加载到岗位画像列表:', profileList.value)
    } else {
      ElMessage.warning('获取岗位画像列表失败')
    }
    
  } catch (error) {
    console.error('加载岗位画像列表失败:', error)
    ElMessage.error('加载岗位画像列表失败')
  } finally {
    profilesLoading.value = false
  }
}

const loadProfileDetail = async (profileId) => {
  console.log('=== 加载岗位画像详情 ===', profileId)
  
  if (!profileId) return
  
  try {
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      return
    }
    
    const response = await skillProfileApi.getDetail(profileId)
    console.log('岗位画像详情响应:', response)
    
    if (response && (response.data || response.code === 200 || response.id)) {
      let data = response.data || response
      selectedProfile.value = data
      
      // 填充更新表单
      updateFormData.value = {
        name: data.name || '',
        type: data.type || '',
        description: data.description || '',
        skills: data.skills || [],
        experience: data.experience || '',
        education: data.education || ''
      }
      
      console.log('加载岗位画像详情成功:', data)
    } else {
      ElMessage.warning('获取岗位画像详情失败')
    }
    
  } catch (error) {
    console.error('加载岗位画像详情失败:', error)
    ElMessage.error('获取岗位画像详情失败')
  }
}

const updateTestProfile = async () => {
  console.log('=== 开始更新岗位画像 ===')
  
  if (!updateFormRef.value) return
  if (!selectedProfileId.value) {
    ElMessage.error('请先选择要更新的岗位画像')
    return
  }
  
  try {
    const valid = await updateFormRef.value.validate()
    if (!valid) return
    
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      return
    }
    
    updating.value = true
    updateResult.value = null
    
    const requestData = {
      name: updateFormData.value.name,
      type: updateFormData.value.type,
      description: updateFormData.value.description,
      skills: updateFormData.value.skills,
      experience: updateFormData.value.experience,
      education: updateFormData.value.education
    }
    
    console.log('📤 更新请求数据:', requestData)
    
    const startTime = Date.now()
    const response = await skillProfileApi.updateEnterprise(selectedProfileId.value, requestData)
    const endTime = Date.now()
    
    console.log('📥 更新岗位画像API响应:', response)
    console.log('⏱️ 请求耗时:', endTime - startTime, 'ms')
    
    updateResult.value = {
      success: true,
      url: `${import.meta.env.VITE_API_BASE_URL}/enterprise/skill-profiles/${selectedProfileId.value}`,
      method: 'PUT',
      requestData: requestData,
      responseData: response,
      duration: endTime - startTime
    }
    
    ElMessage.success('岗位画像更新成功')
    
    // 刷新列表数据
    await loadProfiles()
    
  } catch (error) {
    console.error('❌ 更新岗位画像失败:', error)
    
    updateResult.value = {
      success: false,
      url: `${import.meta.env.VITE_API_BASE_URL}/enterprise/skill-profiles/${selectedProfileId.value}`,
      method: 'PUT',
      requestData: {
        name: updateFormData.value.name,
        type: updateFormData.value.type,
        description: updateFormData.value.description,
        skills: updateFormData.value.skills,
        experience: updateFormData.value.experience,
        education: updateFormData.value.education
      },
      error: error.message || '未知错误',
      status: error.response?.status,
      statusText: error.response?.statusText
    }
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限更新岗位技能画像')
    } else if (error.response?.status === 404) {
      ElMessage.error('岗位画像不存在或API接口不存在 (404)')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误 (500)')
    } else {
      ElMessage.error(`更新失败: ${error.message || '未知错误'}`)
    }
    
  } finally {
    updating.value = false
  }
}

const resetUpdateForm = () => {
  if (updateFormRef.value) {
    updateFormRef.value.clearValidate()
  }
  
  if (selectedProfile.value) {
    // 重置为原始数据
    updateFormData.value = {
      name: selectedProfile.value.name || '',
      type: selectedProfile.value.type || '',
      description: selectedProfile.value.description || '',
      skills: [...(selectedProfile.value.skills || [])],
      experience: selectedProfile.value.experience || '',
      education: selectedProfile.value.education || ''
    }
  }
  
  updateResult.value = null
}

const clearSelection = () => {
  selectedProfileId.value = null
  selectedProfile.value = null
  updateFormData.value = {
    name: '',
    type: '',
    description: '',
    skills: [],
    experience: '',
    education: ''
  }
  updateResult.value = null
}

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
</script>

<style lang="scss" scoped>
.update-profile-test {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }
  
  .test-section {
    h3 {
      margin: 20px 0 10px 0;
      color: var(--text-primary);
      font-weight: 600;
    }
    
    .current-profile {
      margin: 20px 0;
      padding: 15px;
      background: var(--bg-color-page);
      border-radius: 8px;
    }
    
    .action-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .update-result {
      margin-top: 20px;
      padding: 20px;
      background: var(--bg-color-page);
      border-radius: 8px;
      
      pre {
        background: var(--bg-color);
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        max-height: 200px;
        overflow-y: auto;
      }
      
      code {
        background: var(--bg-color);
        padding: 4px 8px;
        border-radius: 4px;
        font-family: monospace;
      }
    }
  }
}
</style>