<template>
  <div class="talent-demand-detail">
    <el-card shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
            <span style="margin-left: 15px">人才需求详情</span>

          </div>
          <div class="header-right">
            <el-button 
              v-if="demandDetail && demandDetail.status === 'published'"
              type="primary" 
              :icon="Edit" 
              @click="handleEdit"
            >
              编辑
            </el-button>
            <el-button 
              v-if="demandDetail && demandDetail.status === 'published'"
              type="warning" 
              :icon="Close" 
              @click="handleClose"
            >
              关闭需求
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
          <el-button type="primary" @click="fetchDemandDetail">重新加载</el-button>
        </el-empty>
      </div>

      <!-- 详情内容 -->
      <div v-else-if="demandDetail" class="detail-content">
        <!-- 基本信息 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><InfoFilled /></el-icon>
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="需求标题">
              <h3>{{ demandDetail.title }}</h3>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTag(demandDetail.status)">
                {{ getStatusName(demandDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="岗位名称">{{ demandDetail.position }}</el-descriptions-item>
            <el-descriptions-item label="需求人数">{{ demandDetail.count }}人</el-descriptions-item>
            <el-descriptions-item label="工作地点">{{ demandDetail.location }}</el-descriptions-item>
            <el-descriptions-item label="薪资范围">{{ demandDetail.salary || '面议' }}</el-descriptions-item>
            <el-descriptions-item label="学历要求">
              {{ getEducationName(demandDetail.education) }}
            </el-descriptions-item>
            <el-descriptions-item label="截止日期">
              {{ demandDetail.deadline || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 岗位描述 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Document /></el-icon>
              <span>岗位描述</span>
            </div>
          </template>
          <div class="description-content">
            {{ demandDetail.description }}
          </div>
        </el-card>

        <!-- 技能要求 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Tools /></el-icon>
              <span>技能要求</span>
            </div>
          </template>
          <div class="skills-container">
            <el-tag
              v-for="(skill, index) in demandDetail.skills"
              :key="index"
              class="skill-tag"
              size="large"
            >
              {{ skill }}
            </el-tag>
            <div v-if="!demandDetail.skills || demandDetail.skills.length === 0" class="no-data">
              暂无技能要求
            </div>
          </div>
        </el-card>

        <!-- 合作高校 -->
        <el-card class="section-card" shadow="never" v-if="demandDetail.schools && demandDetail.schools.length > 0">
          <template #header>
            <div class="section-header">
              <el-icon><School /></el-icon>
              <span>合作高校</span>
            </div>
          </template>
          <div class="schools-container">
            <el-tag
              v-for="(school, index) in demandDetail.schools"
              :key="index"
              class="school-tag"
              type="success"
            >
              {{ school }}
            </el-tag>
          </div>
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
              <el-statistic title="申请人数" :value="demandDetail.applicants || 0">
                <template #suffix>
                  <el-icon><User /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="浏览次数" :value="demandDetail.views || 0">
                <template #suffix>
                  <el-icon><View /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="发布天数" :value="publishDays">
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
            <el-descriptions-item label="创建时间">{{ demandDetail.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ demandDetail.updateTime || '暂无更新' }}</el-descriptions-item>
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
      title="编辑人才需求"
      width="800px"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item label="需求标题" prop="title">
          <el-input v-model="editFormData.title" placeholder="请输入需求标题" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="position">
              <el-input v-model="editFormData.position" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求人数" prop="count">
              <el-input-number
                v-model="editFormData.count"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="工作地点" prop="location">
          <el-input v-model="editFormData.location" placeholder="请输入工作地点" />
        </el-form-item>

        <el-form-item label="岗位描述" prop="description">
          <el-input
            v-model="editFormData.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述岗位职责和要求"
          />
        </el-form-item>

        <el-form-item label="技能要求" prop="skills">
          <el-input
            v-model="skillsEditText"
            type="textarea"
            :rows="3"
            placeholder="请输入技能要求，多个技能用逗号或换行分隔"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历要求" prop="education">
              <el-select v-model="editFormData.education" placeholder="请选择" style="width: 100%">
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
              <el-input v-model="editFormData.salary" placeholder="如：10k-20k" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="截止日期">
          <el-date-picker
            v-model="editFormData.deadline"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit" :loading="editSubmitLoading">保存</el-button>
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
  Tools,
  School,
  DataAnalysis,
  Clock,
  User,
  View,
  Edit,
  Close,
  Delete
} from '@element-plus/icons-vue'
import { talentDemandApi } from '@/api'
import { getValidToken, getUserInfoFromToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const editSubmitLoading = ref(false)
const error = ref('')
const demandDetail = ref(null)
const editDialogVisible = ref(false)
const editFormRef = ref(null)

const editFormData = reactive({
  title: '',
  position: '',
  count: 1,
  location: '',
  description: '',
  skills: [],
  education: '',
  salary: '',
  deadline: null
})

const skillsEditText = computed({
  get: () => editFormData.skills.join(', '),
  set: (val) => {
    editFormData.skills = val
      .split(/[,，\n]/)
      .map(s => s.trim())
      .filter(s => s)
  }
})

const editFormRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  count: [{ required: true, message: '请输入需求人数', trigger: 'blur' }],
  location: [{ required: true, message: '请输入工作地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入岗位描述', trigger: 'blur' }]
}

// 计算发布天数
const publishDays = computed(() => {
  if (!demandDetail.value?.createTime) return 0
  const createTime = new Date(demandDetail.value.createTime)
  const now = new Date()
  const diffTime = Math.abs(now - createTime)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 获取人才需求详情
const fetchDemandDetail = async () => {
  const demandId = route.params.id
  if (!demandId) {
    error.value = '缺少人才需求ID'
    return
  }

  console.log('=== 开始获取人才需求详情 ===')
  console.log('人才需求ID:', demandId)
  
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
    
    // 3. 发起API请求获取人才需求详情
    console.log('🔄 开始获取人才需求详情数据...')
    loading.value = true
    error.value = ''
    
    console.log('🌐 请求地址: /api/enterprise/talent-demands/{id}')
    
    const response = await talentDemandApi.getDetail(demandId)
    
    console.log('📥 人才需求详情API响应:', response)
    
    // 4. 处理真实响应数据
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      
      // 处理不同的数据结构
      const detail = typeof data === 'object' ? data : { id: demandId, ...data }
      
      demandDetail.value = detail
      
      console.log('✅ 人才需求详情数据处理完成:', detail)
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      error.value = '获取数据成功，但数据格式需要调整，请检查后端API'
    }
    
  } catch (error) {
    console.error('❌ 获取人才需求详情失败:', error)
    
    // 详细的错误处理
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      error.value = '没有权限访问该人才需求详情'
    } else if (error.response?.status === 404) {
      error.value = '人才需求不存在或API接口不存在 (404)'
    } else if (error.response?.status === 500) {
      error.value = '服务器内部错误，请稍后重试或联系管理员'
      console.error('🔥 500错误详情:', error.response?.data)
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      error.value = '网络连接失败，请检查网络连接'
    } else {
      error.value = `获取人才需求详情失败: ${error.message || '未知错误'}`
    }
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/talent-demand')
}

// 编辑处理
const handleEdit = () => {
  if (!demandDetail.value) return
  
  // 填充表单数据
  Object.assign(editFormData, {
    id: demandDetail.value.id,
    title: demandDetail.value.title,
    position: demandDetail.value.position,
    count: demandDetail.value.count,
    location: demandDetail.value.location,
    description: demandDetail.value.description,
    skills: demandDetail.value.skills ? [...demandDetail.value.skills] : [],
    education: demandDetail.value.education || '',
    salary: demandDetail.value.salary || '',
    deadline: demandDetail.value.deadline ? new Date(demandDetail.value.deadline) : null
  })
  
  editDialogVisible.value = true
}

// 编辑提交
const handleEditSubmit = async () => {
  if (!editFormRef.value || !demandDetail.value) return
  
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return
    
    console.log('=== 开始更新人才需求 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    editSubmitLoading.value = true
    
    const requestData = {
      title: editFormData.title,
      position: editFormData.position,
      count: editFormData.count,
      location: editFormData.location,
      description: editFormData.description,
      skills: editFormData.skills,
      education: editFormData.education,
      salary: editFormData.salary,
      deadline: editFormData.deadline ? new Date(editFormData.deadline).toISOString().split('T')[0] : null
    }
    
    console.log('📤 更新请求数据:', requestData)
    console.log('🌐 请求地址: /api/enterprise/talent-demands/{id}')
    
    const response = await talentDemandApi.updateEnterprise(demandDetail.value.id, requestData)
    
    console.log('📥 更新人才需求API响应:', response)
    
    // 处理更新响应
    if (response && (response.data || response.code === 200)) {
      console.log('✅ 人才需求更新成功')
      ElMessage.success('人才需求更新成功')
      
      // 更新本地详情数据
      Object.assign(demandDetail.value, requestData)
      
      // 关闭对话框
      editDialogVisible.value = false
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('更新成功，但响应格式需要调整，请检查后端API')
      editDialogVisible.value = false
    }
    
  } catch (error) {
    console.error('❌ 更新人才需求失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限更新人才需求')
    } else if (error.response?.status === 404) {
      ElMessage.error('人才需求API接口不存在 (404)，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试或联系管理员')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      ElMessage.error('网络连接失败，请检查网络连接')
    } else {
      ElMessage.error(`更新人才需求失败: ${error.message || '未知错误'}`)
    }
  } finally {
    editSubmitLoading.value = false
  }
}

// 关闭编辑对话框
const handleEditDialogClose = () => {
  editFormRef.value?.clearValidate()
}

// 关闭需求
const handleClose = async () => {
  if (!demandDetail.value) return
  
  try {
    await ElMessageBox.confirm('确定要关闭该人才需求吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('=== 开始关闭人才需求 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('📤 关闭人才需求请求')
    console.log('🌐 请求地址: /api/enterprise/talent-demands/{id}/close')
    
    const response = await talentDemandApi.closeEnterprise(demandDetail.value.id)
    
    console.log('📥 关闭人才需求API响应:', response)
    
    // 处理关闭响应
    if (response && (response.data || response.code === 200)) {
      console.log('✅ 人才需求关闭成功')
      ElMessage.success('人才需求已关闭')
      
      // 更新本地状态
      demandDetail.value.status = 'closed'
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('关闭成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也认为关闭成功
      demandDetail.value.status = 'closed'
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

// 删除需求
const handleDelete = async () => {
  if (!demandDetail.value) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除人才需求"${demandDetail.value.title}"吗？删除后不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    console.log('=== 开始删除人才需求 ===')
    
    // 验证token
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    console.log('🗑️ 删除人才需求，调用真实API')
    console.log('📤 删除人才需求ID:', demandDetail.value.id)
    console.log('🌐 请求地址: /api/enterprise/talent-demands/{id}')
    
    // 调用真实删除API
    const response = await talentDemandApi.deleteEnterprise(demandDetail.value.id)
    
    console.log('📥 删除人才需求API响应:', response)
    
    // 处理删除响应
    if (response && (response.data || response.code === 200 || response.success)) {
      console.log('✅ 人才需求删除成功')
      ElMessage.success('人才需求删除成功')
      
      // 返回列表页
      router.push('/talent-demand')
      
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      ElMessage.warning('删除成功，但响应格式需要调整，请检查后端API')
      // 即使响应格式异常，也认为删除成功
      router.push('/talent-demand')
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

// 获取状态标签
const getStatusTag = (status) => {
  const map = {
    pending: 'warning',
    published: 'success',
    closed: 'info'
  }
  return map[status] || 'info'
}

// 获取状态名称
const getStatusName = (status) => {
  const map = {
    pending: '待审核',
    published: '已发布',
    closed: '已关闭'
  }
  return map[status] || status
}

// 获取学历名称
const getEducationName = (education) => {
  const map = {
    college: '大专',
    bachelor: '本科',
    master: '硕士',
    doctor: '博士'
  }
  return map[education] || '不限'
}

onMounted(() => {
  console.log('人才需求详情页面挂载，开始获取详情数据')
  fetchDemandDetail()
})
</script>

<style lang="scss" scoped>
.talent-demand-detail {
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
    
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .skill-tag {
        margin-bottom: 8px;
      }
      
      .no-data {
        color: #999;
        font-style: italic;
      }
    }
    
    .schools-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .school-tag {
        margin-bottom: 8px;
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