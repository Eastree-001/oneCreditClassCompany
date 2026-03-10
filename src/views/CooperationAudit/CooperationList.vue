<template>
  <div class="cooperation-list">
    <el-table :data="data" style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="title" label="项目标题" min-width="200" />
      <el-table-column prop="enterpriseName" label="申请企业" width="120" />
      <el-table-column prop="universityName" label="合作高校" width="120" />
      <el-table-column prop="description" label="项目描述" min-width="300" show-overflow-tooltip />
      <el-table-column prop="applyTime" label="申请时间" width="180" />
      <el-table-column v-if="status !== 'pending'" prop="auditTime" label="审核时间" width="180" />
      <el-table-column v-if="status === 'rejected'" prop="rejectReason" label="拒绝原因" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row)">查看</el-button>
          <el-button 
            v-if="status === 'pending'" 
            type="primary" 
            size="small" 
            @click="auditCooperation(row)"
          >
            审核
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :title="`合作项目详情 - ${currentCooperation?.title}`" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目标题">{{ currentCooperation?.title }}</el-descriptions-item>
        <el-descriptions-item label="申请企业">{{ currentCooperation?.enterpriseName }}</el-descriptions-item>
        <el-descriptions-item label="合作高校">{{ currentCooperation?.universityName }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentCooperation?.applyTime }}</el-descriptions-item>
        <el-descriptions-item v-if="currentCooperation?.auditTime" label="审核时间">{{ currentCooperation?.auditTime }}</el-descriptions-item>
        <el-descriptions-item v-if="currentCooperation?.rejectReason" label="拒绝原因">{{ currentCooperation?.rejectReason }}</el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">
          <div style="white-space: pre-wrap;">{{ currentCooperation?.description }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          v-if="status === 'pending'" 
          type="primary" 
          @click="auditCooperation(currentCooperation)"
        >
          前往审核
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  status: {
    type: String,
    default: 'pending'
  }
})

const emit = defineEmits(['refresh'])

const loading = ref(false)
const detailDialogVisible = ref(false)
const currentCooperation = ref(null)

// 获取父组件的方法
const { openAuditDialog } = inject('auditMethods') || {}

const viewDetail = (cooperation) => {
  currentCooperation.value = { ...cooperation }
  detailDialogVisible.value = true
}

const auditCooperation = (cooperation) => {
  if (openAuditDialog) {
    openAuditDialog(cooperation)
  } else {
    console.warn('父组件审核方法未注入')
  }
  detailDialogVisible.value = false
}
</script>

<style scoped>
.cooperation-list {
  padding: 20px 0;
}
</style>