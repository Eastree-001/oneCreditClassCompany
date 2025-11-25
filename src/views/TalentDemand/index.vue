<template>
  <div class="talent-demand">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>人才需求发布</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">发布需求</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="需求标题">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入需求标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待审核" value="pending" />
            <el-option label="已发布" value="published" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 需求列表 -->
      <el-table :data="demandList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="需求标题" min-width="200" />
        <el-table-column prop="position" label="岗位名称" width="150" />
        <el-table-column prop="count" label="需求人数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicants" label="申请人数" width="100" align="center" />
        <el-table-column prop="schools" label="合作高校" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="(school, index) in row.schools"
              :key="index"
              size="small"
              style="margin-right: 4px"
            >
              {{ school }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'published'"
              type="primary"
              link
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'published'"
              type="warning"
              link
              :icon="Close"
              @click="handleClose(row)"
            >
              关闭
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

    <!-- 发布/编辑对话框 -->
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
            <el-form-item label="需求标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入需求标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位名称" prop="position">
              <el-input v-model="formData.position" placeholder="请输入岗位名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="需求人数" prop="count">
              <el-input-number
                v-model="formData.count"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作地点" prop="location">
              <el-input v-model="formData.location" placeholder="请输入工作地点" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="岗位描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述岗位职责和要求"
          />
        </el-form-item>

        <el-form-item label="技能要求" prop="skills">
          <el-input
            v-model="skillsText"
            type="textarea"
            :rows="3"
            placeholder="请输入技能要求，多个技能用逗号或换行分隔"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历要求" prop="education">
              <el-select v-model="formData.education" placeholder="请选择" style="width: 100%">
                <el-option label="不限" value="" />
                <el-option label="大专" value="college" />
                <el-option label="本科" value="bachelor" />
                <el-option label="硕士" value="master" />
                <el-option label="博士" value="doctor" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资范围">
              <el-input v-model="formData.salary" placeholder="如：10k-20k" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="合作高校">
          <el-select
            v-model="formData.schools"
            multiple
            placeholder="请选择合作高校（可多选）"
            style="width: 100%"
          >
            <el-option label="清华大学" value="tsinghua" />
            <el-option label="北京大学" value="pku" />
            <el-option label="复旦大学" value="fudan" />
            <el-option label="上海交通大学" value="sjtu" />
            <el-option label="浙江大学" value="zju" />
          </el-select>
        </el-form-item>

        <el-form-item label="截止日期">
          <el-date-picker
            v-model="formData.deadline"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
          />
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
      title="需求详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="需求标题">{{ viewData.title }}</el-descriptions-item>
        <el-descriptions-item label="岗位名称">{{ viewData.position }}</el-descriptions-item>
        <el-descriptions-item label="需求人数">{{ viewData.count }}人</el-descriptions-item>
        <el-descriptions-item label="工作地点">{{ viewData.location }}</el-descriptions-item>
        <el-descriptions-item label="岗位描述" :span="2">{{ viewData.description }}</el-descriptions-item>
        <el-descriptions-item label="技能要求" :span="2">
          <el-tag
            v-for="(skill, index) in viewData.skills"
            :key="index"
            style="margin-right: 8px; margin-bottom: 4px"
          >
            {{ skill }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="学历要求">{{ getEducationName(viewData.education) }}</el-descriptions-item>
        <el-descriptions-item label="薪资范围">{{ viewData.salary || '面议' }}</el-descriptions-item>
        <el-descriptions-item label="合作高校" :span="2">
          <el-tag
            v-for="(school, index) in viewData.schools"
            :key="index"
            style="margin-right: 8px; margin-bottom: 4px"
          >
            {{ school }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请人数">{{ viewData.applicants }}人</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(viewData.status)">{{ getStatusName(viewData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ viewData.deadline || '无' }}</el-descriptions-item>
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
  Close
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
  title: '',
  position: '',
  count: 1,
  location: '',
  description: '',
  skills: [],
  education: '',
  salary: '',
  schools: [],
  deadline: null
})

const viewData = reactive({
  title: '',
  position: '',
  count: 0,
  location: '',
  description: '',
  skills: [],
  education: '',
  salary: '',
  schools: [],
  applicants: 0,
  status: '',
  createTime: '',
  deadline: null
})

const skillsText = computed({
  get: () => formData.skills.join(', '),
  set: (val) => {
    formData.skills = val
      .split(/[,，\n]/)
      .map(s => s.trim())
      .filter(s => s)
  }
})

const dialogTitle = computed(() => isEdit.value ? '编辑需求' : '发布需求')

const formRules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  position: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  count: [{ required: true, message: '请输入需求人数', trigger: 'blur' }],
  location: [{ required: true, message: '请输入工作地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入岗位描述', trigger: 'blur' }]
}

const demandList = ref([
  {
    id: 1,
    title: '招聘前端工程师',
    position: '前端工程师',
    count: 5,
    location: '北京',
    description: '负责公司前端产品开发',
    skills: ['React', 'Vue.js', 'TypeScript'],
    education: 'bachelor',
    salary: '15k-25k',
    schools: ['清华大学', '北京大学'],
    applicants: 23,
    status: 'published',
    createTime: '2024-01-10 10:30:00',
    deadline: '2024-02-28'
  },
  {
    id: 2,
    title: '招聘AI算法工程师',
    position: 'AI算法工程师',
    count: 3,
    location: '上海',
    description: '负责AI算法研发',
    skills: ['Python', 'TensorFlow', '机器学习'],
    education: 'master',
    salary: '20k-35k',
    schools: ['复旦大学', '上海交大'],
    applicants: 15,
    status: 'published',
    createTime: '2024-01-08 14:20:00',
    deadline: '2024-03-15'
  },
  {
    id: 3,
    title: '招聘数据安全分析师',
    position: '数据安全分析师',
    count: 2,
    location: '深圳',
    description: '负责数据安全分析',
    skills: ['网络安全', '数据加密'],
    education: 'bachelor',
    salary: '18k-28k',
    schools: ['浙江大学'],
    applicants: 8,
    status: 'pending',
    createTime: '2024-01-12 09:00:00',
    deadline: null
  }
])

onMounted(() => {
  pagination.total = demandList.value.length
})

const getStatusTag = (status) => {
  const map = {
    pending: 'warning',
    published: 'success',
    closed: 'info'
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    pending: '待审核',
    published: '已发布',
    closed: '已关闭'
  }
  return map[status] || status
}

const getEducationName = (education) => {
  const map = {
    college: '大专',
    bachelor: '本科',
    master: '硕士',
    doctor: '博士'
  }
  return map[education] || '不限'
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
    title: row.title,
    position: row.position,
    count: row.count,
    location: row.location,
    description: row.description,
    skills: [...row.skills],
    education: row.education,
    salary: row.salary,
    schools: [...row.schools],
    deadline: row.deadline
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  Object.assign(viewData, row)
  viewDialogVisible.value = true
}

const handleClose = (row) => {
  ElMessageBox.confirm('确定要关闭该需求吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = demandList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      demandList.value[index].status = 'closed'
      ElMessage.success('已关闭')
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该需求吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = demandList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      demandList.value.splice(index, 1)
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
        const schoolNames = {
          tsinghua: '清华大学',
          pku: '北京大学',
          fudan: '复旦大学',
          sjtu: '上海交通大学',
          zju: '浙江大学'
        }
        
        const schools = formData.schools.map(key => schoolNames[key] || key)
        
        if (isEdit.value) {
          const index = demandList.value.findIndex(item => item.id === formData.id)
          if (index > -1) {
            Object.assign(demandList.value[index], {
              ...formData,
              skills: [...formData.skills],
              schools: schools,
              createTime: demandList.value[index].createTime
            })
            ElMessage.success('更新成功')
          }
        } else {
          demandList.value.unshift({
            id: Date.now(),
            ...formData,
            skills: [...formData.skills],
            schools: schools,
            applicants: 0,
            status: 'pending',
            createTime: new Date().toLocaleString('zh-CN'),
            deadline: formData.deadline ? new Date(formData.deadline).toLocaleDateString('zh-CN') : null
          })
          pagination.total++
          ElMessage.success('发布成功，等待审核')
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
    title: '',
    position: '',
    count: 1,
    location: '',
    description: '',
    skills: [],
    education: '',
    salary: '',
    schools: [],
    deadline: null
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
.talent-demand {
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

