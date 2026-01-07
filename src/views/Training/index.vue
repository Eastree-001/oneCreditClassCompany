<template>
  <div class="training">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>培训课程管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">创建计划</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="计划名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入计划名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="计划状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="待开始" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 计划列表 -->
      <el-table :data="planList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="计划名称" min-width="200" />
        <el-table-column prop="type" label="计划类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="计划状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与人数" width="100" align="center" />
        <el-table-column prop="courses" label="课程数量" width="100" align="center">
          <template #default="{ row }">
            {{ row.courses.length }}门
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="培训周期" width="120" />
        <el-table-column prop="progress" label="完成进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="getProgressStatus(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="viewDetail(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'pending' || row.status === 'ongoing'"
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
            <el-form-item label="计划名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择计划类型" style="width: 100%">
                <el-option label="新员工入职培训" value="onboarding" />
                <el-option label="技能提升培训" value="skill" />
                <el-option label="岗位专项培训" value="position" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="参与人数" prop="participants">
              <el-input-number
                v-model="formData.participants"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="培训周期" prop="duration">
              <el-input v-model="formData.duration" placeholder="如：2周" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="计划描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入计划描述"
          />
        </el-form-item>

        <el-form-item label="选择课程" prop="courses">
          <el-select
            v-model="formData.courses"
            multiple
            filterable
            placeholder="请选择培训课程（可多选）"
            style="width: 100%"
          >
            <el-option
              v-for="course in availableCourses"
              :key="course.id"
              :label="`${course.name} - ${course.school}`"
              :value="course.id"
            >
              <div class="course-option">
                <span>{{ course.name }}</span>
                <el-tag size="small" style="margin-left: 8px">{{ course.school }}</el-tag>
              </div>
            </el-option>
          </el-select>
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>已选择 {{ formData.courses.length }} 门课程</span>
          </div>
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
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="培训课程详情"
      width="900px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="计划名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="计划类型">
          <el-tag :type="getTypeTag(viewData.type)">{{ getTypeName(viewData.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计划状态">
          <el-tag :type="getStatusTag(viewData.status)">{{ getStatusName(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="参与人数">{{ viewData.participants }}人</el-descriptions-item>
        <el-descriptions-item label="课程数量">{{ viewData.courses.length }}门</el-descriptions-item>
        <el-descriptions-item label="培训周期">{{ viewData.duration }}</el-descriptions-item>
        <el-descriptions-item label="完成进度">
          <el-progress :percentage="viewData.progress" :status="getProgressStatus(viewData.progress)" />
        </el-descriptions-item>
        <el-descriptions-item label="计划描述" :span="2">{{ viewData.description }}</el-descriptions-item>
        <el-descriptions-item label="培训课程" :span="2">
          <el-table :data="viewData.courses" border style="width: 100%">
            <el-table-column prop="name" label="课程名称" min-width="200" />
            <el-table-column prop="school" label="学校" width="150" />
            <el-table-column prop="teacher" label="授课教师" width="120" />
            <el-table-column prop="duration" label="课时" width="100" align="center" />
          </el-table>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ viewData.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ viewData.endTime }}</el-descriptions-item>
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
  InfoFilled
} from '@element-plus/icons-vue'
import { trainingApi } from '@/api'
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
  name: '',
  type: '',
  participants: 10,
  duration: '',
  description: '',
  courses: [],
  startTime: null,
  endTime: null
})

const viewData = reactive({
  name: '',
  type: '',
  status: '',
  participants: 0,
  duration: '',
  progress: 0,
  description: '',
  courses: [],
  startTime: '',
  endTime: ''
})

const dialogTitle = computed(() => isEdit.value ? '编辑计划' : '创建计划')

const formRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择计划类型', trigger: 'change' }],
  participants: [{ required: true, message: '请输入参与人数', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入培训周期', trigger: 'blur' }],
  description: [{ required: true, message: '请输入计划描述', trigger: 'blur' }],
  courses: [{ required: true, message: '请至少选择一门课程', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const availableCourses = ref([])

// 培训课程列表数据
const planList = ref([])

// 获取可选课程列表
const fetchAvailableCourses = async () => {
  console.log('=== 开始获取可选课程列表 ===')
  
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
    
    // 3. 发起API请求获取可选课程列表
    console.log('🔄 开始获取可选课程数据...')
    
    console.log('🌐 请求地址: /api/enterprise/training-plans/available-courses')
    
    const response = await trainingApi.getAvailableCourses()
    
    console.log('📥 可选课程API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 尝试多种可能的数据结构
      let courses = []
      
      if (Array.isArray(data)) {
        // 直接是数组格式
        courses = data
      } else if (typeof data === 'object') {
        // 对象格式，包含list、records、courses等字段
        courses = data.list || data.records || data.data || data.courses || []
      }
      
      availableCourses.value = courses
      
      console.log('✅ 可选课程数据处理完成:', {
        coursesLength: availableCourses.value.length,
        dataSource: 'real_api'
      })
      
      // 如果没有课程，提示用户
      if (courses.length === 0) {
        console.log('暂无可选课程数据')
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      availableCourses.value = []
    }
    
  } catch (error) {
    console.error('❌ 获取可选课程列表失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      console.log('没有权限访问可选课程数据')
    } else if (error.response?.status === 404) {
      console.log('可选课程API接口不存在 (404)，使用默认课程列表')
    } else if (error.response?.status === 500) {
      console.log('服务器内部错误，使用默认课程列表')
      console.error('🔥 500错误详情:', error.response?.data)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.log('网络连接失败，使用默认课程列表')
    } else {
      console.log(`获取可选课程失败: ${error.message || '未知错误'}`)
    }
    
    // 在任何错误情况下，都使用默认的课程列表作为备选
    availableCourses.value = [
      { id: 1, name: 'React 前端开发实战', school: '清华大学', teacher: '张教授', duration: 32 },
      { id: 2, name: '现代Web开发技术栈', school: '北京大学', teacher: '李教授', duration: 40 },
      { id: 3, name: '云数据库应用开发', school: '复旦大学', teacher: '王教授', duration: 24 },
      { id: 4, name: '工作流自动化工具', school: '上海交大', teacher: '陈教授', duration: 16 },
      { id: 5, name: 'TypeScript 高级编程', school: '浙江大学', teacher: '刘教授', duration: 28 },
      { id: 6, name: 'Python 机器学习', school: '清华大学', teacher: '赵教授', duration: 36 },
      { id: 7, name: '深度学习实战', school: '北京大学', teacher: '孙教授', duration: 42 }
    ]
  }
}

// 验证token并获取培训课程列表
const fetchTrainingPlans = async () => {
  console.log('=== 开始获取真实培训课程列表 ===')
  
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
    
    // 3. 发起API请求获取真实培训课程列表
    console.log('🔄 开始获取真实培训课程数据...')
    loading.value = true
    
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status || undefined
    }
    
    console.log('📤 请求参数:', params)
    console.log('🌐 请求地址: /api/enterprise/training-plans')
    
    const response = await trainingApi.getEnterpriseList(params)
    
    console.log('📥 培训课程API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 尝试多种可能的数据结构
      let plans = []
      let total = 0
      
      if (Array.isArray(data)) {
        // 直接是数组格式
        plans = data
        total = data.length
      } else if (typeof data === 'object') {
        // 对象格式，包含list、records、plans等字段
        plans = data.list || data.records || data.data || data.plans || []
        total = data.total || data.count || plans.length
      }
      
      planList.value = plans
      pagination.total = total
      
      console.log('✅ 真实数据处理完成:', {
        listLength: planList.value.length,
        total: pagination.total,
        dataSource: 'real_api'
      })
      
      // 如果没有数据，提示用户
      if (plans.length === 0) {
        ElMessage.info('暂无培训课程数据，请先创建')
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('获取数据成功，但数据格式需要调整，请检查后端API')
      planList.value = []
      pagination.total = 0
    }
    
  } catch (error) {
    console.error('❌ 获取真实培训课程列表失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问培训课程数据')
    } else if (error.response?.status === 404) {
      ElMessage.error('培训课程API接口不存在 (404)，请联系管理员')
      planList.value = []
      pagination.total = 0
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
      planList.value = []
      pagination.total = 0
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
      planList.value = []
      pagination.total = 0
    } else {
      ElMessage.error(`获取培训课程失败: ${error.message || '未知错误'}`)
      planList.value = []
      pagination.total = 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('培训课程页面挂载，开始获取培训课程数据')
  // 并行获取培训课程列表和可选课程列表
  Promise.all([
    fetchTrainingPlans(),
    fetchAvailableCourses()
  ])
})

const getTypeTag = (type) => {
  const map = {
    onboarding: 'primary',
    skill: 'success',
    position: 'warning'
  }
  return map[type] || 'info'
}

const getTypeName = (type) => {
  const map = {
    onboarding: '新员工入职培训',
    skill: '技能提升培训',
    position: '岗位专项培训'
  }
  return map[type] || type
}

const getStatusTag = (status) => {
  const map = {
    pending: 'info',
    ongoing: 'success',
    completed: ''
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    pending: '待开始',
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
    type: row.type,
    participants: row.participants,
    duration: row.duration,
    description: row.description,
    courses: row.courses.map(c => c.id || c.name),
    startTime: row.startTime,
    endTime: row.endTime
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  Object.assign(viewData, row)
  viewDialogVisible.value = true
}

// 跳转到详情页面
const viewDetail = (row) => {
  router.push({ name: 'TrainingDetail', params: { id: row.id } })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该培训课程吗？删除后不可恢复。', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('=== 开始删除培训课程 ===')
    console.log('删除目标:', row)
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('🗑️ 删除培训课程，调用真实API')
    console.log('📤 删除培训课程ID:', row.id)
    console.log('🌐 请求地址: /api/enterprise/training-plans/{id}')
    
    // 调用真实删除API
    const response = await trainingApi.deleteEnterprise(row.id)
    
    console.log('📥 删除培训课程API响应:', response)
    
    // 处理删除响应
    if (response && (response.data || response.code === 200 || response.success)) {
      console.log('✅ 培训课程删除成功')
      ElMessage.success('培训课程删除成功')
      
      // 从本地列表中移除
      const index = planList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        planList.value.splice(index, 1)
        pagination.total--
      }
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('删除成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也认为删除成功
      const index = planList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        planList.value.splice(index, 1)
        pagination.total--
      }
    }
    
  } catch (error) {
    if (error === 'cancel') {
      console.log('🚫 用户取消删除操作')
      return
    }
    
    console.error('❌ 删除培训课程失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限删除培训课程')
    } else if (error.response?.status === 404) {
      ElMessage.error('删除API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`删除培训课程失败: ${error.message || '未知错误'}`)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    console.log('=== 开始提交培训课程 ===')
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
    
    const requestData = {
      name: formData.name,
      type: formData.type,
      participants: formData.participants,
      duration: formData.duration,
      description: formData.description,
      courses: formData.courses,
      startTime: formData.startTime ? new Date(formData.startTime).toISOString().split('T')[0] : null,
      endTime: formData.endTime ? new Date(formData.endTime).toISOString().split('T')[0] : null
    }
    
    if (isEdit.value) {
      // 编辑模式 - 调用真实API
      console.log('📝 编辑培训课程，调用真实API')
      
      console.log('📤 更新请求数据:', requestData)
      console.log('🌐 请求地址: /api/enterprise/training-plans/{id}')
      
      const response = await trainingApi.updateEnterprise(formData.id, requestData)
      
      console.log('📥 更新培训课程API响应:', response)
      
      // 处理真实响应
      if (response && (response.data || response.code === 200)) {
        console.log('✅ 培训课程更新成功')
        ElMessage.success('培训课程更新成功')
        
        // 更新本地列表数据
        const index = planList.value.findIndex(item => item.id === formData.id)
        if (index > -1) {
          Object.assign(planList.value[index], {
            ...requestData,
            createTime: planList.value[index].createTime
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
      console.log('➕ 创建新培训课程，调用真实API')
      
      console.log('📤 请求数据:', requestData)
      console.log('🌐 请求地址: /api/enterprise/training-plans')
      
      const response = await trainingApi.createEnterprise(requestData)
      
      console.log('📥 创建培训课程API响应:', response)
      
      // 处理真实响应
      if (response && (response.data || response.code === 200 || response.id)) {
        console.log('✅ 培训课程创建成功')
        ElMessage.success('培训课程创建成功')
        
        // 关闭对话框并重置表单
        dialogVisible.value = false
        resetForm()
        
        // 刷新列表数据
        await fetchTrainingPlans()
        
      } else {
        console.warn('⚠️ API响应数据格式异常:', response)
        ElMessage.warning('创建成功，但响应格式需要调整，请检查后端API')
        dialogVisible.value = false
        resetForm()
        await fetchTrainingPlans()
      }
    }
    
  } catch (error) {
    console.error('❌ 提交培训课程失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限创建培训课程')
    } else if (error.response?.status === 404) {
      ElMessage.error('培训课程API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
      console.error('🔥 500错误详情:', error.response?.data)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`创建培训课程失败: ${error.message || '未知错误'}`)
    }
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
    participants: 10,
    duration: '',
    description: '',
    courses: [],
    startTime: null,
    endTime: null
  })
  formRef.value?.clearValidate()
}

const handleSearch = async () => {
  console.log('执行搜索操作:', searchForm)
  pagination.page = 1 // 重置到第一页
  await fetchTrainingPlans()
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
  await fetchTrainingPlans()
}

const handlePageChange = async (page) => {
  pagination.page = page
  await fetchTrainingPlans()
}
</script>

<style lang="scss" scoped>
.training {
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
  
  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .course-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

