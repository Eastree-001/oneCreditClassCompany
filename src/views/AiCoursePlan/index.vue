<template>
  <div class="ai-course-plan">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>AI课程计划管理</h2>
        <div class="profile-selector">
          <el-select
            v-model="selectedProfileId"
            placeholder="请选择岗位画像"
            style="width: 240px"
            :loading="profilesLoading"
            clearable
          >
            <el-option
              v-for="profile in profiles"
              :key="profile.id"
              :label="profile.name"
              :value="profile.id"
            />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 已加入计划的课程 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>已加入计划的课程 ({{ addedCourseCount }})</span>
        </div>
      </template>
      <el-table :data="addedCourses" stripe v-loading="loading">
        <el-table-column prop="courseName" label="课程名称" min-width="180" />
        <el-table-column prop="description" label="课程描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="匹配度" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.matchScore !== undefined" :type="getMatchTag(row.matchScore)">
              {{ row.matchScore }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalVideos" label="课时" width="80" align="center" />
        <el-table-column prop="difficultyLevel" label="难度" width="80" align="center">
          <template #default="{ row }">
            {{ getDifficultyText(row.difficultyLevel) }}
          </template>
        </el-table-column>
        <el-table-column label="匹配技能" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="(skill, index) in (row.matchedSkills || [])"
              :key="index"
              type="success"
              size="small"
              style="margin-right: 4px; margin-bottom: 4px"
            >
              {{ skill }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isApproved" type="success">已审批</el-tag>
            <el-tag v-else-if="row.addedToPlan" type="warning">待审批</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.isApproved"
              link
              type="primary"
              @click="handleSelectUniversity(row)"
            >
              选择高校
            </el-button>
            <el-button link type="danger" @click="handleRemoveCourse(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 选择高校对话框 -->
    <el-dialog
      v-model="universityDialogVisible"
      title="选择高校审批课程计划"
      width="500px"
    >
      <el-form :model="universityForm" :rules="universityRules" ref="universityFormRef" label-width="100px">
        <el-form-item label="选择高校" prop="universityId">
          <el-select
            v-model="universityForm.universityId"
            placeholder="请选择高校"
            style="width: 100%"
            filterable
            :loading="universitiesLoading"
          >
            <el-option
              v-for="uni in universities"
              :key="uni.id"
              :label="uni.name"
              :value="uni.id"
            />
          </el-select>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="universityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSelectUniversitySubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看计划对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="计划详情"
      width="800px"
    >
      <div v-if="currentPlan" class="plan-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="计划名称">{{ currentPlan.name }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentPlan.status)">
              {{ getStatusText(currentPlan.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDate(currentPlan.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="计划描述" :span="2">
            {{ currentPlan.description }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="course-section" v-if="currentPlan.courses && currentPlan.courses.length > 0">
          <h3>包含课程 ({{ currentPlan.courses.length }})</h3>
          <el-table :data="currentPlan.courses" stripe>
            <el-table-column prop="title" label="课程名称" min-width="180" />
            <el-table-column prop="description" label="课程描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="totalDuration" label="课时" width="100" align="center" />
            <el-table-column prop="difficultyLevel" label="难度" width="100" align="center">
              <template #default="{ row }">
                {{ getDifficultyText(row.difficultyLevel) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { courseMatchApi, userApi, aiCoursePlanApi } from '@/api'

const route = useRoute()

const loading = ref(false)
const addedCourses = ref([])
const detailDialogVisible = ref(false)
const universityDialogVisible = ref(false)
const universityFormRef = ref(null)
const currentPlan = ref(null)
const currentCourse = ref(null)
const submitting = ref(false)
const universities = ref([])
const universitiesLoading = ref(false)
const selectedProfileId = ref(null)
const profiles = ref([])
const profilesLoading = ref(false)

const universityForm = ref({
  universityId: ''
})

const universityRules = {
  universityId: [
    { required: true, message: '请选择高校', trigger: 'change' }
  ]
}

// 计算已加入计划的课程数量
const addedCourseCount = computed(() => addedCourses.value.length)

// 加载高校列表
const loadUniversities = async () => {
  try {
    universitiesLoading.value = true
    const result = await userApi.getUniversityList()
    console.log('=== 高校列表API响应 ===')
    console.log('完整响应:', result)

    let data = result
    if (result.data) {
      data = result.data
    }

    if (Array.isArray(data)) {
      universities.value = data
    } else if (data && Array.isArray(data.data)) {
      universities.value = data.data
    } else if (data && Array.isArray(data.list)) {
      universities.value = data.list
    } else {
      universities.value = []
    }
  } catch (error) {
    console.error('获取高校列表失败:', error)
    ElMessage.error('获取高校列表失败')
    universities.value = []
  } finally {
    universitiesLoading.value = false
  }
}

// 加载已加入计划的课程列表
const loadAddedCourses = async (profileId) => {
  try {
    console.log('=== 开始加载已加入计划的课程 ===')
    console.log('岗位画像ID:', profileId)

    if (!profileId) {
      console.log('未提供岗位画像ID，清空列表')
      addedCourses.value = []
      return
    }

    const params = { profileId }
    const result = await courseMatchApi.getAddedToPlan(params)
    console.log('=== 已加入计划课程API响应 ===')
    console.log('完整响应:', result)

    let data = result
    if (result.data) {
      data = result.data
    }

    console.log('处理后的数据类型:', typeof data)
    console.log('处理后的数据:', data)

    if (Array.isArray(data)) {
      addedCourses.value = data
      console.log(`✅ 加载到 ${data.length} 门已加入计划的课程`)
    } else if (data && Array.isArray(data.data)) {
      addedCourses.value = data.data
      console.log(`✅ 加载到 ${data.data.length} 门已加入计划的课程`)
    } else if (data && Array.isArray(data.list)) {
      addedCourses.value = data.list
      console.log(`✅ 加载到 ${data.list.length} 门已加入计划的课程`)
    } else {
      addedCourses.value = []
      console.log('⚠️ 数据格式不符合预期，设置为空数组')
    }
  } catch (error) {
    console.error('❌ 获取已加入计划课程失败:', error)
    ElMessage.error('获取已加入计划课程失败')
    addedCourses.value = []
  }
}

// 查看计划详情
const handleView = async (row) => {
  try {
    const result = await aiCoursePlanApi.getDetail(row.id)
    console.log('=== AI课程计划详情API响应 ===')
    console.log('完整响应:', result)

    let data = result
    if (result.data) {
      data = result.data
    }

    currentPlan.value = data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取AI课程计划详情失败:', error)
    ElMessage.error('获取AI课程计划详情失败')
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取匹配度标签类型
const getMatchTag = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'info'
}

// 移除课程
const handleRemoveCourse = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要移除"${row.courseName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用移除课程的接口
    await courseMatchApi.removeFromPlan({
      profileId: selectedProfileId.value,
      aiCourseId: row.courseId || row.id
    })

    ElMessage.success('移除成功')
    loadAddedCourses(selectedProfileId.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除失败:', error)
      ElMessage.error('移除失败')
    }
  }
}

// 选择高校
const handleSelectUniversity = (row) => {
  currentCourse.value = row
  universityForm.value = {
    universityId: ''
  }
  universityDialogVisible.value = true
}

// 提交选择高校
const handleSelectUniversitySubmit = async () => {
  if (!universityFormRef.value) return

  await universityFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        const aiCourseId = currentCourse.value.courseId || currentCourse.value.id

        await aiCoursePlanApi.selectUniversity(aiCourseId, {
          universityId: universityForm.value.universityId
        })

        ElMessage.success('已提交审批申请')
        universityDialogVisible.value = false
        loadAddedCourses(selectedProfileId.value)
      } catch (error) {
        console.error('选择高校失败:', error)
        const message = error.response?.data?.message || error.message || '选择高校失败'
        ElMessage.error(message)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    'ACTIVE': 'success',
    'INACTIVE': 'info',
    'COMPLETED': 'primary'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    'ACTIVE': '进行中',
    'INACTIVE': '未开始',
    'COMPLETED': '已完成'
  }
  return map[status] || status
}

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const map = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return map[difficulty] || difficulty
}

// 加载岗位画像列表
const loadProfiles = async () => {
  try {
    profilesLoading.value = true
    const result = await courseMatchApi.getProfiles()
    console.log('=== 岗位画像API响应 ===')
    console.log('完整响应:', result)

    if (result && Array.isArray(result.data)) {
      profiles.value = result.data
    } else if (result && Array.isArray(result)) {
      profiles.value = result
    } else if (result && Array.isArray(result.list)) {
      profiles.value = result.list
    } else {
      profiles.value = []
    }

    console.log('设置岗位画像列表成功:', profiles.value)
  } catch (error) {
    console.error('获取岗位画像失败:', error)
    ElMessage.error('获取岗位画像失败')
    profiles.value = []
  } finally {
    profilesLoading.value = false
  }
}

// 岗位画像选择变化处理
onMounted(() => {
  loadProfiles()
  loadUniversities()
})

// 监听岗位画像ID变化
watch(selectedProfileId, (newProfileId) => {
  console.log('岗位画像ID变化:', newProfileId)
  if (newProfileId) {
    loadAddedCourses(newProfileId)
  } else {
    addedCourses.value = []
  }
})

// 监听路由参数变化
watch(() => route.query.profileId, (newProfileId) => {
  if (newProfileId) {
    selectedProfileId.value = Number(newProfileId)
  }
})
</script>

<style lang="scss" scoped>
.ai-course-plan {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;

      h2 {
        margin: 0;
        font-size: 20px;
        color: var(--text-primary);
      }

      .profile-selector {
        display: flex;
        align-items: center;
      }
    }
  }

  .plan-detail {
    .course-section {
      margin-top: 24px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: var(--text-primary);
      }
    }
  }

  .card-header {
    font-weight: 600;
    font-size: 16px;
  }
}
</style>
