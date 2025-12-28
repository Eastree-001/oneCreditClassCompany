<template>
  <div class="course-slice">
    <!-- 操作栏 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索课程名称"
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
          <el-select v-model="filterStatus" placeholder="审批状态" clearable @change="handleSearch">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterCategory" placeholder="课程分类" clearable @change="handleSearch">
            <el-option label="编程语言" value="编程语言" />
            <el-option label="数据库" value="数据库" />
            <el-option label="前端开发" value="前端开发" />
            <el-option label="后端开发" value="后端开发" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- 课程列表 -->
    <el-card shadow="hover">
      <el-table :data="courseList" v-loading="loading" stripe>
        <el-table-column prop="courseName" label="课程名称" width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sliceCount" label="切片数量" width="120" align="center" />
        <el-table-column prop="skillCount" label="技能映射数" width="120" align="center" />
        <el-table-column prop="proposer" label="提交人" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="status" label="审批状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审批人" width="120" />
        <el-table-column prop="approvalTime" label="审批时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看详情</el-button>
            <el-button
              v-if="row.status === '待审批'"
              type="success"
              link
              size="small"
              @click="handleApprove(row)"
            >
              审批
            </el-button>
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="课程切片详情"
      width="900px"
    >
      <el-descriptions :column="2" border v-if="currentCourse">
        <el-descriptions-item label="课程名称">{{ currentCourse.courseName }}</el-descriptions-item>
        <el-descriptions-item label="课程分类">
          <el-tag :type="getCategoryType(currentCourse.category)">{{ currentCourse.category }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交人">{{ currentCourse.proposer }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentCourse.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag :type="getStatusType(currentCourse.status)">{{ currentCourse.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批人">{{ currentCourse.approver || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ currentCourse.approvalTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="课程描述" :span="2" v-if="currentCourse.description">
          <div class="course-description">{{ currentCourse.description }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="课程切片" :span="2">
          <div class="slice-list">
            <el-card
              v-for="(slice, index) in currentCourse.slices"
              :key="index"
              shadow="hover"
              class="slice-item"
            >
              <div class="slice-header">
                <span class="slice-title">切片 {{ index + 1 }}: {{ slice.name }}</span>
              </div>
              <div class="slice-skills">
                <span class="skills-label">映射技能：</span>
                <el-tag
                  v-for="(skill, skillIndex) in slice.skills"
                  :key="skillIndex"
                  type="info"
                  style="margin-right: 8px; margin-bottom: 8px"
                >
                  {{ getSkillName(skill) }}
                </el-tag>
              </div>
            </el-card>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approvalDialogVisible"
      title="课程切片审批"
      width="600px"
    >
      <el-form :model="approvalForm" :rules="approvalRules" ref="approvalFormRef" label-width="100px">
        <el-form-item label="课程名称">
          <el-input :value="currentCourse?.courseName" disabled />
        </el-form-item>
        <el-form-item label="审批结果" prop="result">
          <el-radio-group v-model="approvalForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="comment">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApproval">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const loading = ref(false)
const detailDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const approvalFormRef = ref(null)

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const courseList = ref([
  {
    id: 1,
    courseName: 'Java程序设计',
    category: '编程语言',
    sliceCount: 8,
    skillCount: 15,
    proposer: '张教授',
    submitTime: '2024-01-15 10:30:00',
    status: '待审批',
    approver: '',
    approvalTime: '',
    description: 'Java程序设计基础课程，涵盖Java语言基础、面向对象编程、集合框架等内容。',
    slices: [
      {
        name: 'Java基础语法',
        skills: ['java-basic', 'oop']
      },
      {
        name: '集合框架',
        skills: ['data-structure']
      },
      {
        name: '异常处理',
        skills: ['java-basic']
      }
    ]
  },
  {
    id: 2,
    courseName: 'Python数据分析',
    category: '编程语言',
    sliceCount: 6,
    skillCount: 12,
    proposer: '李老师',
    submitTime: '2024-01-14 15:20:00',
    status: '已通过',
    approver: '王主任',
    approvalTime: '2024-01-16 09:15:00',
    description: 'Python数据分析课程，学习使用Python进行数据处理和分析。',
    slices: [
      {
        name: 'NumPy基础',
        skills: ['data-structure']
      },
      {
        name: 'Pandas数据处理',
        skills: ['database-design']
      }
    ]
  },
  {
    id: 3,
    courseName: 'Vue.js前端开发',
    category: '前端开发',
    sliceCount: 10,
    skillCount: 18,
    proposer: '刘老师',
    submitTime: '2024-01-13 09:15:00',
    status: '已拒绝',
    approver: '王主任',
    approvalTime: '2024-01-14 14:30:00',
    description: 'Vue.js前端开发框架课程。',
    slices: [
      {
        name: 'Vue基础',
        skills: ['frontend-framework']
      }
    ]
  },
  {
    id: 4,
    courseName: 'MySQL数据库',
    category: '数据库',
    sliceCount: 5,
    skillCount: 10,
    proposer: '陈老师',
    submitTime: '2024-01-12 14:45:00',
    status: '待审批',
    approver: '',
    approvalTime: '',
    description: 'MySQL数据库管理与应用课程。',
    slices: [
      {
        name: 'SQL基础',
        skills: ['database-design']
      }
    ]
  }
])

const currentCourse = ref(null)

const approvalForm = ref({
  result: 'approved',
  comment: ''
})

const approvalRules = {
  result: [{ required: true, message: '请选择审批结果', trigger: 'change' }],
  comment: [{ required: true, message: '请输入审批意见', trigger: 'blur' }]
}

const skillOptions = ref([
  { label: 'Java基础', value: 'java-basic' },
  { label: '面向对象编程', value: 'oop' },
  { label: '数据结构与算法', value: 'data-structure' },
  { label: '数据库设计', value: 'database-design' },
  { label: '前端框架', value: 'frontend-framework' },
  { label: '后端开发', value: 'backend-dev' },
  { label: 'API设计', value: 'api-design' },
  { label: '系统架构', value: 'system-architecture' }
])

const getCategoryType = (category) => {
  const typeMap = {
    '编程语言': 'primary',
    '数据库': 'success',
    '前端开发': 'warning',
    '后端开发': 'info'
  }
  return typeMap[category] || ''
}

const getStatusType = (status) => {
  const typeMap = {
    '待审批': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger'
  }
  return typeMap[status] || ''
}

const getSkillName = (skillValue) => {
  const skill = skillOptions.value.find(s => s.value === skillValue)
  return skill ? skill.label : skillValue
}

const handleSearch = () => {
  // 搜索逻辑
  ElMessage.info('搜索功能待实现')
}

const handleView = (row) => {
  currentCourse.value = row
  detailDialogVisible.value = true
}

const handleApprove = (row) => {
  currentCourse.value = row
  approvalForm.value = {
    result: 'approved',
    comment: ''
  }
  approvalDialogVisible.value = true
}

const handleSubmitApproval = async () => {
  try {
    await approvalFormRef.value.validate()
    ElMessage.success('审批成功')
    approvalDialogVisible.value = false
    // 更新列表数据
    if (currentCourse.value) {
      currentCourse.value.status = approvalForm.value.result === 'approved' ? '已通过' : '已拒绝'
      currentCourse.value.approver = '当前用户'
      currentCourse.value.approvalTime = new Date().toLocaleString('zh-CN')
    }
  } catch (error) {
    // 验证失败，不处理
  }
}

const handleSizeChange = (size) => {
  pagination.value.size = size
}

const handlePageChange = (page) => {
  pagination.value.page = page
}
</script>

<style lang="scss" scoped>
.course-slice {
  .toolbar-card {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .course-description {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--text-regular);
  }

  .slice-list {
    .slice-item {
      margin-bottom: 16px;

      .slice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .slice-title {
          font-weight: 600;
          color: var(--text-primary);
        }
      }

      .slice-skills {
        .skills-label {
          color: var(--text-secondary);
          margin-right: 8px;
        }
      }
    }
  }
}
</style>
