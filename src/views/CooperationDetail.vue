<template>
  <div class="cooperation-detail">
    <el-card shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
            <span style="margin-left: 15px">合作项目详情</span>

          </div>
          <div class="header-right">
            <el-button 
              v-if="projectDetail && projectDetail.status === 'ongoing'"
              type="warning" 
              :icon="TrendCharts" 
              @click="handleUpdateProgress"
            >
              更新进度
            </el-button>
            <el-button 
              v-if="projectDetail && projectDetail.status === 'ongoing'"
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
          <el-button type="primary" @click="fetchProjectDetail">重新加载</el-button>
        </el-empty>
      </div>

      <!-- 详情内容 -->
      <div v-else-if="projectDetail" class="detail-content">
        <!-- 基本信息 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><InfoFilled /></el-icon>
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="项目名称">
              <h3>{{ projectDetail.name }}</h3>
            </el-descriptions-item>
            <el-descriptions-item label="项目状态">
              <el-tag :type="getStatusTag(projectDetail.status)">
                {{ getStatusName(projectDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="合作高校">
              {{ getSchoolName(projectDetail.school) }}
            </el-descriptions-item>
            <el-descriptions-item label="项目类型">
              <el-tag :type="getTypeTag(projectDetail.type)">
                {{ getTypeName(projectDetail.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="参与学生数">{{ projectDetail.students }}人</el-descriptions-item>
            <el-descriptions-item label="项目进度">
              <el-progress 
                :percentage="projectDetail.progress" 
                :status="getProgressStatus(projectDetail.progress)"
              />
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ projectDetail.startTime || projectDetail.start_time }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ projectDetail.endTime || projectDetail.end_time }}</el-descriptions-item>
            <el-descriptions-item label="项目难度">
              <el-tag :type="getDifficultyTag(projectDetail.difficulty)">
                {{ projectDetail.difficulty || '-' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="项目时长">{{ projectDetail.duration ? `${projectDetail.duration}周` : '-' }}</el-descriptions-item>
            <el-descriptions-item label="学分">{{ projectDetail.credits ? `${projectDetail.credits}分` : '-' }}</el-descriptions-item>
            <el-descriptions-item label="预计人数">{{ projectDetail.capacity ? `${projectDetail.capacity}人` : '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 技能要求 -->
        <el-card class="section-card" shadow="never" v-if="projectDetail.skills && projectDetail.skills.length > 0">
          <template #header>
            <div class="section-header">
              <el-icon><Star /></el-icon>
              <span>技能要求</span>
            </div>
          </template>
          <div class="skills-content">
            <el-tag
              v-for="(skill, index) in projectDetail.skills"
              :key="index"
              type="info"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ skill }}
            </el-tag>
          </div>
        </el-card>

        <!-- 项目内容 -->
        <el-card class="section-card" shadow="never" v-if="projectDetail.content && projectDetail.content.length > 0">
          <template #header>
            <div class="section-header">
              <el-icon><List /></el-icon>
              <span>项目内容</span>
            </div>
          </template>
          <ul class="content-list">
            <li v-for="(item, index) in projectDetail.content" :key="index">{{ item }}</li>
          </ul>
        </el-card>

        <!-- 预期收益 -->
        <el-card class="section-card" shadow="never" v-if="projectDetail.gains && projectDetail.gains.length > 0">
          <template #header>
            <div class="section-header">
              <el-icon><Trophy /></el-icon>
              <span>预期收益</span>
            </div>
          </template>
          <ul class="content-list">
            <li v-for="(item, index) in projectDetail.gains" :key="index">{{ item }}</li>
          </ul>
        </el-card>

        <!-- 项目描述 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Document /></el-icon>
              <span>项目描述</span>
            </div>
          </template>
          <div class="description-content">
            {{ projectDetail.description }}
          </div>
        </el-card>

        <!-- 项目目标 -->
        <el-card class="section-card" shadow="never" v-if="projectDetail.goals">
          <template #header>
            <div class="section-header">
              <el-icon><Flag /></el-icon>
              <span>项目目标</span>
            </div>
          </template>
          <div class="goals-content">
            {{ projectDetail.goals }}
          </div>
        </el-card>

        <!-- 联系信息 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><User /></el-icon>
              <span>联系信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="联系人">{{ projectDetail.contact || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ projectDetail.phone || '暂无' }}</el-descriptions-item>
          </el-descriptions>
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
              <el-statistic title="项目天数" :value="projectDays">
                <template #suffix>
                  <span>天</span>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="已完成进度" :value="projectDetail.progress || 0">
                <template #suffix>
                  <span>%</span>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="剩余天数" :value="remainingDays">
                <template #suffix>
                  <span>天</span>
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
            <el-descriptions-item label="创建时间">{{ projectDetail.createTime || projectDetail.created_at }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ projectDetail.updateTime || projectDetail.updated_at || '暂无更新' }}</el-descriptions-item>
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
      title="编辑合作项目"
      width="800px"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="editFormData.name" placeholder="请输入项目名称" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合作高校" prop="school">
              <el-select v-model="editFormData.school" placeholder="请选择合作高校" style="width: 100%">
                <el-option label="清华大学" value="tsinghua" />
                <el-option label="北京大学" value="pku" />
                <el-option label="复旦大学" value="fudan" />
                <el-option label="上海交通大学" value="sjtu" />
                <el-option label="浙江大学" value="zju" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目类型" prop="type">
              <el-select v-model="editFormData.type" placeholder="请选择项目类型" style="width: 100%">
                <el-option label="课程共建" value="course" />
                <el-option label="实习基地" value="internship" />
                <el-option label="科研合作" value="research" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="参与学生数" prop="students">
              <el-input-number
                v-model="editFormData.students"
                :min="1"
                :max="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目进度" prop="progress">
              <el-input-number
                v-model="editFormData.progress"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="editFormData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
          />
        </el-form-item>

        <el-form-item label="项目目标">
          <el-input
            v-model="editFormData.goals"
            type="textarea"
            :rows="3"
            placeholder="请输入项目目标"
          />
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

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="editFormData.contact" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="editFormData.phone" placeholder="请输入联系电话" />
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
          <span>{{ projectDetail?.name }}</span>
        </el-form-item>
        
        <el-form-item label="当前进度">
          <el-progress :percentage="projectDetail?.progress || 0" :status="getProgressStatus(projectDetail?.progress || 0)" />
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  InfoFilled,
  Document,
  Flag,
  User,
  DataAnalysis,
  Clock,
  Edit,
  Delete,
  TrendCharts,
  Star,
  List,
  Trophy
} from '@element-plus/icons-vue'
import { cooperationApi } from '@/api'
import { getValidToken, getUserInfoFromToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const editSubmitLoading = ref(false)
const error = ref('')
const projectDetail = ref(null)
const editDialogVisible = ref(false)
const progressDialogVisible = ref(false)
const progressSubmitLoading = ref(false)
const editFormRef = ref(null)

const editFormData = reactive({
  name: '',
  school: '',
  type: '',
  students: 10,
  progress: 0,
  description: '',
  goals: '',
  startTime: null,
  endTime: null,
  contact: '',
  phone: ''
})

const editFormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  school: [{ required: true, message: '请选择合作高校', trigger: 'change' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  students: [{ required: true, message: '请输入参与学生数', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const progressFormData = reactive({
  progress: 0,
  note: ''
})

const progressFormRules = {
  progress: [{ required: true, message: '请设置项目进度', trigger: 'blur' }]
}

const progressFormRef = ref(null)

// 计算项目天数
const projectDays = computed(() => {
  if (!projectDetail.value?.startTime || !projectDetail.value?.endTime) return 0
  const start = new Date(projectDetail.value.startTime)
  const end = new Date(projectDetail.value.endTime)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 计算剩余天数
const remainingDays = computed(() => {
  if (!projectDetail.value?.endTime) return 0
  const end = new Date(projectDetail.value.endTime)
  const now = new Date()
  const diffTime = end - now
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
})

// 获取合作项目详情
const fetchProjectDetail = async () => {
  const projectId = route.params.id
  if (!projectId) {
    error.value = '缺少合作项目ID'
    return
  }

  console.log('=== 开始获取合作项目详情 ===')
  console.log('合作项目ID:', projectId)
  
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
    
    // 3. 发起API请求获取合作项目详情
    console.log('🔄 开始获取合作项目详情数据...')
    loading.value = true
    error.value = ''
    
    console.log('🌐 请求地址: /api/enterprise/cooperation-projects/{id}')
    
    const response = await cooperationApi.getDetail(projectId)
    
    console.log('📥 合作项目详情API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 处理不同的数据结构
      const detail = typeof data === 'object' ? data : { id: projectId, ...data }
      
      projectDetail.value = detail
      
      console.log('✅ 合作项目详情数据处理完成:', detail)
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      error.value = '获取数据成功，但数据格式需要调整，请检查后端API'
    }
    
  } catch (error) {
    console.error('❌ 获取合作项目详情失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      error.value = '没有权限访问该合作项目详情'
    } else if (error.response?.status === 404) {
      error.value = '合作项目不存在或API接口不存在 (404)'
    } else if (error.response?.status === 500) {
      error.value = '服务器内部错误，请稍后重试或联系管理员'
      console.error('🔥 500错误详情:', error.response?.data)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      error.value = '网络连接失败，请检查网络连接'
    } else {
      error.value = `获取合作项目详情失败: ${error.message || '未知错误'}`
    }
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/cooperation')
}

// 编辑处理
const handleEdit = () => {
  if (!projectDetail.value) return
  
  // 填充表单数据
  Object.assign(editFormData, {
    id: projectDetail.value.id,
    name: projectDetail.value.name,
    school: projectDetail.value.school,
    type: projectDetail.value.type,
    students: projectDetail.value.students,
    progress: projectDetail.value.progress || 0,
    description: projectDetail.value.description,
    goals: projectDetail.value.goals || '',
    startTime: projectDetail.value.startTime ? new Date(projectDetail.value.startTime) : null,
    endTime: projectDetail.value.endTime ? new Date(projectDetail.value.endTime) : null,
    contact: projectDetail.value.contact || '',
    phone: projectDetail.value.phone || ''
  })
  
  editDialogVisible.value = true
}

// 编辑提交
const handleEditSubmit = async () => {
  if (!editFormRef.value || !projectDetail.value) return
  
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return
    
    console.log('=== 开始更新合作项目 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    editSubmitLoading.value = true
    
    const requestData = {
      name: editFormData.name,
      school: editFormData.school,
      type: editFormData.type,
      students: editFormData.students,
      description: editFormData.description,
      goals: editFormData.goals || '',
      start_time: editFormData.startTime ? new Date(editFormData.startTime).toISOString().split('T')[0] : '',
      end_time: editFormData.endTime ? new Date(editFormData.endTime).toISOString().split('T')[0] : '',
      contact: editFormData.contact || '',
      phone: editFormData.phone || ''
    }
    
    console.log('📤 更新请求数据:', requestData)
    console.log('🌐 请求地址: /api/enterprise/cooperation-projects/{id}')
    
    const response = await cooperationApi.updateEnterprise(projectDetail.value.id, requestData)
    
    console.log('📥 更新合作项目API响应:', response)
    
    // 处理更新响应
    if (response && (response.data || response.code === 200)) {
      console.log('✅ 合作项目更新成功')
      ElMessage.success('合作项目更新成功')
      
      // 更新本地详情数据
      Object.assign(projectDetail.value, requestData)
      
      // 关闭对话框
      editDialogVisible.value = false
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('更新成功，但响应格式需要调整，请检查后端API')
      editDialogVisible.value = false
    }
    
  } catch (error) {
    console.error('❌ 更新合作项目失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限更新合作项目')
    } else if (error.response?.status === 404) {
      ElMessage.error('合作项目API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`更新合作项目失败: ${error.message || '未知错误'}`)
    }
  } finally {
    editSubmitLoading.value = false
  }
}





// 删除项目
const handleDelete = async () => {
  if (!projectDetail.value) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除合作项目"${projectDetail.value.name}"吗？删除后不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    console.log('=== 开始删除合作项目 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('🗑️ 删除合作项目，调用真实API')
    console.log('📤 删除合作项目ID:', projectDetail.value.id)
    console.log('🌐 请求地址: /api/enterprise/cooperation-projects/{id}')
    
    // 调用真实删除API
    const response = await cooperationApi.deleteEnterprise(projectDetail.value.id)
    
    console.log('📥 删除合作项目API响应:', response)
    
    // 处理删除响应
    if (response && (response.data || response.code === 200 || response.success)) {
      console.log('✅ 合作项目删除成功')
      ElMessage.success('合作项目删除成功')
      
      // 返回列表页
      router.push('/cooperation')
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('删除成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也认为删除成功
      router.push('/cooperation')
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

// 关闭编辑对话框
const handleEditDialogClose = () => {
  editFormRef.value?.clearValidate()
}

// 获取状态标签
const getStatusTag = (status) => {
  const map = {
    ongoing: 'success',
    completed: 'info',
    paused: 'warning'
  }
  return map[status] || 'info'
}

// 获取状态名称
const getStatusName = (status) => {
  const map = {
    ongoing: '进行中',
    completed: '已完成',
    paused: '已暂停',
    '进行中': '进行中',
    '已完成': '已完成',
    '已结束': '已结束'
  }
  return map[status] || status
}

// 获取学校名称
const getSchoolName = (value) => {
  // 支持对象格式：{ id, name, email, phone }
  if (value && typeof value === 'object' && value.name) {
    return value.name
  }
  // 支持旧的字符串格式
  const map = {
    tsinghua: '清华大学',
    pku: '北京大学',
    fudan: '复旦大学',
    sjtu: '上海交通大学',
    zju: '浙江大学'
  }
  return map[value] || value
}

// 获取难度标签
const getDifficultyTag = (difficulty) => {
  const map = {
    '初级': 'success',
    '中级': 'warning',
    '高级': 'danger'
  }
  return map[difficulty] || 'info'
}

// 获取类型标签
const getTypeTag = (type) => {
  const map = {
    course: 'success',
    internship: 'warning',
    research: 'info'
  }
  return map[type] || 'info'
}

// 获取类型名称
const getTypeName = (type) => {
  const map = {
    course: '课程共建',
    internship: '实习基地',
    research: '科研合作'
  }
  return map[type] || type
}

// 获取进度状态
const getProgressStatus = (progress) => {
  if (progress >= 100) return 'success'
  if (progress >= 50) return null
  return 'exception'
}

// 处理更新进度
const handleUpdateProgress = () => {
  if (!projectDetail.value) return
  
  Object.assign(progressFormData, {
    progress: projectDetail.value.progress || 0,
    note: ''
  })
  progressDialogVisible.value = true
}

// 提交进度更新
const handleProgressSubmit = async () => {
  if (!progressFormRef.value || !projectDetail.value) return
  
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
    
    const response = await cooperationApi.updateProgress(projectDetail.value.id, requestData)
    
    console.log('📥 更新合作项目进度API响应:', response)
    
    // 处理更新响应
    if (response && (response.data || response.code === 200)) {
      console.log('✅ 合作项目进度更新成功')
      ElMessage.success('项目进度更新成功')
      
      // 更新本地详情数据
      projectDetail.value.progress = progressFormData.progress
      // 如果进度达到100%，自动设置为已完成
      if (progressFormData.progress >= 100) {
        projectDetail.value.status = 'completed'
      }
      
      // 关闭对话框
      progressDialogVisible.value = false
      resetProgressForm()
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('进度更新成功，但响应格式需要调整，请检查后端API')
      progressDialogVisible.value = false
      // 即使响应格式异常，也认为更新成功
      projectDetail.value.progress = progressFormData.progress
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
  progressFormRef.value?.clearValidate()
}

// 格式化进度提示
const formatProgress = (value) => {
  return `${value}%`
}

onMounted(() => {
  console.log('合作项目详情页面挂载，开始获取详情数据')
  fetchProjectDetail()
})
</script>

<style lang="scss" scoped>
.cooperation-detail {
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
    .description-content,
    .goals-content {
      line-height: 1.8;
      color: #333;
      white-space: pre-wrap;
    }

    .skills-content {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .content-list {
      margin: 0;
      padding-left: 20px;
      line-height: 2;

      li {
        margin-bottom: 8px;
        color: #333;
      }
    }
  }
  
  .error-state,
  .empty-state {
    padding: 60px 20px;
    text-align: center;
  }
}
</style>