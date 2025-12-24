<template>
  <div class="talent-demand">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>人才需求发布</span>
            <el-tag 
              v-if="demandList.some(item => item._isDemo)" 
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
            <el-button type="primary" :icon="Plus" @click="handleAdd">发布需求</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="需求标题">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入需求标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待审核" value="pending" />
            <el-option label="已发布" value="published" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 需求列表 -->
      <el-table :data="demandList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="需求标题" min-width="200" />
        <el-table-column prop="position" label="岗位名称" width="150" />
        <el-table-column prop="count" label="需求人数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicants" label="申请人数" width="100" align="center" />
        <el-table-column prop="schools" label="合作高校" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="(school, index) in row.schools"
              :key="index"
              size="small"
              style="margin-right: 4px"
            >
              {{ school }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="viewDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'published'"
              type="primary"
              link
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'published'"
              type="warning"
              link
              :icon="Close"
              @click="handleClose(row)"
            >
              关闭
            </el-button>
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

    <!-- 发布/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="需求标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入需求标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="position">
              <el-input v-model="formData.position" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="需求人数" prop="count">
              <el-input-number
                v-model="formData.count"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作地点" prop="location">
              <el-input v-model="formData.location" placeholder="请输入工作地点" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="岗位描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述岗位职责和要求"
          />
        </el-form-item>

        <el-form-item label="技能要求" prop="skills">
          <el-input
            v-model="skillsText"
            type="textarea"
            :rows="3"
            placeholder="请输入技能要求，多个技能用逗号或换行分隔"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历要求" prop="education">
              <el-select v-model="formData.education" placeholder="请选择" style="width: 100%">
                <el-option label="不限" value="" />
                <el-option label="大专" value="college" />
                <el-option label="本科" value="bachelor" />
                <el-option label="硕士" value="master" />
                <el-option label="博士" value="doctor" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资范围">
              <el-input v-model="formData.salary" placeholder="如：10k-20k" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="合作高校">
          <el-select
            v-model="formData.schools"
            multiple
            placeholder="请选择合作高校（可多选）"
            style="width: 100%"
          >
            <el-option label="清华大学" value="tsinghua" />
            <el-option label="北京大学" value="pku" />
            <el-option label="复旦大学" value="fudan" />
            <el-option label="上海交通大学" value="sjtu" />
            <el-option label="浙江大学" value="zju" />
          </el-select>
        </el-form-item>

        <el-form-item label="截止日期">
          <el-date-picker
            v-model="formData.deadline"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
          />
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
      title="需求详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="需求标题">{{ viewData.title }}</el-descriptions-item>
        <el-descriptions-item label="岗位名称">{{ viewData.position }}</el-descriptions-item>
        <el-descriptions-item label="需求人数">{{ viewData.count }}人</el-descriptions-item>
        <el-descriptions-item label="工作地点">{{ viewData.location }}</el-descriptions-item>
        <el-descriptions-item label="岗位描述" :span="2">{{ viewData.description }}</el-descriptions-item>
        <el-descriptions-item label="技能要求" :span="2">
          <el-tag
            v-for="(skill, index) in viewData.skills"
            :key="index"
            style="margin-right: 8px; margin-bottom: 4px"
          >
            {{ skill }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="学历要求">{{ getEducationName(viewData.education) }}</el-descriptions-item>
        <el-descriptions-item label="薪资范围">{{ viewData.salary || '面议' }}</el-descriptions-item>
        <el-descriptions-item label="合作高校" :span="2">
          <el-tag
            v-for="(school, index) in viewData.schools"
            :key="index"
            style="margin-right: 8px; margin-bottom: 4px"
          >
            {{ school }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请人数">{{ viewData.applicants }}人</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(viewData.status)">{{ getStatusName(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ viewData.deadline || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  View,
  Close
} from '@element-plus/icons-vue'
import { talentDemandApi } from '@/api'
import { getValidToken, getUserInfoFromToken } from '@/utils/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const formData = reactive({
  id: null,
  title: '',
  position: '',
  count: 1,
  location: '',
  description: '',
  skills: [],
  education: '',
  salary: '',
  schools: [],
  deadline: null
})

const viewData = reactive({
  title: '',
  position: '',
  count: 0,
  location: '',
  description: '',
  skills: [],
  education: '',
  salary: '',
  schools: [],
  applicants: 0,
  status: '',
  createTime: '',
  deadline: null
})

const skillsText = computed({
  get: () => formData.skills.join(', '),
  set: (val) => {
    formData.skills = val
      .split(/[,，\n]/)
      .map(s => s.trim())
      .filter(s => s)
  }
})

const dialogTitle = computed(() => isEdit.value ? '编辑需求' : '发布需求')

const formRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  count: [{ required: true, message: '请输入需求人数', trigger: 'blur' }],
  location: [{ required: true, message: '请输入工作地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入岗位描述', trigger: 'blur' }]
}

// 人才需求列表数据
const demandList = ref([])

// 验证token并获取人才需求列表
const fetchDemands = async () => {
  console.log('=== 开始获取真实人才需求列表 ===')
  
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
    
    // 3. 发起API请求获取真实人才需求列表
    console.log('🔄 开始获取真实人才需求数据...')
    loading.value = true
    
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status || undefined
    }
    
    console.log('📤 请求参数:', params)
    console.log('🌐 请求地址: /api/enterprise/talent-demands')
    
    const response = await talentDemandApi.getEnterpriseList(params)
    
    console.log('📥 人才需求API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 尝试多种可能的数据结构
      let demands = []
      let total = 0
      
      if (Array.isArray(data)) {
        // 直接是数组格式
        demands = data
        total = data.length
      } else if (typeof data === 'object') {
        // 对象格式，包含list、records、demands等字段
        demands = data.list || data.records || data.data || data.demands || []
        total = data.total || data.count || demands.length
      }
      
      demandList.value = demands
      pagination.total = total
      
      console.log('✅ 真实数据处理完成:', {
        listLength: demandList.value.length,
        total: pagination.total,
        dataSource: 'real_api'
      })
      
      // 如果没有数据，提示用户
      if (demands.length === 0) {
        ElMessage.info('暂无人才需求数据，请先发布')
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('获取数据成功，但数据格式需要调整，请检查后端API')
      demandList.value = []
      pagination.total = 0
    }
    
  } catch (error) {
    console.error('❌ 获取真实人才需求列表失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问人才需求数据')
    } else if (error.response?.status === 404) {
      ElMessage.error('人才需求API接口不存在 (404)，请联系管理员')
      // 404错误时不使用模拟数据，显示真实错误
      console.log('🚫 API接口404，不使用模拟数据，等待后端部署')
      demandList.value = []
      pagination.total = 0
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
      // 500错误时不使用模拟数据，显示真实错误信息
      console.log('🚫 服务器500错误，不使用模拟数据，等待后端修复')
      demandList.value = []
      pagination.total = 0
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
      console.log('🚫 网络错误，不使用模拟数据，等待网络恢复')
      demandList.value = []
      pagination.total = 0
    } else {
      ElMessage.error(`获取人才需求失败: ${error.message || '未知错误'}`)
      console.log('🚫 API调用失败，不使用模拟数据，显示真实错误')
      demandList.value = []
      pagination.total = 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('组件挂载，开始获取人才需求数据')
  fetchDemands()
})

const getStatusTag = (status) => {
  const map = {
    pending: 'warning',
    published: 'success',
    closed: 'info'
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    pending: '待审核',
    published: '已发布',
    closed: '已关闭'
  }
  return map[status] || status
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

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    position: row.position,
    count: row.count,
    location: row.location,
    description: row.description,
    skills: [...row.skills],
    education: row.education,
    salary: row.salary,
    schools: [...row.schools],
    deadline: row.deadline
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  Object.assign(viewData, row)
  viewDialogVisible.value = true
}

// 跳转到详情页面
const viewDetail = (row) => {
  router.push({ name: 'TalentDemandDetail', params: { id: row.id } })
}

const handleClose = async (row) => {
  try {
    await ElMessageBox.confirm('确定要关闭该需求吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('=== 开始关闭人才需求 ===')
    console.log('关闭目标:', row)
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('📤 关闭人才需求请求')
    console.log('🌐 请求地址: /api/enterprise/talent-demands/{id}/close')
    
    const response = await talentDemandApi.closeEnterprise(row.id)
    
    console.log('📥 关闭人才需求API响应:', response)
    
    // 处理关闭响应
    if (response && (response.data || response.code === 200)) {
      console.log('✅ 人才需求关闭成功')
      ElMessage.success('人才需求已关闭')
      
      // 更新本地列表数据
      const index = demandList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        demandList.value[index].status = 'closed'
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('关闭成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也认为关闭成功
      const index = demandList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        demandList.value[index].status = 'closed'
      }
    }
    
  } catch (error) {
    if (error === 'cancel') {
      console.log('🚫 用户取消关闭操作')
      return
    }
    
    console.error('❌ 关闭人才需求失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限关闭人才需求')
    } else if (error.response?.status === 404) {
      ElMessage.error('人才需求API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`关闭人才需求失败: ${error.message || '未知错误'}`)
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该人才需求吗？删除后不可恢复。', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('=== 开始删除人才需求 ===')
    console.log('删除目标:', row)
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('🗑️ 删除人才需求，调用真实API')
    console.log('📤 删除人才需求ID:', row.id)
    console.log('🌐 请求地址: /api/enterprise/talent-demands/{id}')
    
    // 调用真实删除API
    const response = await talentDemandApi.deleteEnterprise(row.id)
    
    console.log('📥 删除人才需求API响应:', response)
    
    // 处理删除响应
    if (response && (response.data || response.code === 200 || response.success)) {
      console.log('✅ 人才需求删除成功')
      ElMessage.success('人才需求删除成功')
      
      // 从本地列表中移除
      const index = demandList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        demandList.value.splice(index, 1)
        pagination.total--
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('删除成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也认为删除成功
      const index = demandList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        demandList.value.splice(index, 1)
        pagination.total--
      }
    }
    
  } catch (error) {
    if (error === 'cancel') {
      console.log('🚫 用户取消删除操作')
      return
    }
    
    console.error('❌ 删除人才需求失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限删除人才需求')
    } else if (error.response?.status === 404) {
      ElMessage.error('删除API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`删除人才需求失败: ${error.message || '未知错误'}`)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    console.log('=== 开始提交人才需求 ===')
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
    
    // 处理学校数据映射
    const schoolNames = {
      tsinghua: '清华大学',
      pku: '北京大学',
      fudan: '复旦大学',
      sjtu: '上海交通大学',
      zju: '浙江大学'
    }
    
    const requestData = {
      title: formData.title,
      position: formData.position,
      count: formData.count,
      location: formData.location,
      description: formData.description,
      skills: formData.skills,
      education: formData.education,
      salary: formData.salary,
      schools: formData.schools.map(key => schoolNames[key] || key),
      deadline: formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : null
    }
    
    if (isEdit.value) {
      // 编辑模式 - 调用真实API
      console.log('📝 编辑人才需求，调用真实API')
      
      console.log('📤 更新请求数据:', requestData)
      console.log('🌐 请求地址: /api/enterprise/talent-demands/{id}')
      
      const response = await talentDemandApi.updateEnterprise(formData.id, requestData)
      
      console.log('📥 更新人才需求API响应:', response)
      
      // 处理真实响应
      if (response && (response.data || response.code === 200)) {
        console.log('✅ 人才需求更新成功')
        ElMessage.success('人才需求更新成功')
        
        // 更新本地列表数据
        const index = demandList.value.findIndex(item => item.id === formData.id)
        if (index > -1) {
          Object.assign(demandList.value[index], {
            ...requestData,
            createTime: demandList.value[index].createTime
          })
        }
        
        // 关闭对话框并重置表单
        dialogVisible.value = false
        resetForm()
        
      } else {
        console.warn('⚠️ API响应数据格式异常:', response)
        ElMessage.warning('更新成功，但响应格式需要调整，请检查后端API')
        dialogVisible.value = false
        resetForm()
      }
    } else {
      // 新增模式 - 调用真实API
      console.log('➕ 创建新人才需求，调用真实API')
      
      console.log('📤 请求数据:', requestData)
      console.log('🌐 请求地址: /api/enterprise/talent-demands')
      
      const response = await talentDemandApi.createEnterprise(requestData)
      
      console.log('📥 创建人才需求API响应:', response)
      
      // 处理真实响应
      if (response && (response.data || response.code === 200 || response.id)) {
        console.log('✅ 人才需求创建成功')
        ElMessage.success('人才需求发布成功，等待审核')
        
        // 关闭对话框并重置表单
        dialogVisible.value = false
        resetForm()
        
        // 刷新列表数据
        await fetchDemands()
        
      } else {
        console.warn('⚠️ API响应数据格式异常:', response)
        ElMessage.warning('发布成功，但响应格式需要调整，请检查后端API')
        dialogVisible.value = false
        resetForm()
        await fetchDemands()
      }
    }
    
  } catch (error) {
    console.error('❌ 提交人才需求失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限发布人才需求')
    } else if (error.response?.status === 404) {
      ElMessage.error('人才需求API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`发布人才需求失败: ${error.message || '未知错误'}`)
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
    title: '',
    position: '',
    count: 1,
    location: '',
    description: '',
    skills: [],
    education: '',
    salary: '',
    schools: [],
    deadline: null
  })
  formRef.value?.clearValidate()
}

const handleSearch = async () => {
  console.log('执行搜索操作:', searchForm)
  pagination.page = 1 // 重置到第一页
  await fetchDemands()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  // 重置后重新加载数据
  handleSearch()
}

const handleSizeChange = async (size) => {
  pagination.size = size
  pagination.page = 1
  await fetchDemands()
}

const handlePageChange = async (page) => {
  pagination.page = page
  await fetchDemands()
}

// 刷新数据（强制获取真实数据）
const handleRefresh = async () => {
  console.log('🔄 手动刷新人才需求数据')
  
  // 清除可能存在的演示数据标识
  demandList.value = []
  pagination.total = 0
  
  // 重新获取数据
  await fetchDemands()
  
  if (demandList.value.some(item => item._isDemo)) {
    ElMessage.warning('刷新后仍显示演示数据，请检查后端API连接')
  } else {
    ElMessage.success('数据刷新成功')
  }
}
</script>

<style lang="scss" scoped>
.talent-demand {
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
}
</style>

