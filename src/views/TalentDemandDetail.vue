<template>
  <div class="talent-demand-detail">
    <el-row :gutter="20">
      <!-- 左侧/中间：申请学生列表 -->
      <el-col :xs="24" :sm="24" :md="16">
        <el-card shadow="hover" v-loading="loading">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
                <span style="margin-left: 15px">申请学生列表</span>
              </div>
              <div class="header-right">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索学生姓名或学号"
                  clearable
                  style="width: 200px"
                  @clear="handleSearch"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select
                  v-model="filterStatus"
                  placeholder="筛选状态"
                  clearable
                  style="width: 150px; margin-left: 10px"
                  @change="handleSearch"
                >
                  <el-option label="待审核" value="待审核" />
                  <el-option label="已通过" value="已通过" />
                  <el-option label="已拒绝" value="已拒绝" />
                </el-select>
              </div>
            </div>
          </template>

          <!-- 错误状态 -->
          <div v-if="error" class="error-state">
            <el-empty :description="error">
              <el-button type="primary" @click="fetchApplications">重新加载</el-button>
            </el-empty>
          </div>

          <!-- 申请列表 -->
          <el-table
            v-else
            :data="applicationList"
            stripe
            style="width: 100%"
            v-loading="applicationsLoading"
            @row-click="handleViewApplication"
          >
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="studentId" label="学号" width="150" />
            <el-table-column prop="phone" label="联系方式" width="150" />
            <el-table-column prop="email" label="邮箱" min-width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="申请时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click.stop="handleViewApplication(row)">
                  查看详情
                </el-button>
                <el-button
                  v-if="row.status === '待审核'"
                  type="success"
                  link
                  size="small"
                  @click.stop="handleApprove(row)"
                >
                  通过
                </el-button>
                <el-button
                  v-if="row.status === '待审核'"
                  type="danger"
                  link
                  size="small"
                  @click.stop="handleReject(row)"
                >
                  拒绝
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination" v-if="applicationList.length > 0">
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

          <!-- 空状态 -->
          <el-empty v-if="!applicationsLoading && applicationList.length === 0 && !error" description="暂无申请记录" />
        </el-card>
      </el-col>

      <!-- 右侧：人才需求详情悬浮栏 -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="demand-sidebar" shadow="hover" v-loading="loading">
          <template #header>
            <div class="sidebar-header">
              <span>需求详情</span>
              <el-button
                v-if="demandDetail && demandDetail.status === 'published'"
                type="primary"
                link
                size="small"
                :icon="Edit"
                @click="handleEdit"
              >
                编辑
              </el-button>
            </div>
          </template>

          <div v-if="demandDetail" class="demand-info">
            <div class="info-item">
              <span class="label">需求标题：</span>
              <span class="value">{{ demandDetail.title }}</span>
            </div>
            <div class="info-item">
              <span class="label">岗位名称：</span>
              <span class="value">{{ demandDetail.position }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <el-tag :type="getStatusTag(demandDetail.status)" size="small">
                {{ getStatusName(demandDetail.status) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="label">需求人数：</span>
              <span class="value">{{ demandDetail.count }}人</span>
            </div>
            <div class="info-item">
              <span class="label">工作地点：</span>
              <span class="value">{{ demandDetail.location }}</span>
            </div>
            <div class="info-item">
              <span class="label">薪资范围：</span>
              <span class="value">{{ demandDetail.salary || '面议' }}</span>
            </div>
            <div class="info-item">
              <span class="label">学历要求：</span>
              <span class="value">{{ getEducationName(demandDetail.education) }}</span>
            </div>
            <div class="info-item">
              <span class="label">申请人数：</span>
              <span class="value highlight">{{ demandDetail.applicants || 0 }}人</span>
            </div>
            <div class="info-item">
              <span class="label">岗位描述：</span>
              <div class="value description">{{ demandDetail.description }}</div>
            </div>
            <div class="info-item" v-if="demandDetail.skills && demandDetail.skills.length > 0">
              <span class="label">技能要求：</span>
              <div class="value">
                <el-tag
                  v-for="(skill, index) in demandDetail.skills"
                  :key="index"
                  size="small"
                  style="margin-right: 6px; margin-bottom: 6px"
                >
                  {{ typeof skill === 'object' ? skill.name : skill }}
                </el-tag>
              </div>
            </div>
            <div class="info-item" v-if="demandDetail.schools && demandDetail.schools.length > 0">
              <span class="label">合作高校：</span>
              <div class="value">
                <el-tag
                  v-for="(school, index) in demandDetail.schools"
                  :key="index"
                  type="success"
                  size="small"
                  style="margin-right: 6px; margin-bottom: 6px"
                >
                  {{ school }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <span class="label">截止日期：</span>
              <span class="value">{{ demandDetail.deadline || '无' }}</span>
            </div>
            <div class="info-item">
              <span class="label">发布时间：</span>
              <span class="value">{{ demandDetail.createTime }}</span>
            </div>
          </div>

          <div v-else-if="!loading" class="empty-state">
            <el-empty description="暂无需求信息" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 学生申请详情弹窗 -->
    <el-dialog
      v-model="applicationDetailVisible"
      title="学生申请详情"
      width="800px"
      v-loading="applicationDetailLoading"
    >
      <div v-if="currentApplication" class="application-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentApplication.name }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentApplication.studentId }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentApplication.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentApplication.email }}</el-descriptions-item>
          <el-descriptions-item label="申请状态">
            <el-tag :type="getStatusTag(currentApplication.status)">{{ currentApplication.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentApplication.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="个人简历" :span="2">
            <div class="resume-content">{{ currentApplication.resume }}</div>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="currentApplication.reviewComment"
            label="审核意见"
            :span="2"
          >
            {{ currentApplication.reviewComment }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="currentApplication.reviewedAt"
            label="审核时间"
          >
            {{ currentApplication.reviewedAt }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="currentApplication.reviewedBy"
            label="审核人"
          >
            {{ currentApplication.reviewedBy }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="applicationDetailVisible = false">关闭</el-button>
        <el-button
          v-if="currentApplication && currentApplication.status === '待审核'"
          type="success"
          @click="handleApprove(currentApplication)"
        >
          通过
        </el-button>
        <el-button
          v-if="currentApplication && currentApplication.status === '待审核'"
          type="danger"
          @click="handleReject(currentApplication)"
        >
          拒绝
        </el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewType === 'approve' ? '审核通过' : '审核拒绝'"
      width="500px"
    >
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item :label="reviewType === 'approve' ? '通过意见' : '拒绝原因'">
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            :placeholder="reviewType === 'approve' ? '请输入通过意见（可选）' : '请输入拒绝原因（必填）'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReviewSubmit" :loading="reviewLoading">确定</el-button>
      </template>
    </el-dialog>

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
  Edit,
  Search
} from '@element-plus/icons-vue'
import { talentDemandApi } from '@/api'
import { getValidToken, getUserInfoFromToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const applicationsLoading = ref(false)
const applicationDetailLoading = ref(false)
const editSubmitLoading = ref(false)
const reviewLoading = ref(false)
const error = ref('')
const demandDetail = ref(null)
const applicationList = ref([])
const currentApplication = ref(null)
const applicationDetailVisible = ref(false)
const editDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const reviewType = ref('approve') // 'approve' | 'reject'
const editFormRef = ref(null)
const searchKeyword = ref('')
const filterStatus = ref('')

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const reviewForm = reactive({
  comment: ''
})

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
    const token = getValidToken()
    if (!token) {
      ElMessage.error('请先登录获取访问权限')
      router.push('/login')
      return
    }
    
    loading.value = true
    error.value = ''
    
    const response = await talentDemandApi.getDetail(demandId)
    
    console.log('📥 人才需求详情API响应:', response)
    
    if (response && (response.data || response.code === 200)) {
      let data = response.data || response
      const detail = typeof data === 'object' ? data : { id: demandId, ...data }
      demandDetail.value = detail
      console.log('✅ 人才需求详情数据处理完成:', detail)
    } else {
      console.warn('⚠️ API响应数据格式异常:', response)
      error.value = '获取数据成功，但数据格式需要调整，请检查后端API'
    }
    
  } catch (error) {
    console.error('❌ 获取人才需求详情失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录获取访问权限')
      router.push('/login')
    } else if (error.response?.status === 403) {
      error.value = '没有权限访问该人才需求详情'
    } else if (error.response?.status === 404) {
      error.value = '人才需求不存在或API接口不存在 (404)'
    } else if (error.response?.status === 500) {
      error.value = '服务器内部错误，请稍后重试或联系管理员'
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      error.value = '网络连接失败，请检查网络连接'
    } else {
      error.value = `获取人才需求详情失败: ${error.message || '未知错误'}`
    }
  } finally {
    loading.value = false
  }
}

// 获取申请列表（前端测试数据）
const fetchApplications = async () => {
  console.log('=== 使用前端测试数据获取申请列表 ===')
  applicationsLoading.value = true
  try {
    const allMock = [
      {
        id: 1,
        recruitmentId: Number(route.params.id) || 1,
        userId: 101,
        name: '张三',
        studentId: '20210001',
        phone: '13800000001',
        email: 'zhangsan@example.com',
        resume: '张三，计算机科学与技术专业，大三学生，熟悉 Java、Spring Boot、MySQL，有两段实习经历……',
        status: '待审核',
        reviewComment: null,
        reviewedAt: null,
        reviewedBy: null,
        createdAt: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        recruitmentId: Number(route.params.id) || 1,
        userId: 102,
        name: '李四',
        studentId: '20210002',
        phone: '13800000002',
        email: 'lisi@example.com',
        resume: '李四，软件工程专业，大四学生，熟悉前端技术栈 Vue / React，有完整项目经验……',
        status: '已通过',
        reviewComment: '简历优秀，进入下一轮面试',
        reviewedAt: '2024-01-16 09:20:00',
        reviewedBy: 1,
        createdAt: '2024-01-14 16:20:00'
      },
      {
        id: 3,
        recruitmentId: Number(route.params.id) || 1,
        userId: 103,
        name: '王五',
        studentId: '20210003',
        phone: '13800000003',
        email: 'wangwu@example.com',
        resume: '王五，信息安全专业，大三学生，熟悉网络安全基础，参加过 CTF 竞赛……',
        status: '已拒绝',
        reviewComment: '与岗位方向不匹配',
        reviewedAt: '2024-01-16 11:00:00',
        reviewedBy: 1,
        createdAt: '2024-01-14 18:00:00'
      }
    ]

    // 关键字筛选（姓名 / 学号）
    let filtered = allMock.filter(item => {
      const kw = searchKeyword.value.trim()
      if (!kw) return true
      return item.name.includes(kw) || item.studentId.includes(kw)
    })

    // 状态筛选
    if (filterStatus.value) {
      filtered = filtered.filter(item => item.status === filterStatus.value)
    }

    // 分页
    pagination.total = filtered.length
    const start = (pagination.page - 1) * pagination.size
    const end = start + pagination.size
    applicationList.value = filtered.slice(start, end)

    console.log('✅ 测试数据申请列表:', {
      listLength: applicationList.value.length,
      total: pagination.total
    })
  } finally {
    applicationsLoading.value = false
  }
}

// 查看申请详情（测试数据直接使用行数据）
const handleViewApplication = async (row) => {
  applicationDetailLoading.value = true
  applicationDetailVisible.value = true
  try {
    currentApplication.value = { ...row }
  } finally {
    applicationDetailLoading.value = false
  }
}

// 审核通过
const handleApprove = (row) => {
  currentApplication.value = row
  reviewType.value = 'approve'
  reviewForm.comment = ''
  reviewDialogVisible.value = true
}

// 审核拒绝
const handleReject = (row) => {
  currentApplication.value = row
  reviewType.value = 'reject'
  reviewForm.comment = ''
  reviewDialogVisible.value = true
}

// 提交审核
const handleReviewSubmit = async () => {
  if (reviewType.value === 'reject' && !reviewForm.comment.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  const demandId = route.params.id
  if (!demandId || !currentApplication.value?.id) {
    ElMessage.warning('缺少必要参数')
    return
  }
  
  try {
    reviewLoading.value = true

    const newStatus = reviewType.value === 'approve' ? '已通过' : '已拒绝'
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    // 更新列表中的记录
    const idx = applicationList.value.findIndex(item => item.id === currentApplication.value.id)
    if (idx > -1) {
      applicationList.value[idx].status = newStatus
      applicationList.value[idx].reviewComment = reviewForm.comment || ''
      applicationList.value[idx].reviewedAt = now
      applicationList.value[idx].reviewedBy = 1
    }

    // 更新当前详情
    currentApplication.value = {
      ...currentApplication.value,
      status: newStatus,
      reviewComment: reviewForm.comment || '',
      reviewedAt: now,
      reviewedBy: 1
    }

    ElMessage.success(
      reviewType.value === 'approve'
        ? '审核通过成功（测试数据）'
        : '审核拒绝成功（测试数据）'
    )
    reviewDialogVisible.value = false
  } catch (error) {
    console.error('❌ 审核失败（测试数据）:', error)
    ElMessage.error('审核失败（测试数据）')
  } finally {
    reviewLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchApplications()
}

// 分页
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  fetchApplications()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchApplications()
}

// 返回列表
const goBack = () => {
  router.push('/talent-demand')
}

// 编辑处理
const handleEdit = () => {
  if (!demandDetail.value) return
  
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
    
    const response = await talentDemandApi.updateEnterprise(demandDetail.value.id, requestData)
    
    if (response && (response.data || response.code === 200)) {
      ElMessage.success('人才需求更新成功')
      Object.assign(demandDetail.value, requestData)
      editDialogVisible.value = false
    } else {
      ElMessage.warning('更新成功，但响应格式需要调整')
      editDialogVisible.value = false
    }
    
  } catch (error) {
    console.error('❌ 更新人才需求失败:', error)
    ElMessage.error(`更新失败: ${error.message || '未知错误'}`)
  } finally {
    editSubmitLoading.value = false
  }
}

// 关闭编辑对话框
const handleEditDialogClose = () => {
  editFormRef.value?.clearValidate()
}

// 获取状态标签
const getStatusTag = (status) => {
  const map = {
    '待审核': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger',
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
  console.log('人才需求审核页面挂载，开始获取数据')
  fetchDemandDetail()
  fetchApplications()
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
    }
  }
  
  .demand-sidebar {
    position: sticky;
    top: 20px;
    height: fit-content;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
    }
    
    .demand-info {
      .info-item {
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          display: block;
          font-weight: 600;
          color: #606266;
          margin-bottom: 6px;
          font-size: 14px;
        }
        
        .value {
          display: block;
          color: #303133;
          font-size: 14px;
          line-height: 1.6;
          
          &.highlight {
            color: #409eff;
            font-weight: 600;
            font-size: 16px;
          }
          
          &.description {
            white-space: pre-wrap;
            line-height: 1.8;
          }
        }
      }
    }
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .error-state,
  .empty-state {
    padding: 60px 20px;
    text-align: center;
  }
  
  .application-detail {
    .resume-content {
      white-space: pre-wrap;
      line-height: 1.8;
      color: #303133;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }
}

// 小屏幕下取消 sticky 定位
@media (max-width: 768px) {
  .talent-demand-detail {
    .demand-sidebar {
      position: static;
      max-height: none;
    }
  }
}
</style>
