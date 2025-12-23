<template>
  <div class="token-test">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Token验证与岗位技能画像API测试</span>
          <el-button type="primary" @click="runFullTest">运行完整测试</el-button>
        </div>
      </template>

      <!-- Token状态显示 -->
      <el-row :gutter="20" class="status-section">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>Token状态</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Token存在">
                <el-tag :type="tokenStatus.hasToken ? 'success' : 'danger'">
                  {{ tokenStatus.hasToken ? '存在' : '不存在' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Token格式">
                <el-tag :type="tokenStatus.validFormat ? 'success' : 'danger'">
                  {{ tokenStatus.validFormat ? '有效' : '无效' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Token过期">
                <el-tag :type="!tokenStatus.expired ? 'success' : 'danger'">
                  {{ tokenStatus.expired ? '已过期' : '未过期' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="有效Token">
                <el-tag :type="tokenStatus.valid ? 'success' : 'danger'">
                  {{ tokenStatus.valid ? '有效' : '无效' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <div class="token-preview" v-if="tokenStatus.valid">
              <el-text type="info" size="small">Token预览: {{ tokenPreview }}</el-text>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>用户信息</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户ID">
                {{ userInfo.userId || '未知' }}
              </el-descriptions-item>
              <el-descriptions-item label="用户名">
                {{ userInfo.username || '未知' }}
              </el-descriptions-item>
              <el-descriptions-item label="公司">
                {{ userInfo.companyName || '未知' }}
              </el-descriptions-item>
              <el-descriptions-item label="角色">
                <el-tag v-for="(role, index) in userInfo.roles" :key="index" size="small">
                  {{ role }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>

      <!-- API测试结果 -->
      <el-card shadow="never" class="api-test-section">
        <template #header>
          <span>API测试结果</span>
        </template>
        
        <el-form :inline="true" class="test-form">
          <el-form-item label="岗位画像ID">
            <el-input v-model="testParams.profileId" placeholder="请输入岗位画像ID" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="页面大小">
            <el-select v-model="testParams.pageSize" style="width: 120px">
              <el-option :value="5" label="5条" />
              <el-option :value="10" label="10条" />
              <el-option :value="20" label="20条" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="testParams.keyword" placeholder="搜索关键词" clearable />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="testParams.type" placeholder="岗位类型" clearable>
              <el-option label="技术类" value="tech" />
              <el-option label="设计类" value="design" />
              <el-option label="产品类" value="product" />
              <el-option label="运营类" value="operation" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="testProfilesAPI" :loading="testing">
              测试课程匹配画像API
            </el-button>
            <el-button type="warning" @click="testSkillProfilesAPI" :loading="testingSkillProfiles" style="margin-left: 10px">
              测试企业技能画像API
            </el-button>
            <el-button type="success" @click="testSuggestionsAPI" :loading="testingSuggestions" style="margin-left: 10px">
              测试优化建议API
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="apiResult" class="api-result">
          <el-alert
            :title="apiResult.success ? 'API调用成功' : 'API调用失败'"
            :type="apiResult.success ? 'success' : 'error'"
            :closable="false"
            show-icon
          />
          
          <el-descriptions :column="2" border class="result-info">
            <el-descriptions-item label="请求URL">
              {{ apiResult.url }}
            </el-descriptions-item>
            <el-descriptions-item label="响应状态">
              <el-tag :type="apiResult.status >= 200 && apiResult.status < 300 ? 'success' : 'danger'">
                {{ apiResult.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="数据条数" :span="2">
              {{ apiResult.count }} 条
            </el-descriptions-item>
          </el-descriptions>

          <div class="result-data" v-if="apiResult.data && apiResult.data.length > 0">
            <h4>返回数据示例 (前3条):</h4>
            <el-table :data="apiResult.data.slice(0, 3)" stripe>
              <el-table-column prop="name" label="岗位名称" width="180" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" min-width="200" />
              <el-table-column prop="skills" label="技能" width="150">
                <template #default="{ row }">
                  {{ Array.isArray(row.skills) ? row.skills.slice(0, 3).join(', ') : row.skills }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="raw-data" v-if="apiResult.rawResponse">
            <h4>原始响应数据:</h4>
            <pre>{{ JSON.stringify(apiResult.rawResponse, null, 2) }}</pre>
          </div>
        </div>
        
        <!-- 优化建议API测试结果 -->
        <div v-if="suggestionResult" class="suggestion-result">
          <h3 style="margin-top: 30px; margin-bottom: 20px;">优化建议API测试结果</h3>
          <el-alert
            :title="suggestionResult.success ? '优化建议API调用成功' : '优化建议API调用失败'"
            :type="suggestionResult.success ? 'success' : 'error'"
            :closable="false"
            show-icon
          />
          
          <el-descriptions :column="2" border class="result-info">
            <el-descriptions-item label="请求URL">
              {{ suggestionResult.url }}
            </el-descriptions-item>
            <el-descriptions-item label="响应状态">
              <el-tag :type="suggestionResult.status >= 200 && suggestionResult.status < 300 ? 'success' : 'danger'">
                {{ suggestionResult.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="建议条数" :span="2">
              {{ suggestionResult.count }} 条
            </el-descriptions-item>
          </el-descriptions>

          <div class="result-data" v-if="suggestionResult.data && suggestionResult.data.length > 0">
            <h4>返回建议数据示例 (前3条):</h4>
            <el-table :data="suggestionResult.data.slice(0, 3)" stripe>
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column prop="title" label="标题" min-width="200" />
              <el-table-column prop="content" label="内容" min-width="300" />
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button 
                    v-for="(action, index) in row.actions" 
                    :key="index" 
                    size="small" 
                    type="primary" 
                    link
                  >
                    {{ action.label }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="raw-data" v-if="suggestionResult.rawResponse">
            <h4>优化建议原始响应数据:</h4>
            <pre>{{ JSON.stringify(suggestionResult.rawResponse, null, 2) }}</pre>
          </div>
        </div>
        
        <!-- 企业技能画像API测试结果 -->
        <div v-if="skillProfileResult" class="skill-profile-result">
          <h3 style="margin-top: 30px; margin-bottom: 20px;">企业技能画像API测试结果</h3>
          <el-alert
            :title="skillProfileResult.success ? '企业技能画像API调用成功' : '企业技能画像API调用失败'"
            :type="skillProfileResult.success ? 'success' : 'error'"
            :closable="false"
            show-icon
          />
          
          <el-descriptions :column="2" border class="result-info">
            <el-descriptions-item label="请求URL">
              {{ skillProfileResult.url }}
            </el-descriptions-item>
            <el-descriptions-item label="响应状态">
              <el-tag :type="skillProfileResult.status >= 200 && skillProfileResult.status < 300 ? 'success' : 'danger'">
                {{ skillProfileResult.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="数据条数" :span="2">
              {{ skillProfileResult.count }} 条
            </el-descriptions-item>
          </el-descriptions>

          <div class="result-data" v-if="skillProfileResult.data && skillProfileResult.data.length > 0">
            <h4>返回技能画像数据示例 (前3条):
              <el-tag 
                :type="skillProfileResult.data.some(item => item._isDemo) ? 'warning' : 'success'" 
                size="small" 
                style="margin-left: 10px"
              >
                {{ skillProfileResult.data.some(item => item._isDemo) ? '演示数据' : '真实数据' }}
              </el-tag>
            </h4>
            <el-table :data="skillProfileResult.data.slice(0, 3)" stripe>
              <el-table-column prop="name" label="岗位名称" width="180" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" min-width="200" />
              <el-table-column prop="skills" label="技能" width="150">
                <template #default="{ row }">
                  {{ Array.isArray(row.skills) ? row.skills.slice(0, 3).join(', ') : row.skills }}
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="160" />
              <el-table-column label="数据源" width="100">
                <template #default="{ row }">
                  <el-tag :type="row._isDemo ? 'warning' : 'success'" size="small">
                    {{ row._isDemo ? '演示' : '真实' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="raw-data" v-if="skillProfileResult.rawResponse">
            <h4>企业技能画像原始响应数据:</h4>
            <pre>{{ JSON.stringify(skillProfileResult.rawResponse, null, 2) }}</pre>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { courseMatchApi, skillProfileApi } from '@/api'
import { getValidToken, getUserInfoFromToken, isTokenExpired, isValidTokenFormat } from '@/utils/auth'

const testing = ref(false)
const testingSuggestions = ref(false)
const testingSkillProfiles = ref(false)
const apiResult = ref(null)
const suggestionResult = ref(null)
const skillProfileResult = ref(null)

const tokenStatus = reactive({
  hasToken: false,
  validFormat: false,
  expired: false,
  valid: false
})

const userInfo = reactive({
  userId: '',
  username: '',
  companyName: '',
  roles: []
})

const tokenPreview = ref('')

const testParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  type: '',
  profileId: '1'
})

// 检查Token状态
const checkTokenStatus = () => {
  console.log('=== 检查Token状态 ===')
  
  const token = localStorage.getItem('token')
  tokenStatus.hasToken = !!token
  
  if (token) {
    tokenStatus.validFormat = isValidTokenFormat(token)
    tokenStatus.expired = isTokenExpired(token)
    tokenStatus.valid = tokenStatus.validFormat && !tokenStatus.expired
    
    if (tokenStatus.valid) {
      tokenPreview.value = token.substring(0, 30) + '...'
      
      const user = getUserInfoFromToken(token)
      if (user) {
        Object.assign(userInfo, user)
      }
    } else {
      tokenPreview.value = token.substring(0, 30) + '...'
    }
  }
  
  console.log('Token状态检查完成:', tokenStatus)
  console.log('用户信息:', userInfo)
}

// 测试岗位画像API
const testProfilesAPI = async () => {
  console.log('=== 开始测试岗位画像API ===')
  
  if (!tokenStatus.valid) {
    ElMessage.error('Token无效，无法测试API')
    return
  }
  
  testing.value = true
  apiResult.value = null
  
  try {
    const params = {
      page: testParams.page,
      pageSize: testParams.pageSize,
      ...(testParams.keyword && { keyword: testParams.keyword }),
      ...(testParams.type && { type: testParams.type })
    }
    
    console.log('API请求参数:', params)
    
    const response = await courseMatchApi.getProfiles(params)
    
    console.log('API响应:', response)
    
    let data = []
    let totalCount = 0
    
    // 处理不同的响应格式
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        data = response.data
        totalCount = data.length
      } else if (typeof response.data === 'object') {
        data = response.data.list || response.data.records || response.data.data || []
        totalCount = response.data.total || response.data.count || data.length
      }
    }
    
    apiResult.value = {
      success: true,
      url: `/api/enterprise/course-match/profiles`,
      status: 200,
      count: totalCount,
      data: data,
      rawResponse: response
    }
    
    ElMessage.success(`API调用成功，获取到 ${totalCount} 条数据`)
    
  } catch (error) {
    console.error('API调用失败:', error)
    
    apiResult.value = {
      success: false,
      url: '/api/enterprise/course-match/profiles',
      status: error.response?.status || 0,
      count: 0,
      data: [],
      error: error.message,
      rawResponse: error.response?.data || error
    }
    
    if (error.response?.status === 401) {
      ElMessage.error('Token验证失败，请重新登录')
    } else if (error.response?.status === 404) {
      ElMessage.warning('API接口不存在 (404)')
    } else {
      ElMessage.error(`API调用失败: ${error.message}`)
    }
  } finally {
    testing.value = false
  }
}

// 测试优化建议API
const testSuggestionsAPI = async () => {
  console.log('=== 开始测试优化建议API ===')
  
  if (!tokenStatus.valid) {
    ElMessage.error('Token无效，无法测试API')
    return
  }
  
  if (!testParams.profileId) {
    ElMessage.warning('请输入岗位画像ID')
    return
  }
  
  testingSuggestions.value = true
  suggestionResult.value = null
  
  try {
    const params = {
      profileId: testParams.profileId
    }
    
    console.log('优化建议API请求参数:', params)
    
    const response = await courseMatchApi.getSuggestions(params)
    
    console.log('优化建议API响应:', response)
    
    let data = []
    let totalCount = 0
    
    // 处理不同的响应格式
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        data = response.data
        totalCount = data.length
      } else if (typeof response.data === 'object') {
        data = response.data.suggestions || response.data.data || response.data.list || []
        totalCount = response.data.total || response.data.count || data.length
      }
    } else if (Array.isArray(response)) {
      data = response
      totalCount = data.length
    }
    
    suggestionResult.value = {
      success: true,
      url: `/api/enterprise/course-match/suggestions`,
      status: 200,
      count: totalCount,
      data: data,
      rawResponse: response
    }
    
    ElMessage.success(`优化建议API调用成功，获取到 ${totalCount} 条建议`)
    
  } catch (error) {
    console.error('优化建议API调用失败:', error)
    
    suggestionResult.value = {
      success: false,
      url: '/api/enterprise/course-match/suggestions',
      status: error.response?.status || 0,
      count: 0,
      data: [],
      error: error.message,
      rawResponse: error.response?.data || error
    }
    
    if (error.response?.status === 401) {
      ElMessage.error('Token验证失败，请重新登录')
    } else if (error.response?.status === 404) {
      ElMessage.warning('优化建议API接口不存在 (404)')
    } else {
      ElMessage.error(`优化建议API调用失败: ${error.message}`)
    }
  } finally {
    testingSuggestions.value = false
  }
}

// 测试企业技能画像API
const testSkillProfilesAPI = async () => {
  console.log('=== 开始测试企业技能画像API ===')
  
  if (!tokenStatus.valid) {
    ElMessage.error('Token无效，无法测试API')
    return
  }
  
  testingSkillProfiles.value = true
  skillProfileResult.value = null
  
  try {
    const params = {
      page: testParams.page,
      pageSize: testParams.pageSize,
      keyword: testParams.keyword,
      type: testParams.type
    }
    
    console.log('企业技能画像API请求参数:', params)
    
    const response = await skillProfileApi.getEnterpriseList(params)
    
    console.log('企业技能画像API响应:', response)
    
    let data = []
    let totalCount = 0
    
    // 处理不同的响应格式
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        data = response.data
        totalCount = data.length
      } else if (typeof response.data === 'object') {
        data = response.data.list || response.data.records || response.data.data || response.data.profiles || []
        totalCount = response.data.total || response.data.count || data.length
      }
    }
    
    skillProfileResult.value = {
      success: true,
      url: `/api/enterprise/skill-profiles`,
      status: 200,
      count: totalCount,
      data: data,
      rawResponse: response
    }
    
    ElMessage.success(`企业技能画像API调用成功，获取到 ${totalCount} 条数据`)
    
  } catch (error) {
    console.error('企业技能画像API调用失败:', error)
    
    skillProfileResult.value = {
      success: false,
      url: '/api/enterprise/skill-profiles',
      status: error.response?.status || 0,
      count: 0,
      data: [],
      error: error.message,
      rawResponse: error.response?.data || error
    }
    
    if (error.response?.status === 401) {
      ElMessage.error('Token验证失败，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问企业技能画像数据')
    } else if (error.response?.status === 404) {
      ElMessage.warning('企业技能画像API接口不存在 (404)')
    } else {
      ElMessage.error(`企业技能画像API调用失败: ${error.message}`)
    }
  } finally {
    testingSkillProfiles.value = false
  }
}

// 运行完整测试
const runFullTest = async () => {
  console.log('=== 运行完整测试 ===')
  
  // 1. 检查Token状态
  checkTokenStatus()
  
  // 2. 等待一下再测试API
  setTimeout(() => {
    testProfilesAPI()
    setTimeout(() => {
      testSkillProfilesAPI()
      if (testParams.profileId) {
        setTimeout(() => {
          testSuggestionsAPI()
        }, 1000)
      }
    }, 1000)
  }, 500)
}

onMounted(() => {
  console.log('Token测试页面挂载')
  checkTokenStatus()
})
</script>

<style lang="scss" scoped>
.token-test {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }
  
  .status-section {
    margin-bottom: 20px;
  }
  
  .token-preview {
    margin-top: 10px;
    padding: 8px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    word-break: break-all;
  }
  
  .api-test-section {
    margin-top: 20px;
  }
  
  .test-form {
    margin-bottom: 20px;
  }
  
  .api-result {
    margin-top: 20px;
  }
  
  .result-info {
    margin-top: 15px;
  }
  
  .result-data {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 10px;
      color: var(--el-text-color-regular);
    }
  }
  
  .raw-data {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 10px;
      color: var(--el-text-color-regular);
    }
    
    pre {
      background-color: var(--el-fill-color-light);
      padding: 15px;
      border-radius: 4px;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}
</style>