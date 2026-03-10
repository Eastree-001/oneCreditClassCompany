<template>
  <div class="dashboard-admin">
    <el-page-header @back="goBack" content="管理员看板" />
    
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon user-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon enterprise-icon">
                <el-icon><OfficeBuilding /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalEnterprises || 0 }}</div>
                <div class="stat-label">企业数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon university-icon">
                <el-icon><School /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalUniversities || 0 }}</div>
                <div class="stat-label">高校数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon cooperation-icon">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalCooperations || 0 }}</div>
                <div class="stat-label">合作项目</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card header="用户分布">
          <div id="userChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="合作项目状态">
          <div id="cooperationChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card header="快速操作">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-button type="primary" @click="$router.push('/user-management')" size="large" style="width: 100%;">
                <el-icon><User /></el-icon>
                用户管理
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="success" @click="$router.push('/cooperation-audit')" size="large" style="width: 100%;">
                <el-icon><Document /></el-icon>
                合作审核
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="warning" @click="$router.push('/system-management')" size="large" style="width: 100%;">
                <el-icon><Setting /></el-icon>
                系统管理
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="info" @click="refreshStats" size="large" style="width: 100%;">
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  OfficeBuilding, 
  School, 
  Connection, 
  Refresh, 
  Setting 
} from '@element-plus/icons-vue'

const router = useRouter()

const stats = ref({
  totalUsers: 0,
  totalEnterprises: 0,
  totalUniversities: 0,
  totalCooperations: 0
})

const goBack = () => {
  router.back()
}

const refreshStats = async () => {
  try {
    // 模拟数据加载
    stats.value = {
      totalUsers: 1568,
      totalEnterprises: 234,
      totalUniversities: 89,
      totalCooperations: 567
    }
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新数据失败')
  }
}

onMounted(() => {
  refreshStats()
})
</script>

<style scoped>
.dashboard-admin {
  padding: 20px;
}

.stats-cards {
  margin: 20px 0;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.user-icon { background: #409eff; }
.enterprise-icon { background: #67c23a; }
.university-icon { background: #e6a23c; }
.cooperation-icon { background: #f56c6c; }

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.charts-section {
  margin: 20px 0;
}

.quick-actions {
  margin: 20px 0;
}

.quick-actions .el-button {
  height: 60px;
  font-size: 16px;
}
</style>