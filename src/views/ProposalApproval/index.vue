<template>
  <div class="proposal-approval">
    <!-- 操作栏 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索项目名称"
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
          <el-select v-model="filterStatus" placeholder="审批状态" clearable @change="handleSearch">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-col>
        <!-- 去除合作类型筛选 -->
      </el-row>
    </el-card>

    <!-- 企业项目合作审批列表（测试数据） -->
    <el-card shadow="hover">
      <el-table :data="projectList" v-loading="loading" stripe>
        <el-table-column prop="projectName" label="项目名称" min-width="240" />
        <el-table-column prop="status" label="审批状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="row.progress >= 100 ? 'success' : undefined" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              size="small"
              @click="handleApprove(row)"
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
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="项目合作审批"
      width="900px"
      v-loading="detailLoading"
    >
      <el-descriptions :column="2" border v-if="currentProject">
        <el-descriptions-item label="项目名称">{{ currentProject.projectName }}</el-descriptions-item>
        <el-descriptions-item label="项目状态">
          <el-tag :type="getStatusType(currentProject.status)">{{ getStatusText(currentProject.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="参与学生数">{{ currentProject.studentCount }}人</el-descriptions-item>
        <el-descriptions-item label="项目进度">
          <el-progress :percentage="currentProject.progress" :status="currentProject.progress >= 100 ? 'success' : undefined" />
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentProject.startTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentProject.endTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">
          <div class="proposal-content">{{ currentProject.description || '暂无描述' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="项目目标" :span="2">
          <div class="proposal-content">{{ currentProject.goals || '暂无目标' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentProject.contact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentProject.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="项目天数">{{ currentProject.projectDays }}天</el-descriptions-item>
        <el-descriptions-item label="已完成进度">{{ currentProject.progress }}%</el-descriptions-item>
        <el-descriptions-item label="剩余天数">{{ currentProject.remainingDays }}天</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentProject.createdAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentProject.updatedAt || '暂无更新' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approvalDialogVisible"
      title="项目审批"
      width="600px"
    >
      <el-form :model="approvalForm" :rules="approvalRules" ref="approvalFormRef" label-width="100px">
        <el-form-item label="项目名称">
          <el-input :value="currentProject?.projectName" disabled />
        </el-form-item>
        <el-form-item label="审批结果" prop="result">
          <el-radio-group v-model="approvalForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="comment">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApproval">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const loading = ref(false)
const detailLoading = ref(false)
const detailDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const approvalFormRef = ref(null)

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 测试数据（企业项目合作）
const mockProjects = ref([
  {
    id: 1,
    projectName: '购物平台开发项目',
    universityName: '河北师范大学',
    status: 'pending',
    studentCount: 10,
    progress: 90,
    startTime: '2024-01-01',
    endTime: '2024-06-30',
    description: '校企联合进行某购物平台开发',
    goals: '完成购物平台开发',
    contact: '张经理',
    phone: '13800138001',
    projectDays: 0,
    remainingDays: 0,
    createdAt: '2024-01-01',
    updatedAt: '',
    proposer: '某企业',
    approvalTime: null,
    approvalComment: null
  },
  {
    id: 2,
    projectName: 'AI 算法实训项目',
    universityName: '清华大学',
    status: 'approved',
    studentCount: 20,
    progress: 50,
    startTime: '2024-02-01',
    endTime: '2024-08-01',
    description: '共建 AI 实训营，学生参与企业真实算法项目',
    goals: '完成算法模块交付',
    contact: '李总监',
    phone: '13800138002',
    projectDays: 30,
    remainingDays: 60,
    createdAt: '2024-02-01',
    updatedAt: '2024-03-01',
    proposer: '某企业',
    approvalTime: '2024-03-05',
    approvalComment: '方案可行，按计划推进'
  },
  {
    id: 3,
    projectName: '数据可视化课程共建',
    universityName: '北京大学',
    status: 'rejected',
    studentCount: 15,
    progress: 20,
    startTime: '2024-03-01',
    endTime: '2024-07-01',
    description: '共建数据可视化课程，企业提供案例与讲师',
    goals: '完成课程建设与试讲',
    contact: '王老师',
    phone: '13800138003',
    projectDays: 10,
    remainingDays: 90,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-10',
    proposer: '某企业',
    approvalTime: '2024-03-12',
    approvalComment: '时间排期冲突，暂不通过'
  }
])

const projectList = ref([])
const currentProject = ref(null)

const approvalForm = ref({
  result: 'approved',
  comment: ''
})

const approvalRules = {
  result: [{ required: true, message: '请选择审批结果', trigger: 'change' }],
  comment: [{ required: true, message: '请输入审批意见', trigger: 'blur' }]
}

// 加载项目列表（使用测试数据）
const loadProjectList = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 200))

    let data = [...mockProjects.value]

    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      data = data.filter(item =>
        item.projectName.toLowerCase().includes(kw) ||
        item.universityName.toLowerCase().includes(kw)
      )
    }
    if (filterStatus.value) {
      data = data.filter(item => item.status === filterStatus.value)
    }
    const start = (pagination.value.page - 1) * pagination.value.size
    const end = start + pagination.value.size
    projectList.value = data.slice(start, end)
    pagination.value.total = data.length
  } catch (error) {
    console.error('加载项目列表失败:', error)
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadProjectList()
})

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    '待审批': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待审批',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}


const handleSearch = () => {
  pagination.value.page = 1
  loadProjectList()
}

const handleView = async (row) => {
  detailLoading.value = true
  detailDialogVisible.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 150))
    const data = mockProjects.value.find(item => item.id === row.id) || row
    currentProject.value = data
  } catch (error) {
    console.error('加载项目详情失败:', error)
    ElMessage.error('加载项目详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleApprove = (row) => {
  currentProject.value = row
  approvalForm.value = {
    result: 'approved',
    comment: ''
  }
  approvalDialogVisible.value = true
}

const handleSubmitApproval = async () => {
  try {
    await approvalFormRef.value.validate()
    const idx = mockProjects.value.findIndex(item => item.id === currentProject.value.id)
    if (idx > -1) {
      mockProjects.value[idx].status = approvalForm.value.result
      mockProjects.value[idx].approvalTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
      mockProjects.value[idx].approvalComment = approvalForm.value.comment
      currentProject.value = { ...mockProjects.value[idx] }
    }
    ElMessage.success('审批成功（测试数据）')
    approvalDialogVisible.value = false
    loadProjectList()
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error(error.message || '审批失败')
  }
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  loadProjectList()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadProjectList()
}
</script>

<style lang="scss" scoped>
.proposal-approval {
  .toolbar-card {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .proposal-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--text-regular);
  }
}
</style>

