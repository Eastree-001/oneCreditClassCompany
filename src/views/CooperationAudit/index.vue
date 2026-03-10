<template>
  <div class="cooperation-audit">
    <el-page-header @back="goBack" content="合作审核" />
    
    <el-tabs v-model="activeTab" class="audit-tabs">
      <el-tab-pane label="待审核" name="pending">
        <cooperation-list :data="pendingList" status="pending" @refresh="fetchAuditList" />
      </el-tab-pane>
      <el-tab-pane label="已通过" name="approved">
        <cooperation-list :data="approvedList" status="approved" @refresh="fetchAuditList" />
      </el-tab-pane>
      <el-tab-pane label="已拒绝" name="rejected">
        <cooperation-list :data="rejectedList" status="rejected" @refresh="fetchAuditList" />
      </el-tab-pane>
    </el-tabs>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" :title="`审核合作项目 - ${currentCooperation?.title}`" width="800px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="项目标题">
          <el-input v-model="currentCooperation.title" disabled />
        </el-form-item>
        <el-form-item label="申请企业">
          <el-input v-model="currentCooperation.enterpriseName" disabled />
        </el-form-item>
        <el-form-item label="合作高校">
          <el-input v-model="currentCooperation.universityName" disabled />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="currentCooperation.description" type="textarea" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" v-if="auditForm.result === 'rejected'">
          <el-input 
            v-model="auditForm.comment" 
            type="textarea" 
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CooperationList from './CooperationList.vue'

const router = useRouter()

const activeTab = ref('pending')

const pendingList = ref([
  {
    id: 1,
    title: 'AI人才培养合作项目',
    enterpriseName: '科技公司A',
    universityName: '清华大学',
    description: '培养人工智能领域的高端人才，提供实习和就业机会',
    applyTime: '2024-01-15 10:30:25',
    status: 'pending'
  },
  {
    id: 2,
    title: '智能制造实验室建设',
    enterpriseName: '制造企业B',
    universityName: '北京大学',
    description: '共建智能制造实验室，开展产学研合作',
    applyTime: '2024-01-14 14:20:18',
    status: 'pending'
  }
])

const approvedList = ref([
  {
    id: 3,
    title: '软件开发人才培养',
    enterpriseName: '软件公司C',
    universityName: '浙江大学',
    description: '培养软件开发人才，提供实训基地',
    applyTime: '2024-01-10 09:15:30',
    auditTime: '2024-01-12 11:20:45',
    status: 'approved'
  }
])

const rejectedList = ref([
  {
    id: 4,
    title: '新能源技术合作',
    enterpriseName: '能源公司D',
    universityName: '上海交通大学',
    description: '新能源技术研发合作',
    applyTime: '2024-01-08 16:45:12',
    auditTime: '2024-01-09 10:30:25',
    rejectReason: '项目描述不够详细',
    status: 'rejected'
  }
])

const auditDialogVisible = ref(false)
const currentCooperation = ref(null)
const auditForm = ref({
  result: 'approved',
  comment: ''
})

const goBack = () => {
  router.back()
}

const fetchAuditList = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    ElMessage.error('获取审核列表失败')
  }
}

const openAuditDialog = (cooperation) => {
  currentCooperation.value = { ...cooperation }
  auditForm.value = {
    result: 'approved',
    comment: ''
  }
  auditDialogVisible.value = true
}

const submitAudit = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新列表
    const index = pendingList.value.findIndex(item => item.id === currentCooperation.value.id)
    if (index !== -1) {
      const cooperation = pendingList.value.splice(index, 1)[0]
      cooperation.status = auditForm.value.result
      cooperation.auditTime = new Date().toLocaleString()
      
      if (auditForm.value.result === 'rejected') {
        cooperation.rejectReason = auditForm.value.comment
        rejectedList.value.unshift(cooperation)
      } else {
        approvedList.value.unshift(cooperation)
      }
    }
    
    auditDialogVisible.value = false
    ElMessage.success('审核完成')
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

// 暴露方法给子组件
const exposeMethods = {
  openAuditDialog
}

defineExpose(exposeMethods)

onMounted(() => {
  fetchAuditList()
})
</script>

<style scoped>
.cooperation-audit {
  padding: 20px;
}

.audit-tabs {
  margin-top: 20px;
}
</style>