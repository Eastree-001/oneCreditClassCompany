<template>
  <div class="skill-profile">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>岗位技能画像管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增画像</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="岗位名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入岗位名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="岗位类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable style="width: 150px">
            <el-option label="技术类" value="tech" />
            <el-option label="设计类" value="design" />
            <el-option label="产品类" value="product" />
            <el-option label="运营类" value="operation" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 画像列表 -->
      <el-table :data="profileList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="岗位名称" width="180" />
        <el-table-column prop="type" label="岗位类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="skills" label="技能要求" min-width="300">
          <template #default="{ row }">
            <el-tag
              v-for="(skill, index) in row.skills"
              :key="index"
              size="small"
              style="margin-right: 8px; margin-bottom: 4px"
            >
              {{ skill }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="matchCount" label="匹配课程数" width="120" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="viewMatch(row)">{{ row.matchCount }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link :icon="View" @click="handleView(row)">查看</el-button>
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
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入岗位名称，如：前端工程师" />
        </el-form-item>
        <el-form-item label="岗位类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择岗位类型" style="width: 100%">
            <el-option label="技术类" value="tech" />
            <el-option label="设计类" value="design" />
            <el-option label="产品类" value="product" />
            <el-option label="运营类" value="operation" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入岗位描述"
          />
        </el-form-item>
        <el-form-item label="技能要求" prop="skills">
          <el-input
            v-model="skillsText"
            type="textarea"
            :rows="4"
            placeholder="请输入技能要求，多个技能用逗号或换行分隔，如：React, Supabase, n8n"
          />
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>示例：React, Vue.js, TypeScript, Node.js, Supabase, n8n</span>
          </div>
        </el-form-item>
        <el-form-item label="经验要求">
          <el-input
            v-model="formData.experience"
            placeholder="如：1-3年工作经验"
          />
        </el-form-item>
        <el-form-item label="学历要求">
          <el-select v-model="formData.education" placeholder="请选择" style="width: 100%">
            <el-option label="不限" value="" />
            <el-option label="大专" value="college" />
            <el-option label="本科" value="bachelor" />
            <el-option label="硕士" value="master" />
            <el-option label="博士" value="doctor" />
          </el-select>
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
      title="岗位画像详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="岗位名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="岗位类型">
          <el-tag :type="getTypeTag(viewData.type)">{{ getTypeName(viewData.type) }}</el-tag>
        </el-descriptions-item>
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
        <el-descriptions-item label="经验要求">{{ viewData.experience || '不限' }}</el-descriptions-item>
        <el-descriptions-item label="学历要求">{{ getEducationName(viewData.education) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="匹配课程数">{{ viewData.matchCount }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
        <el-button @click="goToMatch(viewData)">查看课程匹配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  type: ''
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
  description: '',
  skills: [],
  experience: '',
  education: ''
})

const viewData = reactive({
  name: '',
  type: '',
  description: '',
  skills: [],
  experience: '',
  education: '',
  createTime: '',
  matchCount: 0
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

const dialogTitle = computed(() => isEdit.value ? '编辑岗位画像' : '新增岗位画像')

const formRules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择岗位类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入岗位描述', trigger: 'blur' }],
  skills: [{ required: true, message: '请输入至少一个技能要求', trigger: 'change' }]
}

// 模拟数据
const profileList = ref([
  {
    id: 1,
    name: '前端工程师',
    type: 'tech',
    description: '负责公司前端产品开发，需要掌握现代前端技术栈',
    skills: ['React', 'Supabase', 'n8n', 'TypeScript', 'Vue.js'],
    experience: '1-3年',
    education: 'bachelor',
    createTime: '2024-01-10 10:30:00',
    matchCount: 12
  },
  {
    id: 2,
    name: 'AI算法工程师',
    type: 'tech',
    description: '负责AI算法研发和优化',
    skills: ['Python', 'TensorFlow', 'PyTorch', '机器学习', '深度学习'],
    experience: '2-5年',
    education: 'master',
    createTime: '2024-01-08 14:20:00',
    matchCount: 15
  },
  {
    id: 3,
    name: '数据安全分析师',
    type: 'tech',
    description: '负责数据安全分析和风险评估',
    skills: ['网络安全', '数据加密', '风险评估', '安全审计'],
    experience: '2-4年',
    education: 'bachelor',
    createTime: '2024-01-05 09:15:00',
    matchCount: 8
  },
  {
    id: 4,
    name: 'AIGC内容设计师',
    type: 'design',
    description: '使用AI工具进行内容创作和设计',
    skills: ['Midjourney', 'Stable Diffusion', 'ChatGPT', '设计思维'],
    experience: '1-2年',
    education: 'bachelor',
    createTime: '2024-01-03 16:45:00',
    matchCount: 10
  }
])

onMounted(() => {
  pagination.total = profileList.value.length
})

const getTypeTag = (type) => {
  const map = {
    tech: 'primary',
    design: 'success',
    product: 'warning',
    operation: 'info'
  }
  return map[type] || 'info'
}

const getTypeName = (type) => {
  const map = {
    tech: '技术类',
    design: '设计类',
    product: '产品类',
    operation: '运营类'
  }
  return map[type] || type
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
    name: row.name,
    type: row.type,
    description: row.description,
    skills: [...row.skills],
    experience: row.experience,
    education: row.education
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  Object.assign(viewData, row)
  viewDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该岗位画像吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = profileList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      profileList.value.splice(index, 1)
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
          const index = profileList.value.findIndex(item => item.id === formData.id)
          if (index > -1) {
            Object.assign(profileList.value[index], {
              ...formData,
              skills: [...formData.skills],
              createTime: profileList.value[index].createTime
            })
            ElMessage.success('更新成功')
          }
        } else {
          profileList.value.unshift({
            id: Date.now(),
            ...formData,
            skills: [...formData.skills],
            createTime: new Date().toLocaleString('zh-CN'),
            matchCount: 0
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
    description: '',
    skills: [],
    experience: '',
    education: ''
  })
  formRef.value?.clearValidate()
}

const handleSearch = () => {
  ElMessage.info('搜索功能开发中')
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = ''
}

const handleSizeChange = (size) => {
  pagination.size = size
}

const handlePageChange = (page) => {
  pagination.page = page
}

const viewMatch = (row) => {
  router.push({ path: '/course-match', query: { profileId: row.id } })
}

const goToMatch = (row) => {
  viewDialogVisible.value = false
  router.push({ path: '/course-match', query: { profileId: row.id } })
}
</script>

<style lang="scss" scoped>
.skill-profile {
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
}
</style>

