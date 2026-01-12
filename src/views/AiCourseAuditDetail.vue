<template>
  <div class="ai-course-audit-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2>{{ isAuditMode ? '审批课程' : '课程详情' }}</h2>
    </div>

    <div v-loading="loading">
      <!-- 课程基本信息 -->
      <el-card shadow="hover" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>课程基本信息</span>
            <el-tag v-if="auditDetail" :type="getStatusType(auditDetail.auditStatus)">
              {{ getStatusText(auditDetail.auditStatus) }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border v-if="auditDetail">
          <el-descriptions-item label="课程名称" :span="2">
            {{ auditDetail.title }}
          </el-descriptions-item>
          <el-descriptions-item label="课程描述" :span="2">
            {{ auditDetail.description }}
          </el-descriptions-item>
          <el-descriptions-item label="目标经验">
            {{ auditDetail.targetExperience }}
          </el-descriptions-item>
          <el-descriptions-item label="目标学历">
            {{ getEducationText(auditDetail.targetEducation) }}
          </el-descriptions-item>
          <el-descriptions-item label="总视频数">
            {{ auditDetail.totalVideos }}
          </el-descriptions-item>
          <el-descriptions-item label="总时长(分钟)">
            {{ auditDetail.totalDuration }}
          </el-descriptions-item>
          <el-descriptions-item label="难度等级">
            {{ auditDetail.difficultyLevel }}
          </el-descriptions-item>
          <el-descriptions-item label="预计完成天数">
            {{ auditDetail.estimatedCompletionDays }} 天
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDate(auditDetail.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="审批时间">
            {{ formatDate(auditDetail.auditedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 目标技能 -->
      <el-card shadow="hover" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>目标技能</span>
          </div>
        </template>
        <div v-if="auditDetail && targetSkills.length > 0" class="skills-container">
          <el-tag
            v-for="(skill, index) in targetSkills"
            :key="index"
            type="success"
            size="large"
            style="margin-right: 12px; margin-bottom: 12px"
          >
            {{ skill }}
          </el-tag>
        </div>
        <el-empty v-else description="暂无目标技能" />
      </el-card>

      <!-- 课程大纲 -->
      <el-card shadow="hover" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>课程大纲 ({{ syllabusItems.length }}章)</span>
          </div>
        </template>
        <el-timeline v-if="syllabusItems.length > 0">
          <el-timeline-item
            v-for="(item, index) in syllabusItems"
            :key="item.id"
            :timestamp="`第${item.chapter}章`"
            placement="top"
            :type="getTimelineType(index)"
          >
            <el-card shadow="never" class="syllabus-card">
              <h4>{{ item.title }}</h4>
              <p class="content">{{ item.content }}</p>
              <div class="meta">
                <span class="sort-order">排序: {{ item.sortOrder }}</span>
                <span class="created-at">创建时间: {{ formatDate(item.createdAt) }}</span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无课程大纲" />
      </el-card>

      <!-- 审批信息 -->
      <el-card shadow="hover" style="margin-top: 20px" v-if="auditDetail && auditDetail.auditorName">
        <template #header>
          <div class="card-header">
            <span>审批信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="审批人">
            {{ auditDetail.auditorName }}
          </el-descriptions-item>
          <el-descriptions-item label="审批时间">
            {{ formatDate(auditDetail.auditedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="审批总分">
            {{ auditDetail.auditScore }}
          </el-descriptions-item>
          <el-descriptions-item label="质量评分">
            {{ auditDetail.qualityScore }}
          </el-descriptions-item>
          <el-descriptions-item label="相关性评分">
            {{ auditDetail.relevanceScore }}
          </el-descriptions-item>
          <el-descriptions-item label="适宜性评分">
            {{ auditDetail.appropriatenessScore }}
          </el-descriptions-item>
          <el-descriptions-item label="审批意见" :span="2">
            {{ auditDetail.auditComments || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="修改建议" :span="2">
            {{ auditDetail.suggestedChanges || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="是否公开">
            <el-tag :type="auditDetail.isPublic ? 'success' : 'info'">
              {{ auditDetail.isPublic ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="有效期天数">
            {{ auditDetail.auditDurationDays || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 审批表单 -->
      <el-card shadow="hover" style="margin-top: 20px" v-if="isAuditMode">
        <template #header>
          <div class="card-header">
            <span>提交审批</span>
          </div>
        </template>
        <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="120px">
          <el-form-item label="审批结果" prop="result">
            <el-radio-group v-model="auditForm.result">
              <el-radio label="approved">通过</el-radio>
              <el-radio label="rejected">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="审批总分" prop="auditScore">
            <el-input-number
              v-model="auditForm.auditScore"
              :min="0"
              :max="10"
              :step="0.1"
              :precision="1"
            />
            <span style="margin-left: 8px; color: #909399">0-10分</span>
          </el-form-item>

          <el-form-item label="质量评分" prop="qualityScore">
            <el-input-number
              v-model="auditForm.qualityScore"
              :min="0"
              :max="10"
              :step="0.1"
              :precision="1"
            />
            <span style="margin-left: 8px; color: #909399">0-10分</span>
          </el-form-item>

          <el-form-item label="相关性评分" prop="relevanceScore">
            <el-input-number
              v-model="auditForm.relevanceScore"
              :min="0"
              :max="10"
              :step="0.1"
              :precision="1"
            />
            <span style="margin-left: 8px; color: #909399">0-10分</span>
          </el-form-item>

          <el-form-item label="适宜性评分" prop="appropriatenessScore">
            <el-input-number
              v-model="auditForm.appropriatenessScore"
              :min="0"
              :max="10"
              :step="0.1"
              :precision="1"
            />
            <span style="margin-left: 8px; color: #909399">0-10分</span>
          </el-form-item>

          <el-form-item label="审批意见" prop="auditComments">
            <el-input
              v-model="auditForm.auditComments"
              type="textarea"
              :rows="4"
              placeholder="请输入审批意见"
            />
          </el-form-item>

          <el-form-item label="修改建议" prop="suggestedChanges">
            <el-input
              v-model="auditForm.suggestedChanges"
              type="textarea"
              :rows="4"
              placeholder="请输入修改建议（可选）"
            />
          </el-form-item>

          <el-form-item label="有效期天数" prop="auditDurationDays">
            <el-input-number
              v-model="auditForm.auditDurationDays"
              :min="0"
              :max="3650"
            />
            <span style="margin-left: 8px; color: #909399">天</span>
          </el-form-item>

          <el-form-item label="是否公开" prop="isPublic">
            <el-switch v-model="auditForm.isPublic" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmitAudit" :loading="submitting">
              提交审批
            </el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { universityAiCourseAuditApi } from '@/api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const auditDetail = ref(null)
const auditFormRef = ref(null)

const auditForm = ref({
  result: 'approved',
  auditScore: 0,
  qualityScore: 0,
  relevanceScore: 0,
  appropriatenessScore: 0,
  auditComments: '',
  suggestedChanges: '',
  auditDurationDays: 365,
  isPublic: true,
  metadata: '{}'
})

const auditRules = {
  result: [
    { required: true, message: '请选择审批结果', trigger: 'change' }
  ],
  auditScore: [
    { required: true, message: '请输入审批总分', trigger: 'blur' }
  ],
  auditComments: [
    { required: true, message: '请输入审批意见', trigger: 'blur' }
  ]
}

// 判断是否为审批模式
const isAuditMode = computed(() => route.query.mode === 'audit')

// 目标技能列表
const targetSkills = computed(() => {
  if (!auditDetail.value || !auditDetail.value.targetSkills) return []
  try {
    return JSON.parse(auditDetail.value.targetSkills)
  } catch (e) {
    return []
  }
})

// 课程大纲
const syllabusItems = computed(() => {
  return auditDetail.value?.syllabusItems || []
})

// 加载审批详情
const loadAuditDetail = async () => {
  const auditId = route.query.auditId
  if (!auditId) {
    ElMessage.error('缺少审批ID')
    router.back()
    return
  }

  try {
    loading.value = true
    const result = await universityAiCourseAuditApi.getDetail(auditId)

    if (result && result.data) {
      auditDetail.value = result.data
    }
  } catch (error) {
    console.error('获取审批详情失败:', error)
    ElMessage.error('获取审批详情失败')
  } finally {
    loading.value = false
  }
}

// 提交审批
const handleSubmitAudit = async () => {
  if (!auditFormRef.value) return

  await auditFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await ElMessageBox.confirm('确定提交审批结果吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        submitting.value = true
        const auditId = route.query.auditId

        await universityAiCourseAuditApi.approve(auditId, auditForm.value)

        ElMessage.success('审批提交成功')
        router.back()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('提交审批失败:', error)
          ElMessage.error('提交审批失败')
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取学历文本
const getEducationText = (education) => {
  const map = {
    'bachelor': '本科',
    'master': '硕士',
    'doctor': '博士',
    'college': '专科'
  }
  return map[education] || education
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    'pending': '待审批',
    'approved': '已通过',
    'rejected': '已拒绝'
  }
  return map[status] || status
}

// 获取时间轴类型
const getTimelineType = (index) => {
  const types = ['primary', 'success', 'warning', 'danger', 'info']
  return types[index % types.length]
}

onMounted(() => {
  loadAuditDetail()
})
</script>

<style lang="scss" scoped>
.ai-course-audit-detail {
  .page-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      color: var(--text-primary);
    }
  }

  .card-header {
    font-weight: 600;
    font-size: 16px;
  }

  .skills-container {
    padding: 8px 0;
  }

  .syllabus-card {
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: var(--text-primary);
    }

    .content {
      margin: 0 0 12px 0;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .meta {
      display: flex;
      gap: 24px;
      font-size: 12px;
      color: var(--text-secondary);

      .sort-order,
      .created-at {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
