<template>
  <div class="cooperation">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>合作项目管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增项目</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入项目名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="合作高校">
          <el-select v-model="searchForm.school" placeholder="请选择" clearable style="width: 150px">
            <el-option label="清华大学" value="tsinghua" />
            <el-option label="北京大学" value="pku" />
            <el-option label="复旦大学" value="fudan" />
            <el-option label="上海交通大学" value="sjtu" />
            <el-option label="浙江大学" value="zju" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 项目列表 -->
      <el-table :data="projectList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="school" label="合作高校" width="150" />
        <el-table-column prop="type" label="项目类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="项目状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="students" label="参与学生数" width="120" align="center" />
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="getProgressStatus(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="120" />
        <el-table-column prop="endTime" label="结束时间" width="120" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'ongoing'"
              type="warning"
              link
              :icon="TrendCharts"
              @click="handleUpdateProgress(row)"
            >
              更新进度
            </el-button>
            <el-button
              v-if="row.status === 'ongoing'"
              type="primary"
              link
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
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

    <!-- 新增/编辑对话框 -->
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
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合作高校" prop="school">
              <el-select v-model="formData.school" placeholder="请选择合作高校" style="width: 100%">
                <el-option label="清华大学" value="tsinghua" />
                <el-option label="北京大学" value="pku" />
                <el-option label="复旦大学" value="fudan" />
                <el-option label="上海交通大学" value="sjtu" />
                <el-option label="浙江大学" value="zju" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择项目类型" style="width: 100%">
                <el-option label="课程共建" value="course" />
                <el-option label="实习基地" value="internship" />
                <el-option label="科研合作" value="research" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计参与学生数" prop="students">
              <el-input-number
                v-model="formData.students"
                :min="1"
                :max="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="date"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="date"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目目标">
          <el-input
            v-model="formData.goals"
            type="textarea"
            :rows="3"
            placeholder="请输入项目目标"
          />
        </el-form-item>

        <el-form-item label="联系人">
          <el-input v-model="formData.contact" placeholder="请输入联系人姓名" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
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
      title="项目详情"
      width="900px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="合作高校">{{ getSchoolName(viewData.school) }}</el-descriptions-item>
        <el-descriptions-item label="项目类型">
          <el-tag :type="getTypeTag(viewData.type)">{{ getTypeName(viewData.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="项目状态">
          <el-tag :type="getStatusTag(viewData.status)">{{ getStatusName(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="参与学生数">{{ viewData.students }}人</el-descriptions-item>
        <el-descriptions-item label="项目进度">
          <el-progress :percentage="viewData.progress" :status="getProgressStatus(viewData.progress)" />
        </el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">{{ viewData.description }}</el-descriptions-item>
        <el-descriptions-item label="项目目标" :span="2">{{ viewData.goals || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ viewData.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ viewData.endTime }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ viewData.contact }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewData.phone }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 更新进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="更新项目进度"
      width="500px"
      @close="handleProgressDialogClose"
    >
      <el-form
        ref="progressFormRef"
        :model="progressFormData"
        :rules="progressFormRules"
        label-width="120px"
      >
        <el-form-item label="当前项目">
          <span>{{ currentProject?.name }}</span>
        </el-form-item>
        
        <el-form-item label="当前进度">
          <el-progress :percentage="currentProject?.progress || 0" :status="getProgressStatus(currentProject?.progress || 0)" />
        </el-form-item>
        
        <el-form-item label="新进度" prop="progress">
          <el-slider
            v-model="progressFormData.progress"
            :min="0"
            :max="100"
            :step="5"
            show-input
            :format-tooltip="formatProgress"
          />
        </el-form-item>
        
        <el-form-item label="进度说明">
          <el-input
            v-model="progressFormData.note"
            type="textarea"
            :rows="3"
            placeholder="请输入本次进度更新的说明（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProgressSubmit" :loading="progressSubmitLoading">确定</el-button>
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
  TrendCharts
} from '@element-plus/icons-vue'
import { cooperationApi } from '@/api'
import { getValidToken, getUserInfoFromToken } from '@/utils/auth'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const progressDialogVisible = ref(false)
const isEdit = ref(false)
const progressSubmitLoading = ref(false)
const currentProject = ref(null)

const searchForm = reactive({
  keyword: '',
  school: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const formData = reactive({
  id: null,
  name: '',
  school: '',
  type: '',
  students: 10,
  description: '',
  startTime: null,
  endTime: null,
  goals: '',
  contact: '',
  phone: ''
})

const viewData = reactive({
  name: '',
  school: '',
  type: '',
  status: '',
  students: 0,
  progress: 0,
  description: '',
  startTime: '',
  endTime: '',
  goals: '',
  contact: '',
  phone: ''
})

const progressFormData = reactive({
  progress: 0,
  note: ''
})

const progressFormRules = {
  progress: [{ required: true, message: '请设置项目进度', trigger: 'blur' }]
}

const progressFormRef = ref(null)

const dialogTitle = computed(() => isEdit.value ? '编辑项目' : '新增项目')

const formRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  school: [{ required: true, message: '请选择合作高校', trigger: 'change' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  students: [{ required: true, message: '请输入预计参与学生数', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

// 合作项目列表数据
const projectList = ref([])

// 获取合作项目列表
const fetchProjects = async () => {
  console.log('=== 开始获取合作项目列表 ===')
  
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
    
    // 3. 发起API请求获取合作项目列表
    console.log('🔄 开始获取合作项目数据...')
    loading.value = true
    
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      keyword: searchForm.keyword || undefined,
      school: searchForm.school || undefined,
      status: searchForm.status || undefined
    }
    
    console.log('📤 请求参数:', params)
    console.log('🌐 请求地址: /api/enterprise/cooperation-projects')
    
    const response = await cooperationApi.getEnterpriseList(params)
    
    console.log('📥 合作项目API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 尝试多种可能的数据结构
      let projects = []
      let total = 0
      
      if (Array.isArray(data)) {
        // 直接是数组格式
        projects = data
        total = data.length
      } else if (typeof data === 'object') {
        // 对象格式，包含list、records、projects等字段
        projects = data.list || data.records || data.data || data.projects || []
        total = data.total || data.count || projects.length
      }
      
      projectList.value = projects
      pagination.total = total
      
      console.log('✅ 合作项目数据处理完成:', {
        listLength: projectList.value.length,
        total: pagination.total,
        dataSource: 'real_api'
      })
      
      // 如果没有数据，提示用户
      if (projects.length === 0) {
        ElMessage.info('暂无合作项目数据，请先创建')
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('获取数据成功，但数据格式需要调整，请检查后端API')
      projectList.value = []
      pagination.total = 0
    }
    
  } catch (error) {
    console.error('❌ 获取合作项目列表失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问合作项目数据')
    } else if (error.response?.status === 404) {
      ElMessage.error('合作项目API接口不存在 (404)，请联系管理员')
      projectList.value = []
      pagination.total = 0
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
      projectList.value = []
      pagination.total = 0
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
      projectList.value = []
      pagination.total = 0
    } else {
      ElMessage.error(`获取合作项目失败: ${error.message || '未知错误'}`)
      projectList.value = []
      pagination.total = 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('合作项目管理页面挂载，开始获取合作项目数据')
  fetchProjects()
})

const getSchoolName = (value) => {
  const map = {
    tsinghua: '清华大学',
    pku: '北京大学',
    fudan: '复旦大学',
    sjtu: '上海交通大学',
    zju: '浙江大学'
  }
  return map[value] || value
}

const getTypeTag = (type) => {
  const map = {
    course: 'success',
    internship: 'warning',
    research: 'info'
  }
  return map[type] || 'info'
}

const getTypeName = (type) => {
  const map = {
    course: '课程共建',
    internship: '实习基地',
    research: '科研合作'
  }
  return map[type] || type
}

const getStatusTag = (status) => {
  const map = {
    ongoing: 'success',
    completed: 'info'
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    ongoing: '进行中',
    completed: '已完成'
  }
  return map[status] || status
}

const getProgressStatus = (progress) => {
  if (progress >= 100) return 'success'
  if (progress >= 50) return null
  return 'exception'
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
    name: row.name,
    school: row.school,
    type: row.type,
    students: row.students,
    description: row.description,
    startTime: row.startTime,
    endTime: row.endTime,
    goals: row.goals,
    contact: row.contact,
    phone: row.phone
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  // 跳转到详情页面
  router.push(`/cooperation/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？删除后不可恢复。', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('=== 开始删除合作项目 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('🗑️ 删除合作项目，调用真实API')
    console.log('📤 删除合作项目ID:', row.id)
    console.log('🌐 请求地址: /api/enterprise/cooperation-projects/{id}')
    
    // 调用真实删除API
    const response = await cooperationApi.deleteEnterprise(row.id)
    
    console.log('📥 删除合作项目API响应:', response)
    
    // 处理删除响应
    if (response && (response.data || response.code === 200 || response.success)) {
      console.log('✅ 合作项目删除成功')
      ElMessage.success('合作项目删除成功')
      
      // 从本地列表中移除
      const index = projectList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        projectList.value.splice(index, 1)
        pagination.total--
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('删除成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也认为删除成功
      const index = projectList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        projectList.value.splice(index, 1)
        pagination.total--
      }
    }
    
  } catch (error) {
    if (error === 'cancel') {
      console.log('🚫 用户取消删除操作')
      return
    }
    
    console.error('❌ 删除合作项目失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限删除合作项目')
    } else if (error.response?.status === 404) {
      ElMessage.error('删除API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`删除合作项目失败: ${error.message || '未知错误'}`)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        // 构建API请求数据，按照指定的格式
        const requestData = {
          name: formData.name,
          school: formData.school,
          type: formData.type,
          students: formData.students,
          description: formData.description,
          goals: formData.goals || '',
          start_time: formData.startTime ? new Date(formData.startTime).toISOString().split('T')[0] : '',
          end_time: formData.endTime ? new Date(formData.endTime).toISOString().split('T')[0] : '',
          contact: formData.contact || '',
          phone: formData.phone || ''
        }
        
        console.log('📤 准备发送合作项目创建请求:', {
          endpoint: '/api/enterprise/cooperation-projects',
          data: requestData
        })
        
        let response
        if (isEdit.value) {
          // 编辑模式：更新现有项目
          response = await cooperationApi.updateEnterprise(formData.id, requestData)
          console.log('📥 编辑合作项目响应:', response)
          
          if (response && (response.code === 200 || response.data)) {
            // 更新本地列表数据
            const index = projectList.value.findIndex(item => item.id === formData.id)
            if (index > -1) {
              Object.assign(projectList.value[index], {
                ...formData,
                startTime: requestData.start_time,
                endTime: requestData.end_time
              })
            }
            ElMessage.success('项目更新成功')
          } else {
            throw new Error(response?.message || '更新项目失败')
          }
        } else {
          // 创建模式：调用API创建新项目
          response = await cooperationApi.createEnterprise(requestData)
          console.log('📥 创建合作项目响应:', response)
          
          if (response && (response.code === 200 || response.data)) {
            // 添加到本地列表
            const newProject = {
              id: response.data?.id || Date.now(),
              ...formData,
              status: 'ongoing',
              progress: 0,
              startTime: requestData.start_time,
              endTime: requestData.end_time
            }
            projectList.value.unshift(newProject)
            pagination.total++
            ElMessage.success('项目创建成功')
          } else {
            throw new Error(response?.message || '创建项目失败')
          }
        }
        
        dialogVisible.value = false
        resetForm()
        
      } catch (error) {
        console.error('❌ 提交合作项目失败:', error)
        
        // 详细错误处理
        if (error.response?.status === 401) {
          ElMessage.error('登录已过期，请重新登录')
          router.push('/login')
        } else if (error.response?.status === 400) {
          const errorMsg = error.response?.data?.message || '请求数据格式错误'
          ElMessage.error(`创建失败: ${errorMsg}`)
        } else if (error.response?.status === 403) {
          ElMessage.error('没有权限创建合作项目')
        } else if (error.response?.status === 500) {
          ElMessage.error('服务器错误，请稍后重试')
        } else {
          ElMessage.error(`提交失败: ${error.message || '未知错误'}`)
        }
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    school: '',
    type: '',
    students: 10,
    description: '',
    startTime: null,
    endTime: null,
    goals: '',
    contact: '',
    phone: ''
  })
  formRef.value?.clearValidate()
}

const handleSearch = async () => {
  console.log('执行搜索操作:', searchForm)
  pagination.page = 1 // 重置到第一页
  await fetchProjects()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.school = ''
  searchForm.status = ''
  // 重置后重新加载数据
  handleSearch()
}

const handleSizeChange = async (size) => {
  pagination.size = size
  pagination.page = 1
  await fetchProjects()
}

const handlePageChange = async (page) => {
  pagination.page = page
  await fetchProjects()
}

// 处理更新进度
const handleUpdateProgress = (row) => {
  currentProject.value = row
  Object.assign(progressFormData, {
    progress: row.progress || 0,
    note: ''
  })
  progressDialogVisible.value = true
}

// 提交进度更新
const handleProgressSubmit = async () => {
  if (!progressFormRef.value || !currentProject.value) return
  
  try {
    const valid = await progressFormRef.value.validate()
    if (!valid) return
    
    console.log('=== 开始更新合作项目进度 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    progressSubmitLoading.value = true
    
    const requestData = {
      progress: progressFormData.progress,
      note: progressFormData.note || ''
    }
    
    console.log('📤 更新进度请求数据:', requestData)
    console.log('🌐 请求地址: /api/enterprise/cooperation-projects/{id}/progress')
    
    const response = await cooperationApi.updateProgress(currentProject.value.id, requestData)
    
    console.log('📥 更新合作项目进度API响应:', response)
    
    // 处理更新响应
    if (response && (response.data || response.code === 200)) {
      console.log('✅ 合作项目进度更新成功')
      ElMessage.success('项目进度更新成功')
      
      // 更新本地列表数据
      const index = projectList.value.findIndex(item => item.id === currentProject.value.id)
      if (index > -1) {
        projectList.value[index].progress = progressFormData.progress
        // 如果进度达到100%，自动设置为已完成
        if (progressFormData.progress >= 100) {
          projectList.value[index].status = 'completed'
        }
      }
      
      // 关闭对话框
      progressDialogVisible.value = false
      resetProgressForm()
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('进度更新成功，但响应格式需要调整，请检查后端API')
      progressDialogVisible.value = false
      // 即使响应格式异常，也认为更新成功
      const index = projectList.value.findIndex(item => item.id === currentProject.value.id)
      if (index > -1) {
        projectList.value[index].progress = progressFormData.progress
      }
    }
    
  } catch (error) {
    console.error('❌ 更新合作项目进度失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限更新项目进度')
    } else if (error.response?.status === 404) {
      ElMessage.error('合作项目进度更新API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`更新项目进度失败: ${error.message || '未知错误'}`)
    }
  } finally {
    progressSubmitLoading.value = false
  }
}

// 关闭进度更新对话框
const handleProgressDialogClose = () => {
  resetProgressForm()
}

// 重置进度表单
const resetProgressForm = () => {
  Object.assign(progressFormData, {
    progress: 0,
    note: ''
  })
  currentProject.value = null
  progressFormRef.value?.clearValidate()
}

// 格式化进度提示
const formatProgress = (value) => {
  return `${value}%`
}
</script>

<style lang="scss" scoped>
.cooperation {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
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

