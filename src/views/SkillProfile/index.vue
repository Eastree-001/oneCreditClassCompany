<template>
  <div class="skill-profile">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>岗位技能画像管理</span>
            <el-tag 
              v-if="profileList.some(item => item._isDemo)" 
              type="warning" 
              size="small" 
              style="margin-left: 10px"
            >
              演示数据
            </el-tag>

          </div>
          <div class="header-right">
            <el-button @click="handleRefresh" :loading="loading" style="margin-right: 10px">
              刷新数据
            </el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增画像</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="岗位名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入岗位名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="岗位类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 150px">
            <el-option label="技术类" value="tech" />
            <el-option label="设计类" value="design" />
            <el-option label="产品类" value="product" />
            <el-option label="运营类" value="operation" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 画像列表 -->
      <el-table :data="profileList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="岗位名称" width="180" />
        <el-table-column prop="type" label="岗位类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="skills" label="技能要求" min-width="300">
          <template #default="{ row }">
            <el-tag
              v-for="(skill, index) in row.skills"
              :key="index"
              size="small"
              style="margin-right: 8px; margin-bottom: 4px"
            >
              {{ typeof skill === 'object' ? skill.name : skill }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="viewDetail(row)">详情</el-button>
            <el-button type="success" link @click="handleGenerateAiCourse(row)">生成AI课程</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入岗位名称，如：前端工程师" />
        </el-form-item>
        <el-form-item label="岗位类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择岗位类型" style="width: 100%">
            <el-option label="技术类" value="tech" />
            <el-option label="设计类" value="design" />
            <el-option label="产品类" value="product" />
            <el-option label="运营类" value="operation" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入岗位描述"
          />
        </el-form-item>
        <el-form-item label="技能要求" prop="skills">
          <el-select
            v-model="formData.skillIds"
            multiple
            filterable
            allow-create
            placeholder="请选择技能要求，支持多选"
            style="width: 100%"
            :loading="skillsLoading"
          >
            <el-option
              v-for="skill in skillsList"
              :key="skill.id || skill.name"
              :label="skill.name"
              :value="skill.id"
            />
          </el-select>
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>从下拉列表中选择技能，支持搜索和自定义输入，可多选</span>
          </div>
        </el-form-item>
        
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="岗位画像详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="岗位名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="岗位类型">
          <el-tag :type="getTypeTag(viewData.type)">{{ getTypeName(viewData.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="岗位描述" :span="2">{{ viewData.description }}</el-descriptions-item>
        <el-descriptions-item label="技能要求" :span="2">
          <el-tag
            v-for="(skill, index) in viewData.skills"
            :key="index"
            style="margin-right: 8px; margin-bottom: 4px"
          >
            {{ typeof skill === 'object' ? skill.name : skill }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="经验要求">{{ viewData.experience || '不限' }}</el-descriptions-item>
        <el-descriptions-item label="学历要求">{{ getEducationName(viewData.education) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onActivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Delete,
  View,
  InfoFilled
} from '@element-plus/icons-vue'
import { skillProfileApi, courseMatchApi } from '@/api'
import { getValidToken, getUserInfoFromToken } from '@/utils/auth'
import request from '@/utils/request'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)

// 技能列表数据
const skillsList = ref([])
const skillsLoading = ref(false)

const searchForm = reactive({
  keyword: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const formData = reactive({
  id: null,
  name: '',
  type: '',
  description: '',
  skillIds: [], // 改为 skillIds，存储技能ID数组
  skills: [],   // 保留 skills 用于显示技能名称
  experience: '',
  education: ''
})

const viewData = reactive({
  name: '',
  type: '',
  description: '',
  skills: [],
  experience: '',
  education: '',
  createTime: ''
})

const dialogTitle = computed(() => isEdit.value ? '编辑岗位画像' : '新增岗位画像')

const formRules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择岗位类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入岗位描述', trigger: 'blur' }],
  skillIds: [{ required: true, message: '请选择至少一个技能要求', trigger: 'change' }]
}

// 岗位画像列表数据
const profileList = ref([])

// 获取技能列表
const fetchSkillsList = async () => {
  try {
    console.log('=== 开始获取技能列表 ===')
    skillsLoading.value = true

    // 直接使用 axios 请求,避免 request.js 的拦截器导致自动跳转登录页
    const token = getValidToken()
    const baseURL = import.meta.env.VITE_API_BASE_URL

    const response = await axios.get(`${baseURL}/enterprise/skill-profiles/skills`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 5000
    })

    console.log('📥 技能列表API响应:', response)

    if (response && (response.data || response.code === 200 || Array.isArray(response.data))) {
      let data = response.data || response

      // 处理不同的数据格式
      if (Array.isArray(data)) {
        skillsList.value = data
      } else if (typeof data === 'object' && data.list) {
        skillsList.value = data.list
      } else if (typeof data === 'object' && data.skills) {
        skillsList.value = data.skills
      } else if (typeof data === 'object' && data.data) {
        skillsList.value = Array.isArray(data.data) ? data.data : []
      } else {
        skillsList.value = []
      }

      console.log('✅ 技能列表获取成功:', {
        total: skillsList.value.length,
        skills: skillsList.value
      })
    } else {
      console.warn('⚠️ 技能列表响应数据格式异常:', response)
      skillsList.value = []
    }
  } catch (error) {
    // 静默处理所有错误,不显示提示,不影响页面使用
    console.log('技能列表获取失败或接口暂未实现,将使用自定义输入功能')
    if (error.response) {
      console.log('错误状态:', error.response.status)
    } else {
      console.log('错误信息:', error.message)
    }
    skillsList.value = []
  } finally {
    skillsLoading.value = false
  }
}

// 验证token并获取岗位画像列表
const fetchProfiles = async () => {
  console.log('=== 开始获取真实岗位画像列表 ===')
  
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
    
    // 3. 发起API请求获取真实岗位画像列表
    console.log('🔄 开始获取真实岗位画像数据...')
    loading.value = true
    
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      keyword: searchForm.keyword || undefined,
      type: searchForm.type || undefined
    }
    
    console.log('📤 请求参数:', params)
    console.log('🌐 请求地址: /api/enterprise/skill-profiles')
    
    const response = await skillProfileApi.getEnterpriseList(params)
    
    console.log('📥 岗位画像API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 尝试多种可能的数据结构
      let profiles = []
      let total = 0
      
      if (Array.isArray(data)) {
        // 直接是数组格式
        profiles = data
        total = data.length
      } else if (typeof data === 'object') {
        // 对象格式，包含list、records、profiles等字段
        profiles = data.list || data.records || data.data || data.profiles || []
        total = data.total || data.count || profiles.length
      }
      
      profileList.value = profiles
      pagination.total = total

      console.log('✅ 真实数据处理完成:', {
        listLength: profileList.value.length,
        total: pagination.total,
        dataSource: 'real_api'
      })

      // 如果没有数据，提示用户
      if (profiles.length === 0) {
        ElMessage.info('暂无岗位技能画像数据，请先创建')
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('获取数据成功，但数据格式需要调整，请检查后端API')
      profileList.value = []
      pagination.total = 0
    }
    
  } catch (error) {
    console.error('❌ 获取真实岗位画像列表失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问岗位技能画像数据')
    } else if (error.response?.status === 404) {
      ElMessage.error('岗位技能画像API接口不存在 (404)，请联系管理员')
      // 404错误时不使用模拟数据，显示真实错误
      console.log('🚫 API接口404，不使用模拟数据，等待后端部署')
      profileList.value = []
      pagination.total = 0
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
      // 500错误时不使用模拟数据，显示真实错误信息
      console.log('🚫 服务器500错误，不使用模拟数据，等待后端修复')
      profileList.value = []
      pagination.total = 0
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
      console.log('🚫 网络错误，不使用模拟数据，等待网络恢复')
      profileList.value = []
      pagination.total = 0
    } else {
      ElMessage.error(`获取岗位技能画像失败: ${error.message || '未知错误'}`)
      console.log('🚫 API调用失败，不使用模拟数据，显示真实错误')
      profileList.value = []
      pagination.total = 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('组件挂载，开始获取岗位画像数据')
  fetchProfiles()
  fetchSkillsList()
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

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleView = (row) => {
  // 跳转到详情页面而不是弹窗
  viewDetail(row)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该岗位画像吗？删除后不可恢复。', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('=== 开始删除岗位画像 ===')
    console.log('删除目标:', row)
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('🗑️ 删除岗位画像，调用真实API')
    console.log('📤 删除岗位画像ID:', row.id)
    console.log('🌐 请求地址: /api/enterprise/skill-profiles/{id}')
    
    // 调用真实删除API
    const response = await skillProfileApi.deleteEnterprise(row.id)
    
    console.log('📥 删除岗位画像API响应:', response)
    
    // 处理删除响应
    if (response && (response.data || response.code === 200 || response.success)) {
      console.log('✅ 岗位画像删除成功')
      ElMessage.success('岗位画像删除成功')
      
      // 从本地列表中移除
      const index = profileList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        profileList.value.splice(index, 1)
        pagination.total--
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('删除成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，如果删除操作成功，也要移除本地数据
      const index = profileList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        profileList.value.splice(index, 1)
        pagination.total--
      }
    }
    
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消删除
      console.log('🚫 用户取消删除操作')
      return
    }
    
    console.error('❌ 删除岗位画像失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限删除岗位技能画像')
    } else if (error.response?.status === 404) {
      ElMessage.error('删除岗位画像API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`删除岗位画像失败: ${error.message || '未知错误'}`)
    }
    
    // 删除失败时不移除本地数据
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    console.log('=== 开始提交岗位画像 ===')
    console.log('编辑模式:', isEdit.value)
    console.log('表单数据:', formData)
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    submitLoading.value = true
    

      // 新增模式 - 调用真实API
      console.log('➕ 创建新岗位画像，调用真实API')

      const requestData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        skillIds: formData.skillIds, // 使用 skillIds 字段
        experience: formData.experience,
        education: formData.education
      }
      
      console.log('📤 请求数据:', requestData)
      console.log('🌐 请求地址: /api/enterprise/skill-profiles')
      
      const response = await skillProfileApi.createEnterprise(requestData)
      
      console.log('📥 创建岗位画像API响应:', response)
      
      // 处理真实响应
      if (response && (response.data || response.code === 200 || response.id)) {
        console.log('✅ 岗位画像创建成功')
        ElMessage.success('岗位画像创建成功')

        // 获取返回的岗位画像ID
        const skillProfileId = response.id || response.data?.id || response.data

        // 关闭对话框并重置表单
        dialogVisible.value = false
        resetForm()

        // 刷新列表数据
        await fetchProfiles()

        // 提示是否要生成AI课程
        if (skillProfileId) {
          try {
            await ElMessageBox.confirm(
              '岗位画像创建成功！是否要基于此画像生成AI课程？',
              '生成AI课程',
              {
                confirmButtonText: '是',
                cancelButtonText: '否',
                type: 'info'
              }
            )

            // 用户点击"是",调用生成AI课程接口
            console.log('用户选择生成AI课程,岗位画像ID:', skillProfileId)

            const generateResponse = await courseMatchApi.generateAiCourse(skillProfileId)

            console.log('📥 生成AI课程API响应:', generateResponse)

            if (generateResponse && (generateResponse.code === 200 || generateResponse.success || generateResponse.data)) {
              ElMessage.success('AI课程生成请求已提交，稍后在课程匹配界面查看')
            } else {
              ElMessage.warning('AI课程生成请求已发送，但响应格式需要调整')
            }
          } catch (error) {
            if (error === 'cancel') {
              console.log('🚫 用户取消生成AI课程')
            } else {
              console.error('❌ 生成AI课程失败:', error)
              ElMessage.error(`生成AI课程失败: ${error.message || '未知错误'}`)
            }
          }
        }

      } else {
        console.warn('⚠️ API响应数据格式异常:', response)
        ElMessage.warning('创建成功，但响应格式需要调整，请检查后端API')
        dialogVisible.value = false
        resetForm()
        await fetchProfiles()
      }

  } catch (error) {
    console.error('❌ 提交岗位画像失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限创建岗位技能画像')
    } else if (error.response?.status === 404) {
      ElMessage.error('创建岗位画像API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`创建岗位画像失败: ${error.message || '未知错误'}`)
    }
    
    // 不使用本地模拟创建，显示真实错误
  } finally {
    submitLoading.value = false
  }
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    type: '',
    description: '',
    skillIds: [],
    skills: [],
    experience: '',
    education: ''
  })
  formRef.value?.clearValidate()
}

const handleSearch = async () => {
  console.log('执行搜索操作:', searchForm)
  pagination.page = 1 // 重置到第一页
  await fetchProfiles()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = ''
}

const handleSizeChange = async (size) => {
  pagination.size = size
  pagination.page = 1
  await fetchProfiles()
}

const handlePageChange = async (page) => {
  pagination.page = page
  await fetchProfiles()
}

const viewMatch = (row) => {
  router.push({ path: '/course-match', query: { profileId: row.id } })
}

const viewDetail = (row) => {
  router.push({ name: 'ProfileDetail', params: { id: row.id } })
}

// 生成AI课程
const handleGenerateAiCourse = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要基于"${row.name}"生成AI课程吗？`,
      '生成AI课程',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    console.log('=== 开始生成AI课程 ===')
    console.log('岗位画像ID:', row.id)
    console.log('岗位画像名称:', row.name)

    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }

    const loading = ElLoading.service({
      lock: true,
      text: 'AI正在生成课程，请稍候...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    try {
      const response = await courseMatchApi.generateAiCourse(row.id)

      console.log('📥 生成AI课程API响应:', response)

      if (response && (response.code === 200 || response.success || response.data)) {
        ElMessage.success('AI课程生成成功！可在课程匹配页面查看')
      } else {
        ElMessage.warning('AI课程生成请求已发送，请稍后查看')
      }
    } finally {
      loading.close()
    }

  } catch (error) {
    if (error === 'cancel') {
      console.log('🚫 用户取消生成AI课程')
    } else {
      console.error('❌ 生成AI课程失败:', error)

      if (error.response?.status === 401) {
        ElMessage.error('登录已过期，请重新登录获取访问权限')
        router.push('/login')
      } else if (error.response?.status === 403) {
        ElMessage.error('没有权限生成AI课程')
      } else if (error.response?.status === 404) {
        ElMessage.error('生成AI课程接口不存在 (404)，请联系管理员')
      } else if (error.response?.status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      } else {
        ElMessage.error(`生成AI课程失败: ${error.message || '未知错误'}`)
      }
    }
  }
}

// 刷新数据（强制获取真实数据）
const handleRefresh = async () => {
  console.log('🔄 手动刷新岗位技能画像数据')

  // 清除可能存在的演示数据标识
  profileList.value = []
  pagination.total = 0

  // 重新获取数据
  await fetchProfiles()

  if (profileList.value.some(item => item._isDemo)) {
    ElMessage.warning('刷新后仍显示演示数据，请检查后端API连接')
  } else {
    ElMessage.success('数据刷新成功')
  }
}

// 监听路由变化，从其他页面返回时重新加载数据
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/skill-profile') {
      console.log('🔄 路由切换到岗位技能画像页面，重新加载数据')
      fetchProfiles()
    }
  },
  { flush: 'post' }
)

// 页面激活时重新加载数据（确保匹配课程数实时更新）
onActivated(() => {
  console.log('🔄 页面激活，重新加载岗位技能画像数据')
  fetchProfiles()
})
</script>

<style lang="scss" scoped>
.skill-profile {
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
      align-items: center;
    }
  }
  
  .search-form {
    margin-bottom: 20px;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>

