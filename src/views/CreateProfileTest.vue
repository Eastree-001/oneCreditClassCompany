<template>
  <div class="create-profile-test">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>创建岗位画像测试</span>
          <el-tag type="info" size="small">API测试工具</el-tag>
        </div>
      </template>

      <div class="test-section">
        <h3>1. Token状态检查</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Token存在">
            <el-tag :type="tokenStatus.hasToken ? 'success' : 'danger'">
              {{ tokenStatus.hasToken ? '存在' : '不存在' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Token格式">
            <el-tag :type="tokenStatus.formatValid ? 'success' : 'danger'">
              {{ tokenStatus.formatValid ? '正确' : '错误' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Token过期">
            <el-tag :type="tokenStatus.expired ? 'danger' : 'success'">
              {{ tokenStatus.expired ? '已过期' : '有效' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户信息">
            <el-tag :type="tokenStatus.hasUserInfo ? 'success' : 'warning'">
              {{ tokenStatus.hasUserInfo ? '已获取' : '未获取' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <h3>2. 创建岗位画像测试</h3>
        <el-form
          ref="testFormRef"
          :model="testFormData"
          :rules="formRules"
          label-width="120px"
          style="margin-bottom: 20px"
        >
          <el-form-item label="岗位名称" prop="name">
            <el-input v-model="testFormData.name" placeholder="测试岗位名称" />
          </el-form-item>
          <el-form-item label="岗位类型" prop="type">
            <el-select v-model="testFormData.type" placeholder="请选择">
              <el-option label="技术类" value="tech" />
              <el-option label="设计类" value="design" />
              <el-option label="产品类" value="product" />
              <el-option label="运营类" value="operation" />
            </el-select>
          </el-form-item>
          <el-form-item label="岗位描述" prop="description">
            <el-input
              v-model="testFormData.description"
              type="textarea"
              :rows="3"
              placeholder="测试岗位描述"
            />
          </el-form-item>
          <el-form-item label="技能要求" prop="skills">
            <el-input
              v-model="skillsText"
              type="textarea"
              :rows="4"
              placeholder="测试技能要求，如：React, Vue.js, TypeScript"
            />
          </el-form-item>
          <el-form-item label="经验要求">
            <el-input v-model="testFormData.experience" placeholder="如：1-3年工作经验" />
          </el-form-item>
          <el-form-item label="学历要求">
            <el-select v-model="testFormData.education" placeholder="请选择">
              <el-option label="不限" value="" />
              <el-option label="大专" value="college" />
              <el-option label="本科" value="bachelor" />
              <el-option label="硕士" value="master" />
              <el-option label="博士" value="doctor" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="action-buttons">
          <el-button type="primary" @click="checkToken" :loading="checkingToken">
            检查Token
          </el-button>
          <el-button type="success" @click="createTestProfile" :loading="creating">
            创建测试岗位画像
          </el-button>
          <el-button @click="resetForm">重置表单</el-button>
        </div>

        <div v-if="testResult" class="test-result">
          <h3>3. 测试结果</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="请求状态">
              <el-tag :type="testResult.success ? 'success' : 'danger'">
                {{ testResult.success ? '成功' : '失败' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="请求URL" v-if="testResult.url">
              <code>{{ testResult.url }}</code>
            </el-descriptions-item>
            <el-descriptions-item label="请求数据" v-if="testResult.requestData">
              <pre>{{ JSON.stringify(testResult.requestData, null, 2) }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="响应数据" v-if="testResult.responseData">
              <pre>{{ JSON.stringify(testResult.responseData, null, 2) }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="错误信息" v-if="testResult.error">
              <el-alert
                :title="testResult.error"
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
import { getValidToken, getUserInfoFromToken, isValidTokenFormat, isTokenExpired } from '@/utils/auth'

const testFormRef = ref(null)
const checkingToken = ref(false)
const creating = ref(false)

const tokenStatus = ref({
  hasToken: false,
  formatValid: false,
  expired: false,
  hasUserInfo: false
})

const testFormData = ref({
  name: '测试前端工程师',
  type: 'tech',
  description: '这是一个测试岗位描述，用于验证API创建功能',
  skills: [],
  experience: '1-3年',
  education: 'bachelor'
})

const testResult = ref(null)

const skillsText = computed({
  get: () => testFormData.value.skills.join(', '),
  set: (val) => {
    testFormData.value.skills = val
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
  checkToken()
})

const checkToken = async () => {
  console.log('=== 检查Token状态 ===')
  checkingToken.value = true
  
  try {
    const token = getValidToken()
    const userInfo = getUserInfoFromToken(token)
    
    tokenStatus.value = {
      hasToken: !!token,
      formatValid: token ? isValidTokenFormat(token) : false,
      expired: token ? isTokenExpired(token) : false,
      hasUserInfo: !!userInfo
    }
    
    console.log('Token状态检查完成:', tokenStatus.value)
    
    if (!token) {
      ElMessage.error('Token不存在，请先登录')
    } else if (tokenStatus.value.expired) {
      ElMessage.error('Token已过期，请重新登录')
    } else if (!userInfo) {
      ElMessage.error('无法从Token获取用户信息')
    } else {
      ElMessage.success('Token验证通过')
    }
    
  } catch (error) {
    console.error('Token检查失败:', error)
    ElMessage.error('Token检查失败')
  } finally {
    checkingToken.value = false
  }
}

const createTestProfile = async () => {
  console.log('=== 开始创建测试岗位画像 ===')
  
  if (!testFormRef.value) return
  
  try {
    const valid = await testFormRef.value.validate()
    if (!valid) return
    
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      return
    }
    
    creating.value = true
    testResult.value = null
    
    const requestData = {
      name: testFormData.value.name,
      type: testFormData.value.type,
      description: testFormData.value.description,
      skills: testFormData.value.skills,
      experience: testFormData.value.experience,
      education: testFormData.value.education
    }
    
    console.log('📤 请求数据:', requestData)
    
    const startTime = Date.now()
    const response = await skillProfileApi.createEnterprise(requestData)
    const endTime = Date.now()
    
    console.log('📥 创建岗位画像API响应:', response)
    console.log('⏱️ 请求耗时:', endTime - startTime, 'ms')
    
    testResult.value = {
      success: true,
      url: `${import.meta.env.VITE_API_BASE_URL}/enterprise/skill-profiles`,
      requestData: requestData,
      responseData: response,
      duration: endTime - startTime
    }
    
    ElMessage.success('测试岗位画像创建成功')
    
  } catch (error) {
    console.error('❌ 创建测试岗位画像失败:', error)
    
    testResult.value = {
      success: false,
      url: `${import.meta.env.VITE_API_BASE_URL}/enterprise/skill-profiles`,
      requestData: {
        name: testFormData.value.name,
        type: testFormData.value.type,
        description: testFormData.value.description,
        skills: testFormData.value.skills,
        experience: testFormData.value.experience,
        education: testFormData.value.education
      },
      error: error.message || '未知错误',
      status: error.response?.status,
      statusText: error.response?.statusText
    }
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限创建岗位技能画像')
    } else if (error.response?.status === 404) {
      ElMessage.error('创建岗位画像API接口不存在 (404)')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误 (500)')
    } else {
      ElMessage.error(`创建失败: ${error.message || '未知错误'}`)
    }
    
  } finally {
    creating.value = false
  }
}

const resetForm = () => {
  if (testFormRef.value) {
    testFormRef.value.clearValidate()
  }
  
  testFormData.value = {
    name: '测试前端工程师',
    type: 'tech',
    description: '这是一个测试岗位描述，用于验证API创建功能',
    skills: ['React', 'Vue.js', 'TypeScript'],
    experience: '1-3年',
    education: 'bachelor'
  }
  
  testResult.value = null
}
</script>

<style lang="scss" scoped>
.create-profile-test {
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
    
    .action-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .test-result {
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