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
        <el-col :span="4" :offset="6">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建合作
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 合作列表 -->
    <el-card shadow="hover">
      <el-table :data="cooperationList" v-loading="loading" stripe>
        <el-table-column prop="enterpriseName" label="企业名称" width="200" />
        <el-table-column prop="type" label="合作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="合作项目" width="200" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="status" label="合作状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="参与学生数" width="120" align="center" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看详情</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
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
          <el-input v-model="formData.enterpriseName" placeholder="请输入企业名称" />
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
    >
      <el-descriptions :column="2" border v-if="currentCooperation">
        <el-descriptions-item label="企业名称">{{ currentCooperation.enterpriseName }}</el-descriptions-item>
        <el-descriptions-item label="合作类型">
          <el-tag :type="getTypeTag(currentCooperation.type)">{{ currentCooperation.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="合作项目">{{ currentCooperation.projectName }}</el-descriptions-item>
        <el-descriptions-item label="合作状态">
          <el-tag :type="getStatusTag(currentCooperation.status)">{{ currentCooperation.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentCooperation.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentCooperation.endTime }}</el-descriptions-item>
        <el-descriptions-item label="参与学生数">{{ currentCooperation.studentCount }}人</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentCooperation.contact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentCooperation.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">
          <div class="description-content">{{ currentCooperation.description }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const dialogTitle = ref('新建合作')
const formRef = ref(null)

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const cooperationList = ref([
  {
    id: 1,
    enterpriseName: 'XX科技有限公司',
    type: '项目实训',
    projectName: 'Java企业级开发实训',
    startTime: '2024-01-01',
    endTime: '2024-06-30',
    status: '进行中',
    studentCount: 45,
    contact: '张经理',
    phone: '13800138000',
    description: '与企业合作开展Java企业级开发实训项目，学生参与真实项目开发...'
  },
  {
    id: 2,
    enterpriseName: 'YY互联网公司',
    type: '课程共建',
    projectName: '前端开发课程共建',
    startTime: '2023-09-01',
    endTime: '2024-01-31',
    status: '已完成',
    studentCount: 60,
    contact: '李总监',
    phone: '13900139000',
    description: '与企业合作共建前端开发课程，引入企业真实案例...'
  },
  {
    id: 3,
    enterpriseName: 'ZZ数据公司',
    type: '人才培养',
    projectName: '大数据分析人才培养',
    startTime: '2024-02-01',
    endTime: '2024-12-31',
    status: '进行中',
    studentCount: 30,
    contact: '王经理',
    phone: '13700137000',
    description: '与企业合作培养大数据分析人才，提供实习机会...'
  }
])

const currentCooperation = ref(null)

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
  { title: '合作企业', value: '28', icon: 'OfficeBuilding', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '进行中', value: '15', icon: 'Loading', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '参与学生', value: '856', icon: 'User', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '已完成项目', value: '13', icon: 'CircleCheck', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

const getTypeTag = (type) => {
  const typeMap = {
    '项目实训': 'primary',
    '课程共建': 'success',
    '人才培养': 'warning'
  }
  return typeMap[type] || ''
}

const getStatusTag = (status) => {
  const typeMap = {
    '进行中': 'primary',
    '已完成': 'success',
    '已终止': 'danger'
  }
  return typeMap[status] || ''
}

const handleSearch = () => {
  ElMessage.info('搜索功能待实现')
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

const handleView = (row) => {
  currentCooperation.value = row
  detailDialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑合作'
  formData.value = {
    enterpriseName: row.enterpriseName,
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
  ElMessageBox.confirm(`确定要删除与"${row.enterpriseName}"的合作吗？`, '提示', {
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
}

const handlePageChange = (page) => {
  pagination.value.page = page
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

