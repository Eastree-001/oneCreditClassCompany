<template>
  <div class="cooperation-review">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
          <span style="margin-left: 15px">{{ cooperationName || '审核报名' }}</span>
        </div>
      </template>

      <el-table :data="applicationList" stripe border>
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentIdNumber" label="学号" width="130" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="introduction" label="个人简介" min-width="150" show-overflow-tooltip />
        <el-table-column prop="appliedAt" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.appliedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="success" link size="small" @click="handleApprove(row)">通过</el-button>
            <el-button type="danger" link size="small" @click="handleReject(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" v-if="applicationList.length > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>

      <el-empty v-if="!loading && applicationList.length === 0" description="暂无待审核报名" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { cooperationApiUniversity } from '@/api/university'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const cooperationId = ref('')
const cooperationName = ref('')
const applicationList = ref([])

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const goBack = () => {
  router.push('/cooperation-university')
}

const getStatusTag = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  }
  return textMap[status] || status
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadApplicationList = async () => {
  loading.value = true
  try {
    console.log('🔵 获取待审核报名列表, 合作项目ID:', cooperationId.value)
    const result = await cooperationApiUniversity.getPendingApplications(cooperationId.value)
    console.log('📥 待审核报名列表响应:', result)

    const data = result.data?.data || result.data || result
    applicationList.value = Array.isArray(data) ? data : []
    pagination.value.total = applicationList.value.length
  } catch (error) {
    console.error('❌ 加载待审核报名失败:', error)
    ElMessage.error('加载待审核报名失败')
  } finally {
    loading.value = false
  }
}

const handleApprove = (row) => {
  ElMessageBox.confirm(`确定要通过学生"${row.studentName}"的报名申请吗？`, '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    loading.value = true
    try {
      const data = {
        applicationId: row.applicationId,
        reviewResult: 'approved',
        reviewComment: '通过'
      }
      const result = await cooperationApiUniversity.reviewApplication(data)
      console.log('📥 审核通过响应:', result)

      if (result?.code === 200 || result?.success === true) {
        ElMessage.success('审核通过')
        loadApplicationList()
      } else {
        ElMessage.error(result?.message || '审核失败')
      }
    } catch (error) {
      console.error('❌ 审核通过失败:', error)
      ElMessage.error('审核失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

const handleReject = (row) => {
  ElMessageBox.confirm(`确定要拒绝学生"${row.studentName}"的报名申请吗？`, '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      const data = {
        applicationId: row.applicationId,
        reviewResult: 'rejected',
        reviewComment: '拒绝'
      }
      const result = await cooperationApiUniversity.reviewApplication(data)
      console.log('📥 审核拒绝响应:', result)

      if (result?.code === 200 || result?.success === true) {
        ElMessage.success('已拒绝')
        loadApplicationList()
      } else {
        ElMessage.error(result?.message || '审核失败')
      }
    } catch (error) {
      console.error('❌ 审核拒绝失败:', error)
      ElMessage.error('审核失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  // 重新加载数据（如果后端支持分页）
}

const handlePageChange = (page) => {
  pagination.value.page = page
  // 重新加载数据（如果后端支持分页）
}

const loadCooperationDetail = async () => {
  try {
    const result = await cooperationApiUniversity.getDetail(cooperationId.value)
    console.log('📥 项目详情响应:', result)
    console.log('📥 项目详情响应.data:', result.data)
    const data = result.data?.data || result.data || result
    console.log('📥 提取的数据:', data)
    cooperationName.value = data.title || data.name || data.cooperationName || data.projectName || data.companyName || ''
    console.log('📥 设置的项目名称:', cooperationName.value)
  } catch (error) {
    console.error('❌ 加载项目详情失败:', error)
  }
}

onMounted(() => {
  cooperationId.value = route.params.cooperationId
  console.log('审核报名页面，合作项目ID:', cooperationId.value)
  if (cooperationId.value) {
    loadCooperationDetail()
    loadApplicationList()
  }
})
</script>

<style lang="scss" scoped>
.cooperation-review {
  padding: 20px;

  .card-header {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
