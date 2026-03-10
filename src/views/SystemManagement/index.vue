<template>
  <div class="system-management">
    <el-page-header @back="goBack" content="系统管理" />
    
    <el-card class="system-card">
      <template #header>
        <span>系统设置</span>
      </template>
      
      <el-form :model="systemForm" label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="systemForm.systemName" placeholder="请输入系统名称" />
        </el-form-item>
        
        <el-form-item label="系统版本">
          <el-input v-model="systemForm.version" disabled />
        </el-form-item>
        
        <el-form-item label="维护模式">
          <el-switch v-model="systemForm.maintenanceMode" />
        </el-form-item>
        
        <el-form-item label="维护消息">
          <el-input 
            v-model="systemForm.maintenanceMessage" 
            type="textarea" 
            :rows="3"
            placeholder="请输入维护模式下的提示消息"
            :disabled="!systemForm.maintenanceMode"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveSystemSettings">保存设置</el-button>
          <el-button @click="resetSystemSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="database-card" style="margin-top: 20px;">
      <template #header>
        <span>数据库管理</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-button type="warning" @click="backupDatabase" style="width: 100%;">
            <el-icon><Download /></el-icon>
            备份数据库
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="danger" @click="clearCache" style="width: 100%;">
            <el-icon><Delete /></el-icon>
            清除缓存
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="info" @click="optimizeDatabase" style="width: 100%;">
            <el-icon><MagicStick /></el-icon>
            优化数据库
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="logs-card" style="margin-top: 20px;">
      <template #header>
        <span>系统日志</span>
        <el-button type="primary" size="small" style="float: right;" @click="refreshLogs">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>
      
      <el-table :data="logs" style="width: 100%" height="300">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getLogLevelType(row.level)" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="message" label="消息" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Delete, MagicStick, Refresh } from '@element-plus/icons-vue'

const router = useRouter()

const systemForm = ref({
  systemName: 'EduNexus 校企合作平台',
  version: 'v1.0.0',
  maintenanceMode: false,
  maintenanceMessage: '系统正在维护中，请稍后再试...'
})

const logs = ref([
  { time: '2024-01-15 10:30:25', level: 'INFO', module: '用户管理', message: '用户登录成功' },
  { time: '2024-01-15 10:25:18', level: 'WARNING', module: '数据库', message: '数据库连接池使用率超过80%' },
  { time: '2024-01-15 10:20:12', level: 'ERROR', module: 'API服务', message: 'API调用超时' },
  { time: '2024-01-15 10:15:07', level: 'INFO', module: '系统监控', message: '系统运行正常' }
])

const goBack = () => {
  router.back()
}

const saveSystemSettings = async () => {
  try {
    ElMessage.success('系统设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败')
  }
}

const resetSystemSettings = () => {
  systemForm.value = {
    systemName: 'EduNexus 校企合作平台',
    version: 'v1.0.0',
    maintenanceMode: false,
    maintenanceMessage: '系统正在维护中，请稍后再试...'
  }
  ElMessage.info('设置已重置')
}

const backupDatabase = async () => {
  try {
    await ElMessageBox.confirm('确定要备份数据库吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('数据库备份任务已开始')
  } catch (error) {
    ElMessage.info('取消备份')
  }
}

const clearCache = async () => {
  try {
    await ElMessageBox.confirm('确定要清除所有缓存吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('缓存已清除')
  } catch (error) {
    ElMessage.info('取消清除缓存')
  }
}

const optimizeDatabase = async () => {
  try {
    await ElMessageBox.confirm('确定要优化数据库吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('数据库优化任务已开始')
  } catch (error) {
    ElMessage.info('取消优化')
  }
}

const refreshLogs = () => {
  ElMessage.info('日志已刷新')
}

const getLogLevelType = (level) => {
  const types = {
    'INFO': 'success',
    'WARNING': 'warning',
    'ERROR': 'danger'
  }
  return types[level] || 'info'
}

onMounted(() => {
  // 初始化系统设置
})
</script>

<style scoped>
.system-management {
  padding: 20px;
}

.system-card, .database-card, .logs-card {
  margin-bottom: 20px;
}
</style>