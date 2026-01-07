<template>
  <div class="cooperation">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card card-hover" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作栏 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索企业名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="合作状态" clearable @change="handleSearch">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已终止" value="terminated" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterType" placeholder="合作类型" clearable @change="handleSearch">
            <el-option label="项目实训" value="project" />
            <el-option label="课程共建" value="course" />
            <el-option label="人才培养" value="talent" />
          </el-select>
        </el-col>
        <el-col :span="10">
          <div class="button-group">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新建合作
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 合作列表 -->
    <el-card shadow="hover">
      <el-table :data="cooperationList" v-loading="loading" stripe>
        <el-table-column prop="enterprise.name" label="企业名称" min-width="180" />
        <el-table-column prop="projectName" label="合作项目" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="合作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="合作状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="students" label="通过人数" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.students || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="待审核" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getPendingTag(row)" size="small">
              {{ getPendingCount(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量" width="90" align="center">
          <template #default="{ row }">
            {{ row.capacity || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="success" link size="small" @click="handleReviewApplications(row)">审核报名</el-button>
            <el-button type="primary" link size="small" @click="handleView(row)">查看详情</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="企业名称" prop="enterpriseName">
          <el-select
            v-model="formData.enterpriseName"
            placeholder="请选择企业名称"
            filterable
            style="width: 100%"
            :loading="enterpriseListLoading"
            @visible-change="handleEnterpriseSelectVisible"
          >
            <el-option
              v-for="enterprise in enterpriseList"
              :key="enterprise.id"
              :label="enterprise.name"
              :value="enterprise.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合作类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择合作类型" style="width: 100%">
            <el-option label="项目实训" value="项目实训" />
            <el-option label="课程共建" value="课程共建" />
            <el-option label="人才培养" value="人才培养" />
          </el-select>
        </el-form-item>
        <el-form-item label="合作项目" prop="projectName">
          <el-input v-model="formData.projectName" placeholder="请输入合作项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="合作时间" prop="timeRange">
          <el-date-picker
            v-model="formData.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="合作状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已终止" value="已终止" />
          </el-select>
        </el-form-item>
        <el-form-item label="参与学生数">
          <el-input-number v-model="formData.studentCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="formData.contact" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="合作详情"
      width="900px"
      v-loading="detailLoading"
    >
      <el-descriptions :column="2" border v-if="currentCooperation">
        <el-descriptions-item label="企业名称">{{ getEnterpriseName(currentCooperation.enterprise) }}</el-descriptions-item>
        <el-descriptions-item label="合作类型">{{ currentCooperation.type }}</el-descriptions-item>
        <el-descriptions-item label="合作项目">{{ currentCooperation.projectName }}</el-descriptions-item>
        <el-descriptions-item label="合作状态">
          <el-tag :type="getStatusTag(currentCooperation.status)">{{ getStatusText(currentCooperation.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentCooperation.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentCooperation.endTime }}</el-descriptions-item>
        <el-descriptions-item label="参与学生数">{{ currentCooperation.studentCount }}人</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentCooperation.contact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentCooperation.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">
          <div class="description-content">{{ currentCooperation.description }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="企业邮箱" v-if="currentCooperation.enterprise?.email">
          {{ currentCooperation.enterprise.email }}
        </el-descriptions-item>
        <el-descriptions-item label="企业电话" v-if="currentCooperation.enterprise?.phone">
          {{ currentCooperation.enterprise.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentCooperation.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentCooperation.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, OfficeBuilding, Loading, CircleCheck } from '@element-plus/icons-vue'
import { cooperationApiUniversity } from '@/api/university'
import { userApi } from '@/api'

const router = useRouter()

const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const dialogTitle = ref('新建合作')
const formRef = ref(null)

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const cooperationList = ref([])

const currentCooperation = ref(null)

// 企业列表数据
const enterpriseList = ref([])
const enterpriseListLoading = ref(false)

const formData = ref({
  enterpriseName: '',
  type: '',
  projectName: '',
  description: '',
  timeRange: [],
  status: '',
  studentCount: 0,
  contact: '',
  phone: ''
})

const formRules = {
  enterpriseName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择合作类型', trigger: 'change' }],
  projectName: [{ required: true, message: '请输入合作项目名称', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择合作时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择合作状态', trigger: 'change' }]
}

const stats = ref([
  { title: '合作企业', value: '0', icon: 'OfficeBuilding', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '进行中', value: '0', icon: 'Loading', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '参与学生', value: '0', icon: 'User', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '已完成项目', value: '0', icon: 'CircleCheck', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

const getTypeTag = (type) => {
  const typeMap = {
    '项目实训': 'primary',
    '课程共建': 'success',
    '人才培养': 'warning',
    'project': 'primary',
    'course': 'success',
    'talent': 'warning'
  }
  return typeMap[type] || ''
}

const getTypeText = (type) => {
  const typeMap = {
    'project': '项目实训',
    'course': '课程共建',
    'talent': '人才培养'
  }
  return typeMap[type] || type
}

const getStatusTag = (status) => {
  const typeMap = {
    '进行中': 'primary',
    '已完成': 'success',
    '已终止': 'danger',
    'ongoing': 'primary',
    'completed': 'success',
    'terminated': 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const statusMap = {
    'ongoing': '进行中',
    'completed': '已完成',
    'terminated': '已终止'
  }
  return statusMap[status] || status
}

const getEnterpriseName = (value) => {
  // 支持对象格式：{ id, name, email, phone }
  if (value && typeof value === 'object' && value.name) {
    return value.name
  }
  // 兼容旧的字符串格式
  return value || '-'
}

// 计算待审核人数
const getPendingCount = (row) => {
  const enrolled = row.enrolledCount || 0
  const approved = row.students || 0
  return Math.max(0, enrolled - approved)
}

// 获取待审核的标签类型
const getPendingTag = (row) => {
  const pending = getPendingCount(row)
  if (pending === 0) return 'info'
  if (pending > 0 && pending <= 5) return 'warning' // 少量待审核
  return 'danger' // 大量待审核
}

// 计算剩余名额
const getRemainingCount = (capacity, students) => {
  if (!capacity) return 0
  const remaining = capacity - (students || 0)
  return remaining > 0 ? remaining : 0
}

// 获取剩余名额的标签类型
const getRemainingTag = (capacity, students) => {
  if (!capacity) return 'info'
  const remaining = capacity - (students || 0)
  if (remaining <= 0) return 'danger' // 已满员
  if (remaining < capacity * 0.2) return 'warning' // 即将满员
  return 'success' // 名额充足
}

const loadCooperationList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    if (filterStatus.value) {
      params.status = filterStatus.value
    }
    if (filterType.value) {
      params.type = filterType.value
    }

    const result = await cooperationApiUniversity.getList(params)
    console.log('校企合作列表:', result)

    const data = result.data?.data || result.data || result
    const list = data.list || []
    pagination.value.total = data.total || 0

    // 为每个项目获取详情，包含 enrolledCount、students、capacity 等字段
    if (list.length > 0) {
      loading.value = true
      const detailPromises = list.map(async (item) => {
        try {
          const cooperationId = item.id || item.cooperationId || item.projectId
          if (cooperationId) {
            const detailResult = await cooperationApiUniversity.getDetail(cooperationId)
            return detailResult.data || item
          }
          return item
        } catch (error) {
          console.warn('获取项目详情失败:', item.id, error)
          return item
        }
      })

      cooperationList.value = await Promise.all(detailPromises)
      console.log('📋 完整列表数据:', cooperationList.value)
    } else {
      cooperationList.value = list
    }
  } catch (error) {
    console.error('加载校企合作列表失败:', error)
    ElMessage.error('加载校企合作列表失败')
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const result = await cooperationApiUniversity.getStatistics()
    console.log('📥 校企合作统计数据:', result)

    if (result && result.data) {
      const data = result.data
      // 更新统计数据
      stats.value[0].value = data.totalEnterpriseCount || 0
      stats.value[1].value = data.ongoingProjectCount || 0
      stats.value[2].value = data.totalStudentCount || 0
      stats.value[3].value = data.completedProjectCount || 0

      console.log('✅ 统计数据更新完成:', stats.value)
    }
  } catch (error) {
    console.error('❌ 加载统计数据失败:', error)
    // 失败时保持默认值，不影响页面显示
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadCooperationList()
}

const handleAdd = () => {
  dialogTitle.value = '新建合作'
  formData.value = {
    enterpriseName: '',
    type: '',
    projectName: '',
    description: '',
    timeRange: [],
    status: '',
    studentCount: 0,
    contact: '',
    phone: ''
  }
  dialogVisible.value = true
}

const handleReviewApplications = (row) => {
  const cooperationId = row.id || row.cooperationId || row.projectId
  if (!cooperationId) {
    ElMessage.error('无法获取合作项目ID')
    return
  }
  router.push(`/cooperation-review/${cooperationId}`)
}

const handleView = async (row) => {
  detailLoading.value = true
  detailDialogVisible.value = true
  try {
    // 尝试多种可能的 ID 字段
    const cooperationId = row.id || row.cooperationId || row.projectId
    if (!cooperationId) {
      ElMessage.error('无法获取合作项目ID')
      return
    }

    console.log('🔵 开始获取校企合作详情, ID:', cooperationId)
    const result = await cooperationApiUniversity.getDetail(cooperationId)
    console.log('📥 校企合作详情响应:', result)

    // 处理响应数据
    if (result && result.data) {
      currentCooperation.value = result.data
      console.log('✅ 校企合作详情加载成功:', result.data)
    } else {
      console.warn('⚠️ 响应数据格式异常:', result)
      ElMessage.warning('数据格式异常，请联系管理员')
    }
  } catch (error) {
    console.error('❌ 加载校企合作详情失败:', error)
    ElMessage.error('加载校企合作详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑合作'
  formData.value = {
    enterpriseName: getEnterpriseName(row.enterprise),
    type: row.type,
    projectName: row.projectName,
    description: row.description,
    timeRange: [row.startTime, row.endTime],
    status: row.status,
    studentCount: row.studentCount,
    contact: row.contact,
    phone: row.phone
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除与"${getEnterpriseName(row.enterprise)}"的合作吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = async () => {
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(dialogTitle.value === '新建合作' ? '创建成功' : '更新成功')
      dialogVisible.value = false
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  loadCooperationList()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadCooperationList()
}

onMounted(() => {
  loadCooperationList()
  loadStatistics()
})

// 获取企业列表
const loadEnterpriseList = async () => {
  if (enterpriseList.value.length > 0) {
    return // 已加载过，不再重复请求
  }
  enterpriseListLoading.value = true
  try {
    const result = await userApi.getEnterpriseList()
    console.log('企业列表:', result)
    const data = result.data?.data || result.data || result
    enterpriseList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取企业列表失败:', error)
    ElMessage.error('获取企业列表失败')
  } finally {
    enterpriseListLoading.value = false
  }
}

// 下拉框显示时加载企业列表
const handleEnterpriseSelectVisible = (visible) => {
  if (visible && enterpriseList.value.length === 0) {
    loadEnterpriseList()
  }
}
</script>

<style lang="scss" scoped>
.cooperation {
  .stats-row {
    margin-bottom: 20px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .stat-info {
          flex: 1;
          
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: var(--text-primary);
            margin-bottom: 4px;
          }
          
          .stat-title {
            font-size: 14px;
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .toolbar-card {
    margin-bottom: 20px;

    .button-group {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .description-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--text-regular);
  }
}
</style>

