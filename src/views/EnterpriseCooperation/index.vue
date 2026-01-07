<template>
  <div class="cooperation">
    <!-- 统计卡片（与高校端风格一致，可后端接入真实统计） -->
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
            placeholder="搜索高校名称"
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
            <el-option label="待高校确认" value="pending_university" />
            <el-option label="待企业确认" value="pending_enterprise" />
            <el-option label="进行中" value="active" />
            <el-option label="已拒绝" value="rejected" />
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
            发起合作
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 校企合作关系列表 -->
    <el-card shadow="hover">
      <el-table :data="cooperationList" v-loading="loading" stripe>
        <el-table-column prop="universityName" label="高校名称" width="200">
          <template #default="{ row }">
            {{ row.universityName || row.university_name || row.schoolName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="合作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="合作项目" min-width="200" />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="status" label="合作状态" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="参与学生数" width="120" align="center" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看详情</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="canConfirm(row)"
              type="success"
              link
              size="small"
              @click="handleConfirm(row)"
            >
              确认合作
            </el-button>
            <el-button
              v-if="canConfirm(row)"
              type="danger"
              link
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
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

    <!-- 编辑/发起合作对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="高校名称" prop="universityName">
          <el-input v-model="formData.universityName" placeholder="请输入高校名称" />
        </el-form-item>
        <el-form-item label="合作类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择合作类型" style="width: 100%">
            <el-option label="项目实训" value="project" />
            <el-option label="课程共建" value="course" />
            <el-option label="人才培养" value="talent" />
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
            <el-option label="待高校确认" value="pending_university" />
            <el-option label="待企业确认" value="pending_enterprise" />
            <el-option label="进行中" value="active" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已终止" value="terminated" />
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
      title="校企合作详情"
      width="900px"
      v-loading="detailLoading"
    >
      <el-descriptions :column="2" border v-if="currentCooperation">
        <el-descriptions-item label="高校名称">
          {{ currentCooperation.universityName || currentCooperation.university_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="合作类型">
          <el-tag :type="getTypeTag(currentCooperation.type)">
            {{ getTypeText(currentCooperation.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="合作项目">
          {{ currentCooperation.projectName }}
        </el-descriptions-item>
        <el-descriptions-item label="合作状态">
          <el-tag :type="getStatusTag(currentCooperation.status)">
            {{ getStatusText(currentCooperation.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ currentCooperation.startTime }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ currentCooperation.endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="参与学生数">
          {{ currentCooperation.studentCount }}人
        </el-descriptions-item>
        <el-descriptions-item label="联系人">
          {{ currentCooperation.contact || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentCooperation.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">
          <div class="description-content">
            {{ currentCooperation.description || '暂无描述' }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { cooperationApi } from '@/api'

const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const dialogTitle = ref('发起合作')
const formRef = ref(null)

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const cooperationList = ref([])
const currentCooperation = ref(null)

const formData = ref({
  id: null,
  universityName: '',
  universityId: null,
  type: '',
  projectName: '',
  description: '',
  timeRange: [],
  status: 'pending_university',
  studentCount: 0,
  contact: '',
  phone: ''
})

const formRules = {
  universityName: [{ required: true, message: '请输入高校名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择合作类型', trigger: 'change' }],
  projectName: [{ required: true, message: '请输入合作项目名称', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择合作时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择合作状态', trigger: 'change' }]
}

const stats = ref([
  { title: '合作高校', value: '0', icon: 'School', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '进行中', value: '0', icon: 'Loading', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '参与学生', value: '0', icon: 'User', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '已完成合作', value: '0', icon: 'CircleCheck', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

// 模拟数据存储（测试用）
const mockData = ref([
  {
    id: 1,
    enterpriseId: 1,
    universityId: 1,
    universityName: '清华大学',
    type: 'course',
    projectName: '前端开发课程共建',
    description: '与企业合作共建前端开发课程，引入企业真实项目案例，提升学生实践能力。',
    startTime: '2024-01-01',
    endTime: '2024-06-30',
    status: 'pending_university',
    enterpriseConfirmed: true,
    universityConfirmed: false,
    initiator: 'enterprise',
    studentCount: 60,
    contact: '张老师',
    phone: '13800000001'
  },
  {
    id: 2,
    enterpriseId: 1,
    universityId: 2,
    universityName: '北京大学',
    type: 'project',
    projectName: 'Java企业级开发实训',
    description: '与企业合作开展Java企业级开发实训项目，学生参与真实项目开发，提升实战经验。',
    startTime: '2024-02-01',
    endTime: '2024-08-31',
    status: 'active',
    enterpriseConfirmed: true,
    universityConfirmed: true,
    initiator: 'enterprise',
    studentCount: 45,
    contact: '李老师',
    phone: '13800000002'
  },
  {
    id: 3,
    enterpriseId: 1,
    universityId: 3,
    universityName: '复旦大学',
    type: 'talent',
    projectName: '大数据分析人才培养',
    description: '与企业合作培养大数据分析人才，提供实习机会，共同培养符合行业需求的高素质人才。',
    startTime: '2024-03-01',
    endTime: '2024-12-31',
    status: 'pending_enterprise',
    enterpriseConfirmed: false,
    universityConfirmed: true,
    initiator: 'university',
    studentCount: 30,
    contact: '王老师',
    phone: '13800000003'
  },
  {
    id: 4,
    enterpriseId: 1,
    universityId: 4,
    universityName: '上海交通大学',
    type: 'course',
    projectName: 'Python数据分析课程共建',
    description: '与企业合作共建Python数据分析课程，引入企业真实数据分析案例。',
    startTime: '2023-09-01',
    endTime: '2024-01-31',
    status: 'active',
    enterpriseConfirmed: true,
    universityConfirmed: true,
    initiator: 'enterprise',
    studentCount: 50,
    contact: '刘老师',
    phone: '13800000004'
  },
  {
    id: 5,
    enterpriseId: 1,
    universityId: 5,
    universityName: '浙江大学',
    type: 'project',
    projectName: 'AI算法工程师实训',
    description: '与企业合作开展AI算法工程师实训项目，学生参与真实AI项目开发。',
    startTime: '2024-01-15',
    endTime: '2024-07-15',
    status: 'rejected',
    enterpriseConfirmed: false,
    universityConfirmed: false,
    initiator: 'enterprise',
    studentCount: 0,
    contact: '陈老师',
    phone: '13800000005'
  }
])

const getTypeTag = (type) => {
  const typeMap = {
    project: 'primary',
    course: 'success',
    talent: 'warning'
  }
  return typeMap[type] || ''
}

const getTypeText = (type) => {
  const typeMap = {
    project: '项目实训',
    course: '课程共建',
    talent: '人才培养'
  }
  return typeMap[type] || type
}

const getStatusTag = (status) => {
  const typeMap = {
    pending_university: 'warning',
    pending_enterprise: 'warning',
    active: 'success',
    rejected: 'danger',
    terminated: 'info'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const statusMap = {
    pending_university: '待高校确认',
    pending_enterprise: '待企业确认',
    active: '进行中',
    rejected: '已拒绝',
    terminated: '已终止'
  }
  return statusMap[status] || status
}

// 是否可以在企业端执行“确认/拒绝”操作：当前为待企业确认
const canConfirm = (row) => {
  return row.status === 'pending_enterprise'
}

const loadCooperationList = async () => {
  loading.value = true
  try {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 使用测试数据
    let filteredData = [...mockData.value]
    
    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      filteredData = filteredData.filter(item => 
        item.universityName.toLowerCase().includes(keyword) ||
        item.projectName.toLowerCase().includes(keyword)
      )
    }
    
    // 状态过滤
    if (filterStatus.value) {
      filteredData = filteredData.filter(item => item.status === filterStatus.value)
    }
    
    // 类型过滤
    if (filterType.value) {
      filteredData = filteredData.filter(item => item.type === filterType.value)
    }
    
    // 分页
    const start = (pagination.value.page - 1) * pagination.value.size
    const end = start + pagination.value.size
    cooperationList.value = filteredData.slice(start, end)
    pagination.value.total = filteredData.length
    
    // 更新统计数据
    updateStats()
    
    console.log('✅ 使用测试数据加载校企合作列表:', {
      listLength: cooperationList.value.length,
      total: pagination.value.total
    })
  } catch (error) {
    console.error('加载企业端校企合作关系列表失败:', error)
    ElMessage.error('加载校企合作列表失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  const allData = mockData.value
  const activeCount = allData.filter(item => item.status === 'active').length
  const totalStudents = allData.reduce((sum, item) => sum + (item.studentCount || 0), 0)
  const uniqueUniversities = new Set(allData.map(item => item.universityId)).size
  
  stats.value[0].value = String(uniqueUniversities)
  stats.value[1].value = String(activeCount)
  stats.value[2].value = String(totalStudents)
  stats.value[3].value = String(allData.filter(item => item.status === 'active' && new Date(item.endTime) < new Date()).length)
}

const handleSearch = () => {
  pagination.value.page = 1
  loadCooperationList()
}

const handleAdd = () => {
  dialogTitle.value = '发起合作'
  formData.value = {
    id: null,
    universityName: '',
    universityId: null,
    type: '',
    projectName: '',
    description: '',
    timeRange: [],
    status: 'pending_university',
    studentCount: 0,
    contact: '',
    phone: ''
  }
  dialogVisible.value = true
}

const handleView = async (row) => {
  detailLoading.value = true
  detailDialogVisible.value = true
  try {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 使用测试数据
    const data = mockData.value.find(item => item.id === row.id) || row
    currentCooperation.value = data
    
    console.log('✅ 使用测试数据加载合作详情:', data)
  } catch (error) {
    console.error('加载企业端校企合作关系详情失败:', error)
    ElMessage.error('加载合作详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑合作'
  formData.value = {
    id: row.id,
    universityName: row.universityName || row.university_name,
    universityId: row.universityId || row.university_id,
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
  ElMessageBox.confirm(`确定要删除与 "${row.universityName || row.university_name}" 的合作关系吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 从测试数据中删除
        const index = mockData.value.findIndex(item => item.id === row.id)
        if (index > -1) {
          mockData.value.splice(index, 1)
        }
        
        ElMessage.success('删除成功（测试数据）')
        loadCooperationList()
      } catch (error) {
        console.error('删除合作关系失败:', error)
        ElMessage.error('删除失败，请稍后重试')
      }
    })
    .catch(() => {})
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const payload = {
        universityName: formData.value.universityName,
        universityId: formData.value.universityId || Date.now(),
        type: formData.value.type,
        projectName: formData.value.projectName,
        description: formData.value.description,
        startTime: formData.value.timeRange?.[0] || '',
        endTime: formData.value.timeRange?.[1] || '',
        status: formData.value.status,
        studentCount: formData.value.studentCount,
        contact: formData.value.contact,
        phone: formData.value.phone,
        enterpriseId: 1,
        enterpriseConfirmed: formData.value.status === 'pending_university',
        universityConfirmed: false,
        initiator: 'enterprise'
      }

      if (formData.value.id) {
        // 更新
        const index = mockData.value.findIndex(item => item.id === formData.value.id)
        if (index > -1) {
          mockData.value[index] = { ...mockData.value[index], ...payload, id: formData.value.id }
        }
        ElMessage.success('更新成功（测试数据）')
      } else {
        // 创建
        const newItem = {
          id: Date.now(),
          ...payload
        }
        mockData.value.unshift(newItem)
        ElMessage.success('发起合作成功（测试数据）')
      }
      dialogVisible.value = false
      loadCooperationList()
    } catch (error) {
      console.error('提交校企合作失败:', error)
      ElMessage.error('提交失败，请稍后重试')
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

// 企业确认合作
const handleConfirm = (row) => {
  ElMessageBox.confirm(`确认与 "${row.universityName || row.university_name}" 建立合作关系吗？`, '确认合作', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'success'
  })
    .then(async () => {
      try {
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 更新测试数据
        const index = mockData.value.findIndex(item => item.id === row.id)
        if (index > -1) {
          mockData.value[index].enterpriseConfirmed = true
          // 如果高校也已确认，则状态变为 active
          if (mockData.value[index].universityConfirmed) {
            mockData.value[index].status = 'active'
          } else {
            mockData.value[index].status = 'pending_university'
          }
        }
        
        ElMessage.success('已确认合作（测试数据）')
        loadCooperationList()
      } catch (error) {
        console.error('确认合作失败:', error)
        ElMessage.error('确认失败，请稍后重试')
      }
    })
    .catch(() => {})
}

// 企业拒绝合作
const handleReject = (row) => {
  ElMessageBox.confirm(`确定要拒绝与 "${row.universityName || row.university_name}" 的合作请求吗？`, '拒绝合作', {
    confirmButtonText: '拒绝',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 更新测试数据
        const index = mockData.value.findIndex(item => item.id === row.id)
        if (index > -1) {
          mockData.value[index].status = 'rejected'
          mockData.value[index].enterpriseConfirmed = false
        }
        
        ElMessage.success('已拒绝合作（测试数据）')
        loadCooperationList()
      } catch (error) {
        console.error('拒绝合作失败:', error)
        ElMessage.error('拒绝失败，请稍后重试')
      }
    })
    .catch(() => {})
}

onMounted(() => {
  loadCooperationList()
})
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


