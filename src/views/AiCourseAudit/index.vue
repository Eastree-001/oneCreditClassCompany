<template>
  <div class="ai-course-audit">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>AI课程审批</h2>
      <el-radio-group v-model="activeTab" @change="handleTabChange">
        <el-radio-button value="pending">待审批</el-radio-button>
        <el-radio-button value="all">全部记录</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingCount }}</div>
              <div class="stat-label">待审批</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon approved">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.approvedCount }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rejected">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.rejectedCount }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCount }}</div>
              <div class="stat-label">总计</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待审批列表 -->
    <el-card shadow="hover" style="margin-top: 20px" v-if="activeTab === 'pending'">
      <template #header>
        <div class="card-header">
          <span>待审批课程</span>
          <el-button type="primary" :icon="Refresh" @click="loadPendingList">
            刷新
          </el-button>
        </div>
      </template>
      <el-table :data="pendingList" stripe v-loading="loading">
        <el-table-column prop="id" label="审批ID" width="80" align="center" />
        <el-table-column prop="aiCourseTitle" label="课程名称" min-width="200" />
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.auditStatus)">
              {{ getStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleAudit(row)"
            >
              审批
            </el-button>
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
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 全部审批记录 -->
    <el-card shadow="hover" style="margin-top: 20px" v-if="activeTab === 'all'">
      <template #header>
        <div class="card-header">
          <span>全部审批记录</span>
          <el-button type="primary" :icon="Refresh" @click="loadAllList">
            刷新
          </el-button>
        </div>
      </template>
      <el-table :data="allList" stripe v-loading="loading">
        <el-table-column prop="id" label="审批ID" width="80" align="center" />
        <el-table-column prop="aiCourseTitle" label="课程名称" min-width="200" />
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="审批时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.auditedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="审批人" width="120" align="center">
          <template #default="{ row }">
            {{ row.auditorName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="审批分数" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.auditScore !== null">{{ row.auditScore }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.auditStatus)">
              {{ getStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleView(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="allPagination.page"
          v-model:page-size="allPagination.size"
          :total="allPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleAllSizeChange"
          @current-change="handleAllCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Clock, CircleCheck, CircleClose, Document, Refresh } from '@element-plus/icons-vue'
import { universityAiCourseAuditApi } from '@/api'

const router = useRouter()
const activeTab = ref('pending')
const loading = ref(false)
const pendingList = ref([])
const allList = ref([])

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const allPagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const stats = ref({
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  totalCount: 0
})

// 加载待审批列表
const loadPendingList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.page,
      size: pagination.value.size
    }
    const result = await universityAiCourseAuditApi.getPendingList(params)

    if (result && result.data) {
      pendingList.value = result.data.list || []
      pagination.value.total = result.data.total || 0
    }
  } catch (error) {
    console.error('获取待审批列表失败:', error)
    ElMessage.error('获取待审批列表失败')
  } finally {
    loading.value = false
  }
}

// 加载全部审批记录
const loadAllList = async () => {
  try {
    loading.value = true
    const params = {
      page: allPagination.value.page,
      size: allPagination.value.size
    }
    const result = await universityAiCourseAuditApi.getList(params)

    if (result && result.data) {
      allList.value = result.data.list || []
      allPagination.value.total = result.data.total || 0

      // 计算统计数据
      const list = result.data.list || []
      stats.value = {
        pendingCount: list.filter(item => item.auditStatus === 'pending').length,
        approvedCount: list.filter(item => item.auditStatus === 'approved').length,
        rejectedCount: list.filter(item => item.auditStatus === 'rejected').length,
        totalCount: result.data.total || 0
      }
    }
  } catch (error) {
    console.error('获取审批记录失败:', error)
    ElMessage.error('获取审批记录失败')
  } finally {
    loading.value = false
  }
}

// Tab切换
const handleTabChange = (tab) => {
  if (tab === 'pending') {
    loadPendingList()
  } else {
    loadAllList()
  }
}

// 审批操作
const handleAudit = (row) => {
  router.push({
    path: '/ai-course-audit-detail',
    query: { auditId: row.id, mode: 'audit' }
  })
}

// 查看操作
const handleView = (row) => {
  router.push({
    path: '/ai-course-audit-detail',
    query: { auditId: row.id, mode: 'view' }
  })
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.page = 1
  loadPendingList()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.value.page = page
  loadPendingList()
}

// 全部列表分页大小改变
const handleAllSizeChange = (size) => {
  allPagination.value.size = size
  allPagination.value.page = 1
  loadAllList()
}

// 全部列表当前页改变
const handleAllCurrentChange = (page) => {
  allPagination.value.page = page
  loadAllList()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    'pending': '待审批',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return map[status] || status
}

onMounted(() => {
  loadPendingList()
  loadAllList()
})
</script>

<style lang="scss" scoped>
.ai-course-audit {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      color: var(--text-primary);
    }
  }

  .stats-row {
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;

          &.pending {
            background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
            color: white;
          }

          &.approved {
            background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            color: white;
          }

          &.rejected {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: white;
          }

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
        }

        .stat-info {
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: var(--text-primary);
            line-height: 1;
          }

          .stat-label {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 8px;
          }
        }
      }
    }
  }

  .card-header {
    font-weight: 600;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
