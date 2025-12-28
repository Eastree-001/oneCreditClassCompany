<template>
  <div class="proposal-approval">
    <!-- 操作栏 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索提案标题"
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
        <el-col :span="4">
          <el-select v-model="filterType" placeholder="提案类型" clearable @change="handleSearch">
            <el-option label="共建课程" value="course" />
            <el-option label="专业共建" value="major" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- 提案列表 -->
    <el-card shadow="hover">
      <el-table :data="proposalList" v-loading="loading" stripe>
        <el-table-column prop="title" label="提案标题" width="250" />
        <el-table-column prop="type" label="提案类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === '共建课程' ? 'primary' : 'success'">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="proposer" label="提案人" width="120" />
        <el-table-column prop="proposalTime" label="提案时间" width="180" />
        <el-table-column prop="status" label="审批状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审批人" width="120" />
        <el-table-column prop="approvalTime" label="审批时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看详情</el-button>
            <el-button
              v-if="row.status === '待审批'"
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
      title="提案详情"
      width="900px"
    >
      <el-descriptions :column="2" border v-if="currentProposal">
        <el-descriptions-item label="提案标题">{{ currentProposal.title }}</el-descriptions-item>
        <el-descriptions-item label="提案类型">
          <el-tag :type="currentProposal.type === '共建课程' ? 'primary' : 'success'">
            {{ currentProposal.type }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提案人">{{ currentProposal.proposer }}</el-descriptions-item>
        <el-descriptions-item label="提案时间">{{ currentProposal.proposalTime }}</el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag :type="getStatusType(currentProposal.status)">{{ currentProposal.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批人">{{ currentProposal.approver || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ currentProposal.approvalTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提案内容" :span="2">
          <div class="proposal-content">{{ currentProposal.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="附件" :span="2" v-if="currentProposal.attachments">
          <el-link
            v-for="(file, index) in currentProposal.attachments"
            :key="index"
            :href="file.url"
            target="_blank"
            type="primary"
            style="margin-right: 10px"
          >
            {{ file.name }}
          </el-link>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approvalDialogVisible"
      title="提案审批"
      width="600px"
    >
      <el-form :model="approvalForm" :rules="approvalRules" ref="approvalFormRef" label-width="100px">
        <el-form-item label="提案标题">
          <el-input :value="currentProposal?.title" disabled />
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const loading = ref(false)
const detailDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const approvalFormRef = ref(null)

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const proposalList = ref([
  {
    id: 1,
    title: '人工智能专业共建提案',
    type: '专业共建',
    proposer: '张教授',
    proposalTime: '2024-01-10 14:30:00',
    status: '待审批',
    approver: '',
    approvalTime: '',
    content: '为适应人工智能产业发展需求，建议与企业合作共建人工智能专业，培养符合行业需求的高素质人才...',
    attachments: [
      { name: '提案文档.pdf', url: '#' }
    ]
  },
  {
    id: 2,
    title: 'Java企业级开发共建课程',
    type: '共建课程',
    proposer: '李老师',
    proposalTime: '2024-01-08 10:20:00',
    status: '已通过',
    approver: '王主任',
    approvalTime: '2024-01-12 16:45:00',
    content: '与企业合作开发Java企业级开发课程，引入真实项目案例...',
    attachments: []
  },
  {
    id: 3,
    title: '大数据分析专业共建',
    type: '专业共建',
    proposer: '刘教授',
    proposalTime: '2024-01-05 09:15:00',
    status: '已拒绝',
    approver: '王主任',
    approvalTime: '2024-01-07 11:30:00',
    content: '建议与企业合作共建大数据分析专业...',
    attachments: []
  }
])

const currentProposal = ref(null)

const approvalForm = ref({
  result: 'approved',
  comment: ''
})

const approvalRules = {
  result: [{ required: true, message: '请选择审批结果', trigger: 'change' }],
  comment: [{ required: true, message: '请输入审批意见', trigger: 'blur' }]
}

const getStatusType = (status) => {
  const typeMap = {
    '待审批': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger'
  }
  return typeMap[status] || ''
}

const handleSearch = () => {
  // 搜索逻辑
  ElMessage.info('搜索功能待实现')
}

const handleView = (row) => {
  currentProposal.value = row
  detailDialogVisible.value = true
}

const handleApprove = (row) => {
  currentProposal.value = row
  approvalForm.value = {
    result: 'approved',
    comment: ''
  }
  approvalDialogVisible.value = true
}

const handleSubmitApproval = async () => {
  try {
    await approvalFormRef.value.validate()
    ElMessage.success('审批成功')
    approvalDialogVisible.value = false
    // 更新列表数据
    if (currentProposal.value) {
      currentProposal.value.status = approvalForm.value.result === 'approved' ? '已通过' : '已拒绝'
      currentProposal.value.approver = '当前用户'
      currentProposal.value.approvalTime = new Date().toLocaleString('zh-CN')
    }
  } catch (error) {
    // 验证失败，不处理
  }
}

const handleSizeChange = (size) => {
  pagination.value.size = size
}

const handlePageChange = (page) => {
  pagination.value.page = page
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

