<template>
  <div class="training">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>培训计划管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">创建计划</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="计划名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入计划名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="计划状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="待开始" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 计划列表 -->
      <el-table :data="planList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="计划名称" min-width="200" />
        <el-table-column prop="type" label="计划类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="计划状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与人数" width="100" align="center" />
        <el-table-column prop="courses" label="课程数量" width="100" align="center">
          <template #default="{ row }">
            {{ row.courses.length }}门
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="培训周期" width="120" />
        <el-table-column prop="progress" label="完成进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="getProgressStatus(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'pending' || row.status === 'ongoing'"
              type="primary"
              link
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择计划类型" style="width: 100%">
                <el-option label="新员工入职培训" value="onboarding" />
                <el-option label="技能提升培训" value="skill" />
                <el-option label="岗位专项培训" value="position" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="参与人数" prop="participants">
              <el-input-number
                v-model="formData.participants"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="培训周期" prop="duration">
              <el-input v-model="formData.duration" placeholder="如：2周" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="计划描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入计划描述"
          />
        </el-form-item>

        <el-form-item label="选择课程" prop="courses">
          <el-select
            v-model="formData.courses"
            multiple
            filterable
            placeholder="请选择培训课程（可多选）"
            style="width: 100%"
          >
            <el-option
              v-for="course in availableCourses"
              :key="course.id"
              :label="`${course.name} - ${course.school}`"
              :value="course.id"
            >
              <div class="course-option">
                <span>{{ course.name }}</span>
                <el-tag size="small" style="margin-left: 8px">{{ course.school }}</el-tag>
              </div>
            </el-option>
          </el-select>
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>已选择 {{ formData.courses.length }} 门课程</span>
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="date"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="date"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="培训计划详情"
      width="900px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="计划名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="计划类型">
          <el-tag :type="getTypeTag(viewData.type)">{{ getTypeName(viewData.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计划状态">
          <el-tag :type="getStatusTag(viewData.status)">{{ getStatusName(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="参与人数">{{ viewData.participants }}人</el-descriptions-item>
        <el-descriptions-item label="课程数量">{{ viewData.courses.length }}门</el-descriptions-item>
        <el-descriptions-item label="培训周期">{{ viewData.duration }}</el-descriptions-item>
        <el-descriptions-item label="完成进度">
          <el-progress :percentage="viewData.progress" :status="getProgressStatus(viewData.progress)" />
        </el-descriptions-item>
        <el-descriptions-item label="计划描述" :span="2">{{ viewData.description }}</el-descriptions-item>
        <el-descriptions-item label="培训课程" :span="2">
          <el-table :data="viewData.courses" border style="width: 100%">
            <el-table-column prop="name" label="课程名称" min-width="200" />
            <el-table-column prop="school" label="学校" width="150" />
            <el-table-column prop="teacher" label="授课教师" width="120" />
            <el-table-column prop="duration" label="课时" width="100" align="center" />
          </el-table>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ viewData.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ viewData.endTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
  View,
  InfoFilled
} from '@element-plus/icons-vue'

const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const formData = reactive({
  id: null,
  name: '',
  type: '',
  participants: 10,
  duration: '',
  description: '',
  courses: [],
  startTime: null,
  endTime: null
})

const viewData = reactive({
  name: '',
  type: '',
  status: '',
  participants: 0,
  duration: '',
  progress: 0,
  description: '',
  courses: [],
  startTime: '',
  endTime: ''
})

const dialogTitle = computed(() => isEdit.value ? '编辑计划' : '创建计划')

const formRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择计划类型', trigger: 'change' }],
  participants: [{ required: true, message: '请输入参与人数', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入培训周期', trigger: 'blur' }],
  description: [{ required: true, message: '请输入计划描述', trigger: 'blur' }],
  courses: [{ required: true, message: '请至少选择一门课程', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const availableCourses = ref([
  { id: 1, name: 'React 前端开发实战', school: '清华大学', teacher: '张教授', duration: 32 },
  { id: 2, name: '现代Web开发技术栈', school: '北京大学', teacher: '李教授', duration: 40 },
  { id: 3, name: '云数据库应用开发', school: '复旦大学', teacher: '王教授', duration: 24 },
  { id: 4, name: '工作流自动化工具', school: '上海交大', teacher: '陈教授', duration: 16 },
  { id: 5, name: 'TypeScript 高级编程', school: '浙江大学', teacher: '刘教授', duration: 28 },
  { id: 6, name: 'Python 机器学习', school: '清华大学', teacher: '赵教授', duration: 36 },
  { id: 7, name: '深度学习实战', school: '北京大学', teacher: '孙教授', duration: 42 }
])

const planList = ref([
  {
    id: 1,
    name: '新员工前端技能培训',
    type: 'onboarding',
    status: 'ongoing',
    participants: 15,
    duration: '2周',
    description: '为新入职的前端工程师提供技能培训',
    courses: [
      { name: 'React 前端开发实战', school: '清华大学', teacher: '张教授', duration: 32 },
      { name: 'TypeScript 高级编程', school: '浙江大学', teacher: '刘教授', duration: 28 }
    ],
    progress: 65,
    startTime: '2024-01-10',
    endTime: '2024-01-24'
  },
  {
    id: 2,
    name: 'AI算法工程师提升培训',
    type: 'skill',
    status: 'ongoing',
    participants: 8,
    duration: '4周',
    description: '提升现有AI算法工程师的技能水平',
    courses: [
      { name: 'Python 机器学习', school: '清华大学', teacher: '赵教授', duration: 36 },
      { name: '深度学习实战', school: '北京大学', teacher: '孙教授', duration: 42 }
    ],
    progress: 45,
    startTime: '2024-01-15',
    endTime: '2024-02-12'
  },
  {
    id: 3,
    name: '数据安全分析师专项培训',
    type: 'position',
    status: 'completed',
    participants: 12,
    duration: '3周',
    description: '为数据安全分析师岗位提供专项培训',
    courses: [
      { name: '网络安全基础', school: '复旦大学', teacher: '周教授', duration: 24 }
    ],
    progress: 100,
    startTime: '2023-12-01',
    endTime: '2023-12-22'
  },
  {
    id: 4,
    name: 'AIGC内容设计师培训',
    type: 'onboarding',
    status: 'pending',
    participants: 5,
    duration: '2周',
    description: '为新入职的AIGC内容设计师提供培训',
    courses: [
      { name: 'AIGC工具使用', school: '上海交大', teacher: '吴教授', duration: 20 }
    ],
    progress: 0,
    startTime: '2024-02-01',
    endTime: '2024-02-15'
  }
])

onMounted(() => {
  pagination.total = planList.value.length
})

const getTypeTag = (type) => {
  const map = {
    onboarding: 'primary',
    skill: 'success',
    position: 'warning'
  }
  return map[type] || 'info'
}

const getTypeName = (type) => {
  const map = {
    onboarding: '新员工入职培训',
    skill: '技能提升培训',
    position: '岗位专项培训'
  }
  return map[type] || type
}

const getStatusTag = (status) => {
  const map = {
    pending: 'info',
    ongoing: 'success',
    completed: ''
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    pending: '待开始',
    ongoing: '进行中',
    completed: '已完成'
  }
  return map[status] || status
}

const getProgressStatus = (progress) => {
  if (progress >= 100) return 'success'
  if (progress >= 50) return null
  return 'exception'
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    type: row.type,
    participants: row.participants,
    duration: row.duration,
    description: row.description,
    courses: row.courses.map(c => c.id || c.name),
    startTime: row.startTime,
    endTime: row.endTime
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  Object.assign(viewData, row)
  viewDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该培训计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = planList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      planList.value.splice(index, 1)
      pagination.total--
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        const selectedCourses = availableCourses.value.filter(c => formData.courses.includes(c.id))
        
        if (isEdit.value) {
          const index = planList.value.findIndex(item => item.id === formData.id)
          if (index > -1) {
            Object.assign(planList.value[index], {
              ...formData,
              courses: selectedCourses,
              status: planList.value[index].status,
              progress: planList.value[index].progress
            })
            ElMessage.success('更新成功')
          }
        } else {
          planList.value.unshift({
            id: Date.now(),
            ...formData,
            courses: selectedCourses,
            status: 'pending',
            progress: 0,
            startTime: formData.startTime ? new Date(formData.startTime).toLocaleDateString('zh-CN') : '',
            endTime: formData.endTime ? new Date(formData.endTime).toLocaleDateString('zh-CN') : ''
          })
          pagination.total++
          ElMessage.success('创建成功')
        }
        submitLoading.value = false
        dialogVisible.value = false
        resetForm()
      }, 500)
    }
  })
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    type: '',
    participants: 10,
    duration: '',
    description: '',
    courses: [],
    startTime: null,
    endTime: null
  })
  formRef.value?.clearValidate()
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中')
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = ''
}

const handleSizeChange = (size) => {
  pagination.size = size
}

const handlePageChange = (page) => {
  pagination.page = page
}
</script>

<style lang="scss" scoped>
.training {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }
  
  .search-form {
    margin-bottom: 20px;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .form-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .course-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

