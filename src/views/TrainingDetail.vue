<template>
  <div class="training-detail">
    <el-card shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
            <span style="margin-left: 15px">培训计划详情</span>
          </div>
          <div class="header-right">
            <el-button 
              v-if="trainingDetail && trainingDetail.status === 'ongoing'"
              type="success" 
              :icon="TrendCharts" 
              @click="handleUpdateProgress"
            >
              更新进度
            </el-button>
            <el-button 
              v-if="trainingDetail && (trainingDetail.status === 'pending' || trainingDetail.status === 'ongoing')"
              type="primary" 
              :icon="Edit" 
              @click="handleEdit"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              :icon="Delete" 
              @click="handleDelete"
            >
              删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 错误状态 -->
      <div v-if="error" class="error-state">
        <el-empty
          :description="error"
        >
          <el-button type="primary" @click="fetchTrainingDetail">重新加载</el-button>
        </el-empty>
      </div>

      <!-- 详情内容 -->
      <div v-else-if="trainingDetail" class="detail-content">
        <!-- 基本信息 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><InfoFilled /></el-icon>
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="计划名称">
              <h3>{{ trainingDetail.name }}</h3>
            </el-descriptions-item>
            <el-descriptions-item label="计划状态">
              <el-tag :type="getStatusTag(trainingDetail.status)">
                {{ getStatusName(trainingDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="计划类型">
              <el-tag :type="getTypeTag(trainingDetail.type)">
                {{ getTypeName(trainingDetail.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="参与人数">{{ trainingDetail.participants }}人</el-descriptions-item>
            <el-descriptions-item label="培训周期">{{ trainingDetail.duration }}</el-descriptions-item>
            <el-descriptions-item label="完成进度">
              <el-progress :percentage="trainingDetail.progress" :status="getProgressStatus(trainingDetail.progress)" />
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ trainingDetail.startTime || '未设定' }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ trainingDetail.endTime || '未设定' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 计划描述 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Document /></el-icon>
              <span>计划描述</span>
            </div>
          </template>
          <div class="description-content">
            {{ trainingDetail.description }}
          </div>
        </el-card>

        <!-- 培训课程 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Reading /></el-icon>
              <span>培训课程</span>
              <el-tag v-if="getCoursesCount() > 0" type="info" size="small" style="margin-left: 8px">
                共 {{ getCoursesCount() }} 门课程
              </el-tag>
            </div>
          </template>
          <div v-if="getCoursesCount() === 0" class="no-courses">
            <el-empty description="暂无培训课程" :image-size="80">
              <el-button type="primary" size="small" @click="handleEdit">添加课程</el-button>
            </el-empty>
          </div>
          <el-table v-else :data="getCoursesList()" border style="width: 100%">
            <el-table-column prop="name" label="课程名称" min-width="200" />
            <el-table-column prop="school" label="学校" width="150" />
            <el-table-column prop="teacher" label="授课教师" width="120" />
            <el-table-column prop="duration" label="课时" width="100" align="center" />
            <el-table-column prop="type" label="课程类型" width="120">
              <template #default="scope">
                <el-tag :type="getCourseTypeTag(scope.row.type)" size="small">
                  {{ getCourseTypeName(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getCourseStatusTag(scope.row.status)" size="small">
                  {{ getCourseStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 统计信息 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>统计信息</span>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="参与人数" :value="trainingDetail.participants || 0">
                <template #suffix>
                  <el-icon><User /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="课程数量" :value="getCoursesCount()">
                <template #suffix>
                  <el-icon><Reading /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="完成进度" :value="trainingDetail.progress || 0" suffix="%">
                <template #suffix>
                  <el-icon><TrendCharts /></el-icon>
                </template>
              </el-statistic>
            </el-col>
          </el-row>
        </el-card>

        <!-- 时间信息 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Clock /></el-icon>
              <span>时间信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="创建时间">{{ trainingDetail.createTime || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ trainingDetail.updateTime || '暂无更新' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-state">
        <el-empty description="暂无数据" />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑培训计划"
      width="800px"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="editFormData.name" placeholder="请输入计划名称" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划类型" prop="type">
              <el-select v-model="editFormData.type" placeholder="请选择计划类型" style="width: 100%">
                <el-option label="新员工入职培训" value="onboarding" />
                <el-option label="技能提升培训" value="skill" />
                <el-option label="岗位专项培训" value="position" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参与人数" prop="participants">
              <el-input-number
                v-model="editFormData.participants"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="培训周期" prop="duration">
          <el-input v-model="editFormData.duration" placeholder="如：2周" />
        </el-form-item>

        <el-form-item label="计划描述" prop="description">
          <el-input
            v-model="editFormData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入计划描述"
          />
        </el-form-item>

        <el-form-item label="选择课程" prop="courses">
          <el-select
            v-model="editFormData.courses"
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
            <span>已选择 {{ editFormData.courses.length }} 门课程</span>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="editFormData.startTime"
                type="date"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="editFormData.endTime"
                type="date"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit" :loading="editSubmitLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 更新进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="更新培训进度"
      width="500px"
      @close="handleProgressDialogClose"
    >
      <el-form
        ref="progressFormRef"
        :model="progressFormData"
        :rules="progressFormRules"
        label-width="120px"
      >
        <el-form-item label="当前进度" prop="progress">
          <el-slider
            v-model="progressFormData.progress"
            :min="0"
            :max="100"
            :step="5"
            show-input
            :format-tooltip="(val) => `${val}%`"
          />
          <div class="progress-tip">
            <span>当前进度：{{ progressFormData.progress }}%</span>
          </div>
        </el-form-item>
        
        <el-form-item label="进度说明" prop="progressNote">
          <el-input
            v-model="progressFormData.progressNote"
            type="textarea"
            :rows="3"
            placeholder="请输入进度更新说明（可选）"
          />
        </el-form-item>
        
        <el-form-item label="更新状态" prop="status">
          <el-select v-model="progressFormData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProgressSubmit" :loading="progressSubmitLoading">更新进度</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  InfoFilled,
  Document,
  Reading,
  DataAnalysis,
  Clock,
  User,
  TrendCharts,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { trainingApi } from '@/api'
import { getValidToken, getUserInfoFromToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const editSubmitLoading = ref(false)
const error = ref('')
const trainingDetail = ref(null)
const editDialogVisible = ref(false)
const editFormRef = ref(null)

// 更新进度相关
const progressDialogVisible = ref(false)
const progressFormRef = ref(null)
const progressSubmitLoading = ref(false)

const editFormData = reactive({
  name: '',
  type: '',
  participants: 1,
  duration: '',
  description: '',
  courses: [],
  startTime: null,
  endTime: null
})

const availableCourses = ref([])

const editFormRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择计划类型', trigger: 'change' }],
  participants: [{ required: true, message: '请输入参与人数', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入培训周期', trigger: 'blur' }],
  description: [{ required: true, message: '请输入计划描述', trigger: 'blur' }],
  courses: [{ required: true, message: '请至少选择一门课程', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

// 更新进度表单数据
const progressFormData = reactive({
  progress: 0,
  progressNote: '',
  status: 'ongoing'
})

const progressFormRules = {
  progress: [
    { required: true, message: '请选择进度', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '进度必须在0-100之间', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 获取培训计划详情
const fetchTrainingDetail = async () => {
  const trainingId = route.params.id
  if (!trainingId) {
    error.value = '缺少培训计划ID'
    return
  }

  console.log('=== 开始获取培训计划详情 ===')
  console.log('培训计划ID:', trainingId)
  
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
    
    // 3. 发起API请求获取培训计划详情
    console.log('🔄 开始获取培训计划详情数据...')
    loading.value = true
    error.value = ''
    
    console.log('🌐 请求地址: /api/enterprise/training-plans/{id}')
    
    const response = await trainingApi.getDetail(trainingId)
    
    console.log('📥 培训计划详情API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 处理不同的数据结构
      const detail = typeof data === 'object' ? data : { id: trainingId, ...data }
      
      trainingDetail.value = detail
      
      console.log('✅ 培训计划详情数据处理完成:', detail)
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      error.value = '获取数据成功，但数据格式需要调整，请检查后端API'
    }
    
  } catch (error) {
    console.error('❌ 获取培训计划详情失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      error.value = '没有权限访问该培训计划详情'
    } else if (error.response?.status === 404) {
      error.value = '培训计划不存在或API接口不存在 (404)'
    } else if (error.response?.status === 500) {
      error.value = '服务器内部错误，请稍后重试或联系管理员'
      console.error('🔥 500错误详情:', error.response?.data)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      error.value = '网络连接失败，请检查网络连接'
    } else {
      error.value = `获取培训计划详情失败: ${error.message || '未知错误'}`
    }
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/training')
}

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

// 编辑处理
const handleEdit = () => {
  if (!trainingDetail.value) return
  
  // 获取当前课程列表
  const currentCourses = getCoursesList()
  
  // 处理课程数据，提取课程ID用于表单
  let courseIds = []
  if (currentCourses && currentCourses.length > 0) {
    courseIds = currentCourses.map(course => {
      // 优先使用ID，如果没有则使用名称
      return course.id || course.name || course.courseName
    })
  }
  
  // 填充表单数据
  Object.assign(editFormData, {
    id: trainingDetail.value.id,
    name: trainingDetail.value.name,
    type: trainingDetail.value.type,
    participants: trainingDetail.value.participants,
    duration: trainingDetail.value.duration,
    description: trainingDetail.value.description,
    courses: courseIds,
    startTime: trainingDetail.value.startTime ? new Date(trainingDetail.value.startTime) : null,
    endTime: trainingDetail.value.endTime ? new Date(trainingDetail.value.endTime) : null
  })
  
  console.log('📝 编辑表单初始化:', {
    originalCourses: getCoursesList(),
    courseIds: courseIds,
    availableCourses: availableCourses.value.length
  })
  
  editDialogVisible.value = true
}

// 编辑提交
const handleEditSubmit = async () => {
  if (!editFormRef.value || !trainingDetail.value) return
  
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return
    
    console.log('=== 开始更新培训计划 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    editSubmitLoading.value = true
    
    // 处理课程数据，确保发送正确的格式
    let processedCourses = []
    console.log('📚 原始课程数据:', editFormData.courses)
    
    if (editFormData.courses && editFormData.courses.length > 0) {
      processedCourses = editFormData.courses.map(courseId => {
        // 如果是对象，提取ID
        if (typeof courseId === 'object' && courseId.id) {
          console.log('🔧 处理对象课程:', courseId, '-> ID:', courseId.id)
          return courseId.id
        }
        // 如果是字符串或数字，直接返回
        console.log('🔧 处理基础类型课程:', courseId)
        return courseId
      })
    }
    
    console.log('🎯 处理后的课程数据:', processedCourses)

    const requestData = {
      name: editFormData.name,
      type: editFormData.type,
      participants: editFormData.participants,
      duration: editFormData.duration,
      description: editFormData.description,
      courses: processedCourses,
      startTime: editFormData.startTime ? new Date(editFormData.startTime).toISOString().split('T')[0] : null,
      endTime: editFormData.endTime ? new Date(editFormData.endTime).toISOString().split('T')[0] : null
    }
    
    console.log('📤 更新请求数据:', requestData)
    console.log('🌐 请求地址: /api/enterprise/training-plans/{id}')
    
    const response = await trainingApi.updateEnterprise(trainingDetail.value.id, requestData)
    
    console.log('📥 更新培训计划API响应:', response)
    
    // 处理更新响应
    if (response && (response.data || response.code === 200)) {
      console.log('✅ 培训计划更新成功')
      ElMessage.success('培训计划更新成功')
      
      // 重新获取最新的培训计划详情数据
      await fetchTrainingDetail()
      
      // 关闭对话框
      editDialogVisible.value = false
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('更新成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也尝试刷新数据
      await fetchTrainingDetail()
      editDialogVisible.value = false
    }
    
  } catch (error) {
    console.error('❌ 更新培训计划失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限更新培训计划')
    } else if (error.response?.status === 404) {
      ElMessage.error('培训计划API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`更新培训计划失败: ${error.message || '未知错误'}`)
    }
  } finally {
    editSubmitLoading.value = false
  }
}

// 关闭编辑对话框
const handleEditDialogClose = () => {
  editFormRef.value?.clearValidate()
}

// 删除培训计划
const handleDelete = async () => {
  if (!trainingDetail.value) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除培训计划"${trainingDetail.value.name}"吗？删除后不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    console.log('=== 开始删除培训计划 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('🗑️ 删除培训计划，调用真实API')
    console.log('📤 删除培训计划ID:', trainingDetail.value.id)
    console.log('🌐 请求地址: /api/enterprise/training-plans/{id}')
    
    // 调用真实删除API
    const response = await trainingApi.deleteEnterprise(trainingDetail.value.id)
    
    console.log('📥 删除培训计划API响应:', response)
    
    // 处理删除响应
    if (response && (response.data || response.code === 200 || response.success)) {
      console.log('✅ 培训计划删除成功')
      ElMessage.success('培训计划删除成功')
      
      // 返回列表页
      router.push('/training')
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('删除成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也认为删除成功
      router.push('/training')
    }
    
  } catch (error) {
    if (error === 'cancel') {
      console.log('🚫 用户取消删除操作')
      return
    }
    
    console.error('❌ 删除培训计划失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限删除培训计划')
    } else if (error.response?.status === 404) {
      ElMessage.error('删除API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`删除培训计划失败: ${error.message || '未知错误'}`)
    }
  }
}

// 处理更新进度
const handleUpdateProgress = () => {
  if (!trainingDetail.value) return
  
  // 初始化进度表单数据
  Object.assign(progressFormData, {
    progress: trainingDetail.value.progress || 0,
    progressNote: '',
    status: trainingDetail.value.status || 'ongoing'
  })
  
  progressDialogVisible.value = true
}

// 提交进度更新
const handleProgressSubmit = async () => {
  if (!progressFormRef.value || !trainingDetail.value) return
  
  try {
    const valid = await progressFormRef.value.validate()
    if (!valid) return
    
    console.log('=== 开始更新培训进度 ===')
    
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
      progressNote: progressFormData.progressNote,
      status: progressFormData.status
    }
    
    console.log('📤 更新进度请求数据:', requestData)
    console.log('🌐 请求地址: /api/enterprise/training-plans/{id}/progress')
    
    const response = await trainingApi.updateProgress(trainingDetail.value.id, requestData)
    
    console.log('📥 更新培训进度API响应:', response)
    
    // 处理更新响应
    if (response && (response.data || response.code === 200)) {
      console.log('✅ 培训进度更新成功')
      ElMessage.success('培训进度更新成功')
      
      // 重新获取最新的培训计划详情数据
      await fetchTrainingDetail()
      
      // 关闭对话框
      progressDialogVisible.value = false
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('更新成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也尝试刷新数据
      await fetchTrainingDetail()
      progressDialogVisible.value = false
    }
    
  } catch (error) {
    console.error('❌ 更新培训进度失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限更新培训进度')
    } else if (error.response?.status === 404) {
      ElMessage.error('培训计划或API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`更新培训进度失败: ${error.message || '未知错误'}`)
    }
  } finally {
    progressSubmitLoading.value = false
  }
}

// 关闭进度更新对话框
const handleProgressDialogClose = () => {
  progressFormRef.value?.clearValidate()
  Object.assign(progressFormData, {
    progress: 0,
    progressNote: '',
    status: 'ongoing'
  })
}

// 获取状态标签
const getStatusTag = (status) => {
  const map = {
    pending: 'info',
    ongoing: 'success',
    completed: ''
  }
  return map[status] || 'info'
}

// 获取状态名称
const getStatusName = (status) => {
  const map = {
    pending: '待开始',
    ongoing: '进行中',
    completed: '已完成'
  }
  return map[status] || status
}

// 获取类型标签
const getTypeTag = (type) => {
  const map = {
    onboarding: 'primary',
    skill: 'success',
    position: 'warning'
  }
  return map[type] || 'info'
}

// 获取类型名称
const getTypeName = (type) => {
  const map = {
    onboarding: '新员工入职培训',
    skill: '技能提升培训',
    position: '岗位专项培训'
  }
  return map[type] || type
}

// 获取进度状态
const getProgressStatus = (progress) => {
  if (progress >= 100) return 'success'
  if (progress >= 50) return null
  return 'exception'
}

// 获取课程列表数据（兼容多种数据结构）
const getCoursesList = () => {
  if (!trainingDetail.value) return []
  
  console.log('🔍 获取课程列表，原始数据:', {
    trainingDetail: trainingDetail.value,
    availableCourses: availableCourses.value.length
  })
  
  // 尝试从不同字段获取课程数据
  const courses = trainingDetail.value.courses || 
                  trainingDetail.value.courseList || 
                  trainingDetail.value.trainingCourses ||
                  trainingDetail.value.planCourses ||
                  []
  
  console.log('📚 课程数据源:', {
    courses: courses,
    coursesType: typeof courses,
    coursesLength: courses ? courses.length : 0,
    keys: trainingDetail.value ? Object.keys(trainingDetail.value) : []
  })
  
  // 确保数据是数组格式
  if (Array.isArray(courses) && courses.length > 0) {
    const processedCourses = courses.map((course, index) => {
      console.log(`📖 处理课程 ${index}:`, course)
      
      // 处理不同的数据结构
      if (typeof course === 'string' || typeof course === 'number') {
        // 如果是字符串或数字，从可选课程中查找详情
        const foundCourse = availableCourses.value.find(c => 
          c.id === course || c.name === course || c.id === parseInt(course) || c.name === String(course)
        )
        console.log(`🔍 查找课程 ${course}:`, foundCourse ? '找到' : '未找到')
        
        return foundCourse || { 
          id: course, 
          name: `课程ID: ${course}`, 
          school: '未知', 
          teacher: '未知', 
          duration: 0,
          type: 'unknown',
          status: 'pending'
        }
      }
      
      // 如果是对象，确保有必需的字段
      const processedCourse = {
        id: course.id || course.courseId || `temp_${index}`,
        name: course.name || course.courseName || course.title || '未命名课程',
        school: course.school || course.institution || course.provider || '未知学校',
        teacher: course.teacher || course.instructor || course.lecturer || '未知教师',
        duration: course.duration || course.hours || course.credits || 0,
        type: course.type || 'required',
        status: course.status || 'pending',
        ...course
      }
      
      console.log(`✅ 处理完成课程 ${index}:`, processedCourse)
      return processedCourse
    })
    
    console.log('🎯 最终课程列表:', processedCourses)
    return processedCourses
  }
  
  console.log('⚠️ 没有找到课程数据')
  return []
}

// 获取课程数量
const getCoursesCount = () => {
  return getCoursesList().length
}

// 获取课程类型标签
const getCourseTypeTag = (type) => {
  const map = {
    required: 'danger',
    optional: 'info',
    elective: 'success',
    core: 'warning',
    unknown: ''
  }
  return map[type] || 'info'
}

// 获取课程类型名称
const getCourseTypeName = (type) => {
  const map = {
    required: '必修课',
    optional: '选修课',
    elective: '选修课',
    core: '核心课',
    unknown: '未知类型'
  }
  return map[type] || type || '选修课'
}

// 获取课程状态标签
const getCourseStatusTag = (status) => {
  const map = {
    pending: 'info',
    ongoing: 'primary',
    completed: 'success',
    cancelled: 'danger',
    unknown: 'info'
  }
  return map[status] || 'info'
}

// 获取课程状态名称
const getCourseStatusName = (status) => {
  const map = {
    pending: '待开始',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    unknown: '未知状态'
  }
  return map[status] || status || '待开始'
}

onMounted(() => {
  console.log('培训计划详情页面挂载，开始获取详情数据')
  // 并行获取培训计划详情和可选课程列表
  Promise.all([
    fetchTrainingDetail(),
    fetchAvailableCourses()
  ])
})
</script>

<style lang="scss" scoped>
.training-detail {
  padding: 20px;
  
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
      gap: 10px;
    }
  }
  
  .section-card {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .section-header {
    display: flex;
    align-items: center;
    font-weight: 600;
    
    .el-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }
  
  .detail-content {
    .description-content {
      line-height: 1.8;
      color: #333;
      white-space: pre-wrap;
    }
  }
  
  .error-state,
  .empty-state {
    padding: 60px 20px;
    text-align: center;
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
  
  .no-courses {
    padding: 20px 0;
    text-align: center;
  }
  
  .progress-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
  }
}
</style>