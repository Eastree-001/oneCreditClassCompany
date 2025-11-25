<template>
  <div class="cooperation">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>合作项目管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增项目</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入项目名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="合作高校">
          <el-select v-model="searchForm.school" placeholder="请选择" clearable style="width: 150px">
            <el-option label="清华大学" value="tsinghua" />
            <el-option label="北京大学" value="pku" />
            <el-option label="复旦大学" value="fudan" />
            <el-option label="上海交通大学" value="sjtu" />
            <el-option label="浙江大学" value="zju" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 项目列表 -->
      <el-table :data="projectList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="school" label="合作高校" width="150" />
        <el-table-column prop="type" label="项目类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="项目状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="students" label="参与学生数" width="120" align="center" />
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="getProgressStatus(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="120" />
        <el-table-column prop="endTime" label="结束时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'ongoing'"
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
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合作高校" prop="school">
              <el-select v-model="formData.school" placeholder="请选择合作高校" style="width: 100%">
                <el-option label="清华大学" value="tsinghua" />
                <el-option label="北京大学" value="pku" />
                <el-option label="复旦大学" value="fudan" />
                <el-option label="上海交通大学" value="sjtu" />
                <el-option label="浙江大学" value="zju" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择项目类型" style="width: 100%">
                <el-option label="人才培养" value="talent" />
                <el-option label="课程共建" value="course" />
                <el-option label="实习基地" value="internship" />
                <el-option label="科研合作" value="research" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计参与学生数" prop="students">
              <el-input-number
                v-model="formData.students"
                :min="1"
                :max="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
          />
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

        <el-form-item label="项目目标">
          <el-input
            v-model="formData.goals"
            type="textarea"
            :rows="3"
            placeholder="请输入项目目标"
          />
        </el-form-item>

        <el-form-item label="联系人">
          <el-input v-model="formData.contact" placeholder="请输入联系人姓名" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="项目详情"
      width="900px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="合作高校">{{ getSchoolName(viewData.school) }}</el-descriptions-item>
        <el-descriptions-item label="项目类型">
          <el-tag :type="getTypeTag(viewData.type)">{{ getTypeName(viewData.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="项目状态">
          <el-tag :type="getStatusTag(viewData.status)">{{ getStatusName(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="参与学生数">{{ viewData.students }}人</el-descriptions-item>
        <el-descriptions-item label="项目进度">
          <el-progress :percentage="viewData.progress" :status="getProgressStatus(viewData.progress)" />
        </el-descriptions-item>
        <el-descriptions-item label="项目描述" :span="2">{{ viewData.description }}</el-descriptions-item>
        <el-descriptions-item label="项目目标" :span="2">{{ viewData.goals || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ viewData.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ viewData.endTime }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ viewData.contact }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewData.phone }}</el-descriptions-item>
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
  View
} from '@element-plus/icons-vue'

const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  school: '',
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
  school: '',
  type: '',
  students: 10,
  description: '',
  startTime: null,
  endTime: null,
  goals: '',
  contact: '',
  phone: ''
})

const viewData = reactive({
  name: '',
  school: '',
  type: '',
  status: '',
  students: 0,
  progress: 0,
  description: '',
  startTime: '',
  endTime: '',
  goals: '',
  contact: '',
  phone: ''
})

const dialogTitle = computed(() => isEdit.value ? '编辑项目' : '新增项目')

const formRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  school: [{ required: true, message: '请选择合作高校', trigger: 'change' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  students: [{ required: true, message: '请输入预计参与学生数', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const projectList = ref([
  {
    id: 1,
    name: '前端工程师人才培养计划',
    school: 'tsinghua',
    type: 'talent',
    status: 'ongoing',
    students: 25,
    progress: 65,
    description: '与清华大学计算机系合作，培养前端工程师人才',
    startTime: '2024-01-01',
    endTime: '2024-06-30',
    goals: '培养25名前端工程师，掌握React、Vue.js等技能',
    contact: '张经理',
    phone: '13800138000'
  },
  {
    id: 2,
    name: 'AI算法课程共建',
    school: 'pku',
    type: 'course',
    status: 'ongoing',
    students: 30,
    progress: 45,
    description: '与北京大学合作共建AI算法课程',
    startTime: '2024-02-01',
    endTime: '2024-07-31',
    goals: '共建AI算法课程，培养30名算法工程师',
    contact: '李经理',
    phone: '13900139000'
  },
  {
    id: 3,
    name: '数据安全实习基地',
    school: 'fudan',
    type: 'internship',
    status: 'completed',
    students: 15,
    progress: 100,
    description: '与复旦大学合作建立数据安全实习基地',
    startTime: '2023-09-01',
    endTime: '2023-12-31',
    goals: '建立实习基地，提供15个实习岗位',
    contact: '王经理',
    phone: '13700137000'
  },
  {
    id: 4,
    name: 'AIGC内容设计科研合作',
    school: 'sjtu',
    type: 'research',
    status: 'paused',
    students: 10,
    progress: 30,
    description: '与上海交通大学合作进行AIGC内容设计研究',
    startTime: '2024-03-01',
    endTime: '2024-12-31',
    goals: '开展AIGC内容设计相关研究',
    contact: '陈经理',
    phone: '13600136000'
  }
])

onMounted(() => {
  pagination.total = projectList.value.length
})

const getSchoolName = (value) => {
  const map = {
    tsinghua: '清华大学',
    pku: '北京大学',
    fudan: '复旦大学',
    sjtu: '上海交通大学',
    zju: '浙江大学'
  }
  return map[value] || value
}

const getTypeTag = (type) => {
  const map = {
    talent: 'primary',
    course: 'success',
    internship: 'warning',
    research: 'info'
  }
  return map[type] || 'info'
}

const getTypeName = (type) => {
  const map = {
    talent: '人才培养',
    course: '课程共建',
    internship: '实习基地',
    research: '科研合作'
  }
  return map[type] || type
}

const getStatusTag = (status) => {
  const map = {
    ongoing: 'success',
    completed: 'info',
    paused: 'warning'
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    ongoing: '进行中',
    completed: '已完成',
    paused: '已暂停'
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
    school: row.school,
    type: row.type,
    students: row.students,
    description: row.description,
    startTime: row.startTime,
    endTime: row.endTime,
    goals: row.goals,
    contact: row.contact,
    phone: row.phone
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  Object.assign(viewData, {
    ...row,
    school: getSchoolName(row.school)
  })
  viewDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = projectList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      projectList.value.splice(index, 1)
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
        if (isEdit.value) {
          const index = projectList.value.findIndex(item => item.id === formData.id)
          if (index > -1) {
            Object.assign(projectList.value[index], {
              ...formData,
              status: projectList.value[index].status,
              progress: projectList.value[index].progress
            })
            ElMessage.success('更新成功')
          }
        } else {
          projectList.value.unshift({
            id: Date.now(),
            ...formData,
            status: 'ongoing',
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
    school: '',
    type: '',
    students: 10,
    description: '',
    startTime: null,
    endTime: null,
    goals: '',
    contact: '',
    phone: ''
  })
  formRef.value?.clearValidate()
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中')
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.school = ''
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
.cooperation {
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
}
</style>

