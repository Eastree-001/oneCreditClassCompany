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
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审批人" width="120" />
        <el-table-column prop="approvalTime" label="审批时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看详情</el-button>
            <el-button
              v-if="row.status === 'pending'"
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
      v-loading="detailLoading"
    >
      <el-descriptions :column="2" border v-if="currentCourse">
        <el-descriptions-item label="课程名称">{{ currentCourse.courseName }}</el-descriptions-item>
        <el-descriptions-item label="课程分类">
          <el-tag :type="getCategoryType(currentCourse.category)">{{ currentCourse.category }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交人">{{ currentCourse.proposer }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentCourse.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag :type="getStatusType(currentCourse.status)">{{ getStatusText(currentCourse.status) }}</el-tag>
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
                <el-tag type="primary" size="large">切片 {{ index + 1 }}</el-tag>
                <span class="slice-title">{{ slice.name }}</span>
              </div>
              <div class="slice-skills" v-if="slice.skills && slice.skills.length > 0">
                <div class="skills-label">映射技能：</div>
                <div class="skills-container">
                  <el-tag
                    v-for="(skill, skillIndex) in slice.skills"
                    :key="skillIndex"
                    type="info"
                    class="skill-tag"
                  >
                    {{ skill.name || skill.code || skill }}
                  </el-tag>
                </div>
              </div>
              <div v-else class="no-skills">
                <el-empty description="暂无映射技能" :image-size="60" />
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { courseSliceApi } from '@/api/university'

const searchKeyword = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const loading = ref(false)
const detailLoading = ref(false)
const detailDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const approvalFormRef = ref(null)

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const courseList = ref([])

// 加载课程切片列表
const loadCourseList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    if (filterStatus.value) {
      params.status = filterStatus.value
    }
    if (filterCategory.value) {
      params.category = filterCategory.value
    }

    const result = await courseSliceApi.getList(params)
    console.log('课程切片列表:', result)

    // 提取数据（支持嵌套 data 结构）
    const data = result.data?.data || result.data || result
    courseList.value = data.list || []
    pagination.value.total = data.total || 0
  } catch (error) {
    console.error('加载课程切片列表失败:', error)
    ElMessage.error('加载课程切片列表失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadCourseList()
})

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
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    '待审批': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待审批',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return textMap[status] || status
}

const getSkillName = (skillValue) => {
  const skill = skillOptions.value.find(s => s.value === skillValue)
  return skill ? skill.label : skillValue
}

const handleSearch = () => {
  pagination.value.page = 1
  loadCourseList()
}

const handleView = async (row) => {
  detailLoading.value = true
  detailDialogVisible.value = true
  try {
    const result = await courseSliceApi.getDetail(row.id)
    console.log('课程切片详情:', result)

    // 提取数据（支持嵌套 data 结构）
    const data = result.data?.data || result.data || result
    currentCourse.value = data
  } catch (error) {
    console.error('加载课程切片详情失败:', error)
    ElMessage.error('加载课程切片详情失败')
  } finally {
    detailLoading.value = false
  }
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

    // 调用审批API
    const approveData = {
      status: approvalForm.value.result,
      comment: approvalForm.value.comment
    }

    await courseSliceApi.approve(currentCourse.value.id, approveData)
    console.log('课程切片审批成功')

    ElMessage.success('审批成功')
    approvalDialogVisible.value = false

    // 重新加载列表
    loadCourseList()
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error(error.message || '审批失败')
  }
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  loadCourseList()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadCourseList()
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
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .slice-title {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
      }

      .slice-skills {
        .skills-label {
          color: var(--text-secondary);
          margin-bottom: 10px;
          font-size: 14px;
        }

        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .skill-tag {
            padding: 8px 16px;
            font-size: 14px;
          }
        }
      }

      .no-skills {
        padding: 20px 0;
      }
    }
  }
}
</style>
