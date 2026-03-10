<template>
  <div class="course-match">
    <!-- 500错误状态提示 -->
    <el-alert
      v-if="hasServerError"
      title="服务器内部错误"
      type="error"
      :description="serverErrorInfo.message || '服务器发生内部错误'"
      show-icon
      closable
      @close="clearServerError"
      style="margin-bottom: 20px"
    >
      <template #default>
        <div>
          <p>当前遇到的服务器错误：</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>接口：{{ serverErrorInfo.url }}</li>
            <li>错误码：{{ serverErrorInfo.status }}</li>
            <li>时间：{{ serverErrorInfo.timestamp }}</li>
          </ul>
        </div>
      </template>
    </el-alert>

    <!-- 匹配概览卡片 -->
    <el-row :gutter="20" class="overview-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in matchStats" :key="stat.label">
        <el-card class="stat-card card-hover" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 左侧：岗位选择和匹配结果 -->
      <el-col :xs="24" :md="16">
        <el-card class="match-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>课程匹配</span>
              <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新匹配</el-button>
            </div>
          </template>

          <!-- 岗位选择 -->
          <el-form :inline="true" class="search-form">
            <el-form-item label="选择岗位画像">
              <el-select
                v-model="selectedProfileId"
                placeholder="请选择岗位画像"
                style="width: 300px"
                @change="handleProfileChange"
              >
                <el-option
                  v-for="profile in profileList"
                  :key="profile.id"
                  :label="profile.name"
                  :value="profile.id"
                />
              </el-select>
            </el-form-item>
          </el-form>

          <!-- 匹配结果 -->
          <div v-if="selectedProfile" class="profile-info">
            <el-card shadow="never" class="profile-card">
              <div class="profile-header">
                <h3>{{ selectedProfile.name }}</h3>
                <el-tag :type="getTypeTag(selectedProfile.type)">
                  {{ getTypeName(selectedProfile.type) }}
                </el-tag>
              </div>
              <div class="profile-skills">
                <span class="label">技能要求：</span>
                <el-tag
                  v-for="(skill, index) in selectedProfile.skills"
                  :key="index"
                  size="small"
                  style="margin-right: 8px; margin-bottom: 4px"
                >
                  {{ typeof skill === 'object' ? skill.name : skill }}
                </el-tag>
              </div>
            </el-card>
          </div>


          <!-- AI课程列表（根据岗位画像获取的匹配课程 或 未选择岗位画像时显示所有课程） -->
          <div v-if="aiCourses.length > 0" class="ai-courses-list">
            <div class="results-header">
              <h4>{{ selectedProfile ? `匹配到 ${aiCourses.length} 门相关课程` : `共 ${aiCourses.length} 门AI课程` }}</h4>
              <el-radio-group v-model="sortType" size="small" @change="handleSortChange">
                <el-radio-button label="match">匹配度</el-radio-button>
              </el-radio-group>
            </div>
            <div class="course-list">
              <el-card
                v-for="course in sortedAiCourses"
                :key="course.id"
                class="course-card card-hover"
                shadow="hover"
              >
                <div class="course-header">
                  <div class="course-title">
                    <h4>{{ course.title || course.name }}</h4>
                    <el-tag v-if="course.matchScore !== undefined" :type="getMatchTag(course.matchScore)">
                      匹配度 {{ course.matchScore }}%
                    </el-tag>
                    <el-tag v-else :type="getStatusTag(course.courseStatus)">
                      {{ getStatusText(course.courseStatus) }}
                    </el-tag>
                  </div>
                </div>
                <div class="course-info">
                  <div class="info-item" v-if="course.totalDuration">
                    <el-icon><Clock /></el-icon>
                    <span>{{ course.totalDuration }}小时</span>
                  </div>
                  <div class="info-item" v-else-if="course.duration">
                    <el-icon><Clock /></el-icon>
                    <span>{{ course.duration }}课时</span>
                  </div>
                  <div class="info-item" v-if="course.totalVideos">
                    <el-icon><Document /></el-icon>
                    <span>{{ course.totalVideos }}课时</span>
                  </div>
                  <div class="info-item" v-if="course.estimatedDays">
                    <el-icon><Clock /></el-icon>
                    <span>预计学习 {{ course.estimatedDays }} 天</span>
                  </div>
                  <div class="info-item" v-if="course.difficultyLevel">
                    <el-icon><Star /></el-icon>
                    <span>{{ getDifficultyText(course.difficultyLevel) }}</span>
                  </div>
                  <div class="info-item" v-if="course.school">
                    <el-icon><School /></el-icon>
                    <span>{{ course.school }}</span>
                  </div>
                  <div class="info-item" v-if="course.teacher">
                    <el-icon><User /></el-icon>
                    <span>{{ course.teacher }}</span>
                  </div>
                </div>
                <div class="course-description">{{ course.description }}</div>
                <div class="course-reason" v-if="course.reason">
                  <span class="label">匹配理由：</span>
                  <span>{{ course.reason }}</span>
                </div>
                <div class="course-skills">
                  <span class="label">匹配技能：</span>
                  <el-tag
                    v-if="course.matchedSkills && course.matchedSkills.length > 0"
                    v-for="(skill, index) in course.matchedSkills"
                    :key="`matched-${index}`"
                    type="success"
                    size="small"
                    style="margin-right: 8px; margin-bottom: 4px"
                  >
                    {{ skill }}
                  </el-tag>
                  <el-tag
                    v-if="course.unmatchedSkills && course.unmatchedSkills.length > 0"
                    v-for="(skill, index) in course.unmatchedSkills"
                    :key="`unmatched-${index}`"
                    type="warning"
                    size="small"
                    style="margin-right: 8px; margin-bottom: 4px"
                  >
                    {{ skill }}
                  </el-tag>
                </div>
                <div class="course-actions">
                  <el-button type="primary" link @click="viewAiCourseDetail(course)">
                    查看详情
                  </el-button>
                  <el-button
                    v-if="course.addedToPlan"
                    type="success"
                    link
                    disabled
                  >
                    <el-icon><Check /></el-icon>
                    已加入
                  </el-button>
                  <el-button
                    v-else
                    type="primary"
                    link
                    @click="addToPlan(course)"
                    :loading="course.loading"
                  >
                    加入计划
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>

          <el-empty v-if="aiCourses.length === 0 && selectedProfile" description="该岗位画像暂无匹配课程" />
        </el-card>
      </el-col>

      <!-- 右侧：优化建议 -->
      <el-col :xs="24" :md="8">
        <el-card class="suggestion-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>优化建议</span>
            </div>
          </template>

          <div v-if="suggestions.length > 0" class="suggestions">
            <el-timeline>
              <el-timeline-item
                v-for="(suggestion, index) in suggestions"
                :key="index"
                :timestamp="suggestion.type"
                placement="top"
              >
                <el-card class="suggestion-item">
                  <h5>{{ suggestion.title }}</h5>
                  <p>{{ suggestion.content }}</p>
                  <div v-if="suggestion.actions" class="suggestion-actions">
                    <el-button
                      v-for="action in suggestion.actions"
                      :key="action.label"
                      type="primary"
                      link
                      size="small"
                      @click="handleSuggestionAction(action)"
                    >
                      {{ action.label }}
                    </el-button>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-empty v-else description="暂无优化建议" :image-size="100" />
        </el-card>

        <!-- 匹配度分析 -->
        <el-card class="analysis-card" shadow="hover" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <span>匹配度分析</span>
            </div>
          </template>
          <div ref="matchChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentCourse?.title || '课程详情'"
      width="700px"
    >
      <div v-if="currentCourse" class="course-detail">
        <div class="detail-section">
          <h4>课程信息</h4>
          <div class="detail-info">
            <div class="info-row" v-if="currentCourse.totalDuration">
              <span class="label">课程时长：</span>
              <span>{{ currentCourse.totalDuration }}小时</span>
            </div>
            <div class="info-row" v-if="currentCourse.totalVideos">
              <span class="label">课时数量：</span>
              <span>{{ currentCourse.totalVideos }}课时</span>
            </div>
            <div class="info-row" v-if="currentCourse.estimatedCompletionDays || currentCourse.estimatedDays">
              <span class="label">预计学习：</span>
              <span>{{ currentCourse.estimatedCompletionDays || currentCourse.estimatedDays }}天</span>
            </div>
            <div class="info-row" v-if="currentCourse.difficultyLevel">
              <span class="label">难度等级：</span>
              <el-tag :type="getDifficultyTag(currentCourse.difficultyLevel)">
                {{ getDifficultyText(currentCourse.difficultyLevel) }}
              </el-tag>
            </div>
            <div class="info-row" v-if="currentCourse.targetExperience">
              <span class="label">适合经验：</span>
              <span>{{ currentCourse.targetExperience }}</span>
            </div>
            <div class="info-row" v-if="currentCourse.targetEducation">
              <span class="label">适合学历：</span>
              <span>{{ getEducationText(currentCourse.targetEducation) }}</span>
            </div>
            <div class="info-row" v-if="currentCourse.matchScore">
              <span class="label">匹配度：</span>
              <el-tag :type="getMatchTag(currentCourse.matchScore)">
                {{ currentCourse.matchScore }}%
              </el-tag>
            </div>
            <div class="info-row" v-if="currentCourse.matchLevel">
              <span class="label">匹配等级：</span>
              <span>{{ getMatchLevelText(currentCourse.matchLevel) }}</span>
            </div>
            <div class="info-row" v-if="currentCourse.courseStatus">
              <span class="label">课程状态：</span>
              <el-tag :type="getStatusTag(currentCourse.courseStatus)">
                {{ getStatusText(currentCourse.courseStatus) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="currentCourse.description">
          <h4>课程描述</h4>
          <p class="description">{{ currentCourse.description }}</p>
        </div>

        <div class="detail-section" v-if="currentCourse.targetSkills">
          <h4>目标技能</h4>
          <div class="skills">
            <el-tag
              v-for="(skill, index) in parseTargetSkills(currentCourse.targetSkills)"
              :key="`target-${index}`"
              type="primary"
              size="small"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ skill }}
            </el-tag>
          </div>
        </div>

        <div class="detail-section" v-if="currentCourse.reason">
          <h4>匹配理由</h4>
          <p class="description">{{ currentCourse.reason }}</p>
        </div>

        <div class="detail-section" v-if="currentCourse.matchedSkills && currentCourse.matchedSkills.length > 0">
          <h4>匹配技能</h4>
          <div class="skills">
            <el-tag
              v-for="(skill, index) in currentCourse.matchedSkills"
              :key="`matched-${index}`"
              type="success"
              size="small"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ skill }}
            </el-tag>
          </div>
        </div>

        <div class="detail-section" v-if="currentCourse.unmatchedSkills && currentCourse.unmatchedSkills.length > 0">
          <h4>未匹配技能</h4>
          <div class="skills">
            <el-tag
              v-for="(skill, index) in currentCourse.unmatchedSkills"
              :key="`unmatched-${index}`"
              type="warning"
              size="small"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ skill }}
            </el-tag>
          </div>
        </div>

        <div class="detail-section" v-if="currentCourse.syllabusItems && currentCourse.syllabusItems.length > 0">
          <h4>课程章节</h4>
          <el-collapse accordion>
            <el-collapse-item
              v-for="(chapter, index) in currentCourse.syllabusItems"
              :key="chapter.id || index"
              :name="index"
            >
              <template #title>
                <div class="chapter-title-wrapper">
                  <el-icon><VideoPlay /></el-icon>
                  <span class="chapter-title">
                    第{{ chapter.chapter || index + 1 }}章：{{ chapter.title || '未命名章节' }}
                  </span>
                  <el-tag v-if="chapter.videoId" size="small" type="success" style="margin-left: 12px">
                    视频ID: {{ chapter.videoId }}
                  </el-tag>
                </div>
              </template>

              <div v-if="chapter.content" class="chapter-content">
                {{ chapter.content }}
              </div>

              <div v-if="chapter.description" class="chapter-description">
                {{ chapter.description }}
              </div>

              <div class="chapter-meta">
                <el-tag size="small" type="info">
                  <el-icon style="margin-right: 4px"><Sort /></el-icon>
                  排序: {{ chapter.sortOrder || index + 1 }}
                </el-tag>
                <el-tag v-if="chapter.createdAt" size="small" type="info">
                  创建时间: {{ formatDate(chapter.createdAt) }}
                </el-tag>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div v-else class="detail-section">
          <el-empty description="暂无课程章节内容" :image-size="100" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { Refresh, School, User, Clock, Document, Star, VideoPlay, Sort, Check } from '@element-plus/icons-vue'
import { courseMatchApi } from '@/api'

const route = useRoute()
const router = useRouter()

const selectedProfileId = ref(null)
const sortType = ref('match')
const matchChartRef = ref(null)
const aiCourses = ref([])
const detailDialogVisible = ref(false)
const currentCourse = ref(null)

const matchStats = ref([
  { label: '总匹配数', value: '156', icon: 'Connection', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: '高匹配度', value: '45', icon: 'CircleCheck', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { label: '中等匹配', value: '68', icon: 'DocumentAdd', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: '低匹配度', value: '43', icon: 'Clock', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
])

const profileList = ref([])

const selectedProfile = computed(() => {
  return profileList.value.find(p => p.id === selectedProfileId.value)
})

const sortedAiCourses = computed(() => {
  const courses = [...aiCourses.value]
  return courses.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
})

const suggestions = ref([])

// 加载课程匹配统计数据（页面初始化时调用）
const loadMatchStats = async () => {
  console.log('=== 开始获取课程匹配统计数据 ===')

  try {
    const result = await courseMatchApi.getStats()
    console.log('=== 课程匹配统计API响应 ===')
    console.log('完整响应:', result)

    // 处理响应数据
    let data = result
    if (result.data) {
      data = result.data
    }

    console.log('=== 处理后的统计数据 ===')
    console.log('数据内容:', data)

    // 更新统计信息
    if (data && data.stats) {
      if (data.stats.total !== undefined) {
        matchStats.value[0].value = data.stats.total.toString()
      }
      if (data.stats.highMatch !== undefined) {
        matchStats.value[1].value = data.stats.highMatch.toString()
      }
      if (data.stats.mediumMatch !== undefined) {
        matchStats.value[2].value = data.stats.mediumMatch.toString()
      }
      if (data.stats.lowMatch !== undefined) {
        matchStats.value[3].value = data.stats.lowMatch.toString()
      }
      console.log('统计数据更新成功')
    } else {
      console.warn('统计数据格式不正确:', data)
    }

  } catch (error) {
    console.error('=== 获取课程匹配统计数据失败 ===')
    console.error('错误信息:', error)
    ElMessage.error('获取统计数据失败，请检查后端服务')
  }
}

// 解析技能字符串（将JSON字符串转为数组）
const parseSkills = (skillsStr) => {
  if (!skillsStr) return []
  if (typeof skillsStr === 'string') {
    try {
      const parsed = JSON.parse(skillsStr)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      // 如果不是JSON格式，按逗号分隔
      return skillsStr.split(',').map(s => s.trim()).filter(s => s)
    }
  }
  if (Array.isArray(skillsStr)) {
    return skillsStr
  }
  return []
}

// 获取课程状态标签类型
const getStatusTag = (status) => {
  const tagMap = {
    'PUBLISHED': 'success',
    'DRAFT': 'info',
    'ARCHIVED': 'warning'
  }
  return tagMap[status] || 'info'
}

// 获取课程状态文本
const getStatusText = (status) => {
  const textMap = {
    'PUBLISHED': '已发布',
    'DRAFT': '草稿',
    'ARCHIVED': '已归档'
  }
  return textMap[status] || status
}

// 获取难度等级文本
const getDifficultyText = (difficulty) => {
  const textMap = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return textMap[difficulty] || difficulty
}

// 查看 AI 课程详情
const viewAiCourseDetail = async (course) => {
  console.log('=== 查看课程详情 ===')
  console.log('课程ID:', course.id || course.courseId)
  console.log('岗位画像ID:', selectedProfileId.value)

  try {
    // 调用API获取课程的详细内容(包含章节和视频)
    const result = await courseMatchApi.getAiCoursesBySkillProfile(selectedProfileId.value)

    console.log('=== 课程详情API响应 ===')
    console.log('完整响应:', result)

    // 处理响应数据
    let data = result
    if (result.data) {
      data = result.data
    }

    console.log('=== 处理后的课程数据 ===')
    console.log('数据类型:', typeof data)
    console.log('数据内容:', data)

    // 查找当前课程的详细信息
    let courseDetail = null
    if (Array.isArray(data)) {
      courseDetail = data.find(c => c.id === course.id || c.id === course.courseId)
    } else if (data && Array.isArray(data.data)) {
      courseDetail = data.data.find(c => c.id === course.id || c.id === course.courseId)
    }

    if (courseDetail) {
      console.log('找到课程详情:', courseDetail)

      // 格式化课程数据以适配详情弹窗
      currentCourse.value = {
        ...course,
        ...courseDetail,
        // 确保有必要的字段
        title: courseDetail.title || course.title || course.name || course.courseTitle,
        totalDuration: courseDetail.totalDuration || course.totalDuration || course.duration,
        totalVideos: courseDetail.totalVideos || course.totalVideos || course.duration,
        difficultyLevel: courseDetail.difficultyLevel || course.difficultyLevel || 'intermediate',
        courseStatus: courseDetail.courseStatus || course.courseStatus || 'PUBLISHED',
        // 新接口返回的详细字段
        targetSkills: courseDetail.targetSkills,
        targetExperience: courseDetail.targetExperience,
        targetEducation: courseDetail.targetEducation,
        estimatedCompletionDays: courseDetail.estimatedCompletionDays || courseDetail.estimatedDays,
        syllabusItems: courseDetail.syllabusItems || [],
        // 匹配相关字段
        matchLevel: course.matchLevel,
        matchedSkills: course.matchedSkills || [],
        unmatchedSkills: course.unmatchedSkills || [],
        reason: course.reason,
        matchScore: course.matchScore
      }
      detailDialogVisible.value = true
    } else {
      console.warn('未找到课程详情,使用基本信息')
      // 如果没有找到详细信息,使用原有数据
      currentCourse.value = {
        ...course,
        title: course.title || course.name || course.courseTitle,
        totalDuration: course.totalDuration || course.duration,
        totalVideos: course.totalVideos || course.duration,
        difficultyLevel: course.difficultyLevel || 'intermediate',
        courseStatus: course.courseStatus || 'PUBLISHED',
        matchLevel: course.matchLevel,
        matchedSkills: course.matchedSkills || [],
        unmatchedSkills: course.unmatchedSkills || [],
        reason: course.reason,
        estimatedDays: course.estimatedDays
      }
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error('=== 获取课程详情失败 ===')
    console.error('错误信息:', error)
    console.error('错误状态码:', error.response?.status)
    console.error('错误响应数据:', error.response?.data)

    // 如果是401错误,不显示详情弹窗(已经在request.js中处理了跳转)
    if (error.response?.status === 401) {
      console.error('认证失败,token已过期')
      return
    }

    // 如果API调用失败,使用原有数据显示
    console.log('降级使用基本信息显示课程详情')
    ElMessage.warning('获取完整课程详情失败,显示基本信息')

    currentCourse.value = {
      ...course,
      title: course.title || course.name || course.courseTitle,
      totalDuration: course.totalDuration || course.duration,
      totalVideos: course.totalVideos || course.duration,
      difficultyLevel: course.difficultyLevel || 'intermediate',
      courseStatus: course.courseStatus || 'PUBLISHED',
      matchLevel: course.matchLevel,
      matchedSkills: course.matchedSkills || [],
      unmatchedSkills: course.unmatchedSkills || [],
      reason: course.reason,
      estimatedDays: course.estimatedDays
    }
    detailDialogVisible.value = true
  }
}

// 服务器错误状态管理
const hasServerError = ref(false)
const serverErrorInfo = ref({
  url: '',
  status: '',
  message: '',
  timestamp: ''
})

// 清除服务器错误状态
const clearServerError = () => {
  hasServerError.value = false
  serverErrorInfo.value = {
    url: '',
    status: '',
    message: '',
    timestamp: ''
  }
}

// 记录服务器错误
const recordServerError = (error, url) => {
  hasServerError.value = true
  serverErrorInfo.value = {
    url: url || error.config?.url || '未知',
    status: error.response?.status || '未知',
    message: error.response?.data?.message || error.message || '服务器内部错误',
    timestamp: new Date().toLocaleString()
  }
}

onMounted(() => {
  loadProfiles()
  loadMatchStats()

  const profileId = route.query.profileId
  if (profileId) {
    // 先设置profileId
    selectedProfileId.value = parseInt(profileId)
    // 等待profiles加载完成后再处理匹配
    // 使用watch来监听profileList的变化
    watch(profileList, (newList) => {
      if (newList && newList.length > 0 && selectedProfileId.value) {
        // 确保profile已加载且选中了有效ID
        const profile = newList.find(p => p.id === selectedProfileId.value)
        if (profile) {
          console.log('岗位画像列表加载完成，开始匹配课程')
          handleProfileChange()
        }
      }
    }, { immediate: true })
  }

  nextTick(() => {
    initMatchChart()
  })
})

const loadProfiles = async () => {
  console.log('=== 开始加载岗位画像列表 ===')

  try {
    const result = await courseMatchApi.getProfiles()
    console.log('=== 岗位画像API响应 ===')
    console.log('完整响应:', result)

    // 处理不同的响应格式
    let data = result
    if (result.data) {
      data = result.data
    }

    console.log('=== 处理后的岗位画像数据 ===')
    console.log('数据类型:', typeof data)
    console.log('数据内容:', data)

    // 设置岗位画像列表
    if (data && (Array.isArray(data.profiles) || Array.isArray(data.list) || Array.isArray(data))) {
      profileList.value = data.profiles || data.list || data || []
      console.log('设置岗位画像列表成功:', profileList.value)

      // 数据格式化，确保必要字段存在
      profileList.value = profileList.value.map(profile => ({
        id: profile.id || profile.profileId,
        name: profile.name || profile.profileName || profile.title,
        type: profile.type || 'tech',
        skills: profile.skills || profile.skillRequirements || [],
        ...profile
      }))

      console.log('格式化后的岗位画像列表:', profileList.value)
    } else {
      console.warn('岗位画像数据格式不正确:', data)
      ElMessage.warning('岗位画像数据格式异常，请检查后端API')
      // 不使用模拟数据，保持空状态
      profileList.value = []
    }

  } catch (error) {
    console.error('=== 获取岗位画像失败 ===')
    console.error('错误信息:', error)
    ElMessage.error('获取岗位画像失败，请检查后端服务')

    // 不使用模拟数据，保持空状态
    profileList.value = []
  }
}

const handleProfileChange = async () => {
  console.log('=== handleProfileChange 开始 ===')
  console.log('selectedProfileId:', selectedProfileId.value)

  if (!selectedProfileId.value) {
    suggestions.value = []
    aiCourses.value = []
    // 清空图表
    updateMatchChart()
    return
  }

  console.log('=== 开始获取匹配结果 ===')
  console.log('选择的岗位画像ID:', selectedProfileId.value)
  console.log('选择的岗位画像:', selectedProfile.value)

  try {
    // 首先尝试获取已有的匹配结果
    console.log('🔄 调用获取匹配结果接口')
    const result = await courseMatchApi.getResults({ profileId: selectedProfileId.value })

    console.log('=== 匹配结果API响应 ===')
    console.log('完整响应:', result)

    // 处理响应数据
    let data = result
    if (result.data) {
      data = result.data
    }

    console.log('=== 处理后的匹配数据 ===')
    console.log('数据类型:', typeof data)
    console.log('数据内容:', data)

    // 根据接口文档处理返回数据
    if (data && data.matches && Array.isArray(data.matches)) {
      // 格式化课程数据
      aiCourses.value = data.matches.map(course => {
        console.log('=== 映射课程数据 ===')
        console.log('原始课程数据:', course)
        const mappedCourse = {
          id: course.id,
          courseId: course.courseId,
          aiCourseId: course.courseId,  // 使用 courseId 作为 aiCourseId
          name: course.courseName,
          title: course.courseName,
          description: course.description,
          matchScore: course.matchScore,
          matchedSkills: course.matchedSkills || [],
          unmatchedSkills: course.unmatchedSkills || [],
          reason: course.reason,
          totalVideos: course.totalVideos,
          difficultyLevel: course.difficultyLevel,
          addedToPlan: Boolean(course.addedToPlan),
          isApproved: Boolean(course.isApproved)
        }
        console.log('映射后的课程:', mappedCourse)
        return mappedCourse
      })
      console.log(`✅ 获取到 ${data.matches.length} 门匹配课程`)

      // 更新统计信息
      if (data.stats) {
        if (data.stats.total !== undefined) {
          matchStats.value[0].value = data.stats.total.toString()
        }
        if (data.stats.highMatch !== undefined) {
          matchStats.value[1].value = data.stats.highMatch.toString()
        }
        if (data.stats.mediumMatch !== undefined) {
          matchStats.value[2].value = data.stats.mediumMatch.toString()
        }
        if (data.stats.lowMatch !== undefined) {
          matchStats.value[3].value = data.stats.lowMatch.toString()
        }
      }
    } else {
      console.warn('匹配数据格式不正确或无匹配结果，尝试调用Coze匹配接口')
      console.log('数据内容:', data)

      // 如果没有匹配结果，尝试调用Coze匹配接口
      try {
        console.log('🔄 调用Coze智能体匹配课程接口')
        const cozeResult = await courseMatchApi.cozeMatch(selectedProfileId.value)

        console.log('=== Coze匹配API响应 ===')
        console.log('完整响应:', cozeResult)

        // 处理Coze响应
        let cozeData = cozeResult
        if (cozeResult.data) {
          cozeData = cozeResult.data
        }

        console.log('=== 处理后的Coze匹配数据 ===')
        console.log('数据类型:', typeof cozeData)
        console.log('数据内容:', cozeData)

        // 检查Coze返回的数据格式
        if (cozeData && cozeData.matches && Array.isArray(cozeData.matches)) {
          aiCourses.value = cozeData.matches.map(course => ({
            id: course.id || course.courseId,
            courseId: course.courseId,
            aiCourseId: course.courseId,  // 使用 courseId 作为 aiCourseId
            name: course.courseName || course.name,
            title: course.courseName || course.name || course.title,
            description: course.description,
            matchScore: course.matchScore,
            matchedSkills: course.matchedSkills || [],
            unmatchedSkills: course.unmatchedSkills || [],
            reason: course.reason,
            totalVideos: course.totalVideos,
            difficultyLevel: course.difficultyLevel,
            addedToPlan: Boolean(course.addedToPlan),
            isApproved: Boolean(course.isApproved),
            school: course.school,
            teacher: course.teacher,
            totalDuration: course.totalDuration,
            duration: course.duration,
            estimatedDays: course.estimatedDays
          }))
          console.log(`✅ Coze匹配获取到 ${cozeData.matches.length} 门匹配课程`)
        } else if (cozeData && Array.isArray(cozeData)) {
          // 如果直接返回数组
          aiCourses.value = cozeData.map(course => ({
            id: course.id || course.courseId,
            courseId: course.courseId,
            aiCourseId: course.courseId,  // 使用 courseId 作为 aiCourseId
            name: course.courseName || course.name,
            title: course.courseName || course.name || course.title,
            description: course.description,
            matchScore: course.matchScore,
            matchedSkills: course.matchedSkills || [],
            unmatchedSkills: course.unmatchedSkills || [],
            reason: course.reason,
            totalVideos: course.totalVideos,
            difficultyLevel: course.difficultyLevel,
            addedToPlan: Boolean(course.addedToPlan),
            isApproved: Boolean(course.isApproved),
            school: course.school,
            teacher: course.teacher,
            totalDuration: course.totalDuration,
            duration: course.duration,
            estimatedDays: course.estimatedDays
          }))
          console.log(`✅ Coze匹配获取到 ${cozeData.length} 门匹配课程`)
        } else {
          console.warn('Coze匹配数据格式也不正确:', cozeData)
          aiCourses.value = []
        }
      } catch (cozeError) {
        console.error('=== Coze匹配失败 ===')
        console.error('错误信息:', cozeError)
        aiCourses.value = []
      }
    }

    // 处理优化建议
    if (aiCourses.value.length > 0) {
      console.log('生成默认建议')
      generateDefaultSuggestions()
    } else {
      suggestions.value = []
    }

    // 更新匹配度分析图表
    updateMatchChart()

    // 同步已加入计划的课程状态
    syncAddedCoursesStatus()

  } catch (error) {
    console.error('=== 获取匹配课程失败 ===')
    console.error('错误信息:', error)

    if (error.response?.status === 404) {
      ElMessage.warning('该岗位画像暂无匹配课程')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器错误，请稍后重试')
    } else {
      ElMessage.error('获取匹配课程失败，请检查后端服务')
    }

    // 显示空状态
    aiCourses.value = []
    suggestions.value = []

    // 更新匹配度分析图表（显示空数据）
    updateMatchChart()
  }
}



const generateSuggestions = (profile) => {
  suggestions.value = [
    {
      type: '技能完善',
      title: '建议补充相关技能',
      content: `当前岗位画像已匹配到 ${aiCourses.value.length} 门课程。建议补充以下技能以提升匹配度：Node.js、Git版本控制。`,
      actions: [
        { label: '编辑画像', action: 'edit' }
      ]
    },
    {
      type: '课程推荐',
      title: '推荐课程组合',
      content: '根据技能要求，建议优先学习：React前端开发实战、TypeScript高级编程、云数据库应用开发。',
      actions: [
        { label: '创建学习路径', action: 'path' }
      ]
    },
    {
      type: '培训优化',
      title: '培训课程建议',
      content: '建议将高匹配度课程（匹配度>85%）纳入新员工培训课程，预计可缩短培训周期至2-3周。',
      actions: [
        { label: '创建培训课程', action: 'training' }
      ]
    }
  ]
}

// 生成默认优化建议（当API调用失败或返回空数据时使用）
const generateDefaultSuggestions = () => {
  const profile = selectedProfile.value
  if (!profile) return

  const highMatchCount = aiCourses.value.filter(course => course.matchScore >= 85).length
  const totalSkills = profile.skills ? profile.skills.length : 0

  suggestions.value = [
    {
      type: '数据分析',
      title: '匹配结果分析',
      content: `当前岗位画像共包含${totalSkills}项技能要求，已匹配到${aiCourses.value.length}门相关课程，其中${highMatchCount}门为高匹配度课程。`,
      actions: [
        { label: '查看详细报告', action: 'report' }
      ]
    },
    {
      type: '技能覆盖',
      title: '技能覆盖情况',
      content: `已覆盖技能要求的主要领域，建议补充项目实践内容以提高学习效果。`,
      actions: [
        { label: '编辑画像', action: 'edit' }
      ]
    },
    {
      type: '学习建议',
      title: '学习路径优化',
      content: '建议按照技能优先级进行学习，先掌握核心技能，再学习辅助技能。高匹配度课程优先学习。',
      actions: [
        { label: '创建学习计划', action: 'plan' }
      ]
    }
  ]
}

const handleSortChange = () => {
  // 排序已在computed中处理
}

const handleRefresh = async () => {
  if (!selectedProfileId.value) {
    ElMessage.warning('请先选择岗位画像')
    return
  }

  console.log('=== 开始刷新匹配结果 ===')
  console.log('选择的岗位画像ID:', selectedProfileId.value)

  // 显示加载状态
  const loading = ElLoading.service({
    lock: true,
    text: '正在重新匹配...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    // 先清空旧数据
    aiCourses.value = []
    suggestions.value = []

    // 重新调用获取匹配结果接口
    console.log('🔄 重新获取匹配结果')
    const result = await courseMatchApi.getResults({ profileId: selectedProfileId.value })

    console.log('=== 获取匹配结果API响应 ===')
    console.log('完整响应:', result)

    // 处理响应数据
    let data = result
    if (result.data) {
      data = result.data
    }

    console.log('=== 处理后的匹配数据 ===')
    console.log('数据类型:', typeof data)
    console.log('数据内容:', data)

    // 根据接口文档处理返回数据
    if (data && data.matches && Array.isArray(data.matches)) {
      aiCourses.value = data.matches.map(course => ({
        id: course.id,
        courseId: course.courseId,
        name: course.courseName,
        title: course.courseName,
        description: course.description,
        matchScore: course.matchScore,
        matchedSkills: course.matchedSkills || [],
        unmatchedSkills: course.unmatchedSkills || [],
        reason: course.reason,
        totalVideos: course.totalVideos,
        difficultyLevel: course.difficultyLevel,
        addedToPlan: course.addedToPlan,
        isApproved: course.isApproved
      }))
      console.log(`✅ 获取到 ${data.matches.length} 门匹配课程`)

      // 更新统计信息
      if (data.stats) {
        if (data.stats.total !== undefined) {
          matchStats.value[0].value = data.stats.total.toString()
        }
        if (data.stats.highMatch !== undefined) {
          matchStats.value[1].value = data.stats.highMatch.toString()
        }
        if (data.stats.mediumMatch !== undefined) {
          matchStats.value[2].value = data.stats.mediumMatch.toString()
        }
        if (data.stats.lowMatch !== undefined) {
          matchStats.value[3].value = data.stats.lowMatch.toString()
        }
      }
    } else {
      console.warn('匹配数据格式不正确:', data)
      ElMessage.warning('未获取到匹配课程，请稍后重试')
    }

    // 生成优化建议
    if (aiCourses.value.length > 0) {
      generateDefaultSuggestions()
    } else {
      suggestions.value = []
    }

    // 更新匹配度分析图表
    updateMatchChart()

    ElMessage.success(`匹配结果已刷新，共${aiCourses.value.length}门课程`)

  } catch (error) {
    console.error('=== 刷新匹配结果失败 ===')
    console.error('错误信息:', error)
    console.error('错误状态码:', error.response?.status)
    console.error('错误响应数据:', error.response?.data)
    console.error('请求配置:', error.config)
    console.error('请求URL:', error.config?.url)
    console.error('请求数据:', error.config?.data)

    if (error.response?.status === 404) {
      ElMessage.error('匹配接口不存在，请联系管理员')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器错误，请联系管理员检查后端服务')
      recordServerError(error, '/enterprise/course-match/results')
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(`刷新匹配结果失败: ${error.message || '未知错误'}`)
    }
  } finally {
    // 关闭加载状态
    loading.close()
  }
}

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

const getMatchTag = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'info'
}

// 获取匹配等级文本
const getMatchLevelText = (level) => {
  const textMap = {
    'high': '高匹配',
    'medium': '中等匹配',
    'low': '低匹配'
  }
  return textMap[level] || level
}

const viewCourseDetail = (course) => {
  ElMessage.info(`查看课程详情：${course.name}`)
}

const addToPlan = async (course) => {
  console.log('=== 加入计划 ===')
  console.log('课程信息:', course)
  console.log('courseId:', course.courseId, 'aiCourseId:', course.aiCourseId)
  console.log('当前选择的岗位画像ID:', selectedProfileId.value)

  if (!selectedProfileId.value) {
    ElMessage.warning('请先选择岗位画像')
    return
  }

  // 如果已经加入计划，不再重复添加
  if (course.addedToPlan) {
    ElMessage.info(`《${course.title || course.name}》已在计划中`)
    return
  }

  try {
    course.loading = true

    // 使用 aiCourseId（已经映射为 courseId）
    const aiCourseId = course.aiCourseId || course.courseId
    console.log('将要使用的课程ID:', aiCourseId)

    if (!aiCourseId) {
      ElMessage.error('课程ID缺失，无法加入计划')
      return
    }

    const data = {
      profileId: selectedProfileId.value,
      aiCourseId: aiCourseId
    }

    console.log('发送请求体:', data)

    const result = await courseMatchApi.addToPlan(data)
    console.log('=== 加入计划API响应 ===')
    console.log('完整响应:', result)

    // 更新课程状态为已加入
    course.addedToPlan = true

    // 显示成功消息和跳转提示
    ElMessage({
      message: `已将《${course.title || course.name}》加入计划`,
      type: 'success',
      duration: 3000
    })

    // 询问是否跳转到课程计划管理页面
    setTimeout(() => {
      ElMessageBox.confirm(
        `《${course.title || course.name}》已成功加入计划，是否前往"AI课程计划管理"页面查看？`,
        '提示',
        {
          confirmButtonText: '前往查看',
          cancelButtonText: '继续浏览',
          type: 'info'
        }
      ).then(() => {
        router.push({ name: 'AiCoursePlan', query: { profileId: selectedProfileId.value } })
      }).catch(() => {
        // 用户选择继续浏览，不执行任何操作
      })
    }, 500)
  } catch (error) {
    console.error('=== 加入计划失败 ===')
    console.error('错误信息:', error)
    console.error('错误响应:', error.response)
    const errorMsg = error.response?.data?.message || error.message || '加入计划失败，请重试'
    ElMessage.error(errorMsg)
  } finally {
    course.loading = false
  }
}

// 同步已加入计划的课程状态
const syncAddedCoursesStatus = async () => {
  if (!selectedProfileId.value) return

  try {
    const result = await courseMatchApi.getAddedToPlan({ profileId: selectedProfileId.value })
    console.log('=== 已加入计划课程同步 ===')
    console.log('完整响应:', result)

    let data = result
    if (result.data) {
      data = result.data
    }

    const addedCourseIds = []
    if (Array.isArray(data)) {
      addedCourseIds.push(...data.map(c => c.aiCourseId || c.courseId))
    } else if (data && Array.isArray(data.data)) {
      addedCourseIds.push(...data.data.map(c => c.aiCourseId || c.courseId))
    } else if (data && Array.isArray(data.list)) {
      addedCourseIds.push(...data.list.map(c => c.aiCourseId || c.courseId))
    }

    console.log('已加入计划的课程ID列表:', addedCourseIds)
    console.log('课程列表中的所有courseId:', aiCourses.value.map(c => c.courseId))

    // 更新所有课程的状态
    aiCourses.value.forEach(course => {
      const courseId = course.courseId
      const isInPlan = courseId !== undefined && courseId !== null && addedCourseIds.includes(courseId)
      console.log(`课程: ${course.title}, courseId: ${courseId}, 是否在已加入列表中: ${isInPlan}`)
      course.addedToPlan = isInPlan
    })

    console.log('✅ 同步已加入计划课程状态完成')
    console.log('同步后的课程状态:', aiCourses.value.map(c => ({
      title: c.title,
      aiCourseId: c.aiCourseId,
      addedToPlan: c.addedToPlan
    })))
  } catch (error) {
    console.error('同步已加入计划课程状态失败:', error)
  }
}

const handleSuggestionAction = (action) => {
  switch (action.action) {
    case 'edit':
      router.push({ path: '/skill-profile' })
      break
    case 'path':
      ElMessage.info('创建学习路径功能开发中')
      break
    case 'training':
      router.push({ path: '/training' })
      break
    case 'report':
      ElMessage.info('详细报告功能开发中')
      break
    case 'plan':
      ElMessage.info('创建学习计划功能开发中')
      break
    default:
      console.warn('未知的操作类型:', action.action)
      ElMessage.info('功能开发中')
  }
}

let matchChart = null

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    console.error('日期格式化失败:', e)
    return dateString
  }
}

// 解析目标技能(可能是JSON字符串或数组)
const parseTargetSkills = (skills) => {
  if (!skills) return []
  if (Array.isArray(skills)) return skills
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      // 如果不是JSON格式，可能是逗号分隔的字符串
      return skills.split(',').map(s => s.trim()).filter(s => s)
    }
  }
  return []
}

// 获取难度等级标签
const getDifficultyTag = (difficulty) => {
  const tagMap = {
    'beginner': 'success',
    'intermediate': 'warning',
    'advanced': 'danger',
    '初级': 'success',
    '中级': 'warning',
    '高级': 'danger'
  }
  return tagMap[difficulty] || 'info'
}

// 获取学历文本
const getEducationText = (education) => {
  const textMap = {
    'bachelor': '本科',
    'master': '硕士',
    'phd': '博士',
    'college': '大专',
    '本科': '本科',
    '硕士': '硕士',
    '博士': '博士',
    '大专': '大专'
  }
  return textMap[education] || education
}



const initMatchChart = () => {
  if (!matchChartRef.value) return
  matchChart = echarts.init(matchChartRef.value)
  console.log('=== 图表初始化完成 ===')
  // 初始不调用updateMatchChart，等待数据加载
}

const updateMatchChart = async () => {
  if (!matchChart) return

  console.log('=== updateMatchChart 调用 ===')
  console.log('selectedProfileId:', selectedProfileId.value)
  console.log('selectedProfile:', selectedProfile.value)
  console.log('aiCourses length:', aiCourses.value.length)
  
  // 如果没有选择的岗位画像，显示空数据
  if (!selectedProfileId.value) {
    console.log('未选择岗位画像，显示提示信息')
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}% ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{c}%'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: [{ value: 0, name: '请选择岗位画像' }]
        }
      ]
    }
    matchChart.setOption(option)
    return
  }

  // 直接使用匹配结果数据生成图表
  console.log('=== 使用匹配结果数据生成图表 ===')
  console.log('aiCourses:', aiCourses.value.length)

  const chartData = aiCourses.value.map(course => ({
    value: course.matchScore || 0,
    name: course.title || course.name || '未命名课程'
  }))

  console.log('图表数据:', chartData)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: chartData.length > 0 ? chartData : [{ value: 0, name: '暂无分析数据' }]
      }
    ]
  }

  matchChart.setOption(option)
}

const resizeChart = () => {
  matchChart?.resize()
}

// 监听岗位画像选择变化
watch(selectedProfileId, (newId, oldId) => {
  console.log('=== selectedProfileId 变化 ===')
  console.log('从:', oldId, '到:', newId)
  
  // 如果图表已初始化且有新的选择，更新图表
  if (matchChart && newId) {
    // 延迟一下让数据稳定
    nextTick(() => {
      setTimeout(() => {
        updateMatchChart()
      }, 100)
    })
  }
})

onMounted(() => {
  window.addEventListener('resize', resizeChart)
})
</script>

<style lang="scss" scoped>
.course-match {
  .overview-row {
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
          
          .stat-label {
            font-size: 14px;
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .match-card {
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
    
    .profile-info {
      margin-bottom: 20px;
      
      .profile-card {
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          h3 {
            margin: 0;
            font-size: 18px;
          }
        }
        
        .profile-skills {
          .label {
            font-weight: 600;
            margin-right: 8px;
          }
        }
      }
    }
    
    .ai-courses-list {
      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h4 {
          margin: 0;
          font-size: 16px;
          color: var(--text-primary);
        }
      }
      
      .course-list {
        .course-card {
          margin-bottom: 16px;
          
          .course-header {
            margin-bottom: 12px;
            
            .course-title {
              display: flex;
              justify-content: space-between;
              align-items: center;
              
              h4 {
                margin: 0;
                font-size: 16px;
              }
            }
          }
          
          .course-info {
            display: flex;
            gap: 20px;
            margin-bottom: 12px;
            flex-wrap: wrap;
            
            .info-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 14px;
              color: var(--text-secondary);
            }
          }
          
          .course-description {
            margin-bottom: 12px;
            color: var(--text-regular);
            line-height: 1.6;
            font-size: 13px;
          }

          .course-reason {
            margin-bottom: 12px;
            padding: 8px 12px;
            background-color: var(--el-fill-color-light);
            border-radius: 4px;
            font-size: 13px;

            .label {
              font-weight: 600;
              margin-right: 8px;
              color: var(--text-primary);
            }
          }

          .course-skills {
            margin-bottom: 12px;

            .label {
              font-weight: 600;
              margin-right: 8px;
              color: var(--text-primary);
            }
          }
          
          .course-actions {
            display: flex;
            gap: 12px;
          }
        }
      }
    }
  }

  .suggestion-card,
  .analysis-card {
    .card-header {
      font-weight: 600;
      font-size: 16px;
    }
    
    .suggestions {
      .suggestion-item {
        h5 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--text-primary);
        }
        
        p {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: var(--text-regular);
          line-height: 1.6;
        }
        
        .suggestion-actions {
          margin-top: 8px;
        }
      }
    }
    
    .chart-container {
      width: 100%;
      height: 250px;
    }
  }
}

.course-detail {
  .detail-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: var(--text-primary);
      font-weight: 600;
    }

    .detail-info {
      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;

        .label {
          color: var(--text-secondary);
          margin-right: 12px;
          min-width: 80px;
        }
      }
    }

    .description {
      margin: 0;
      line-height: 1.6;
      color: var(--text-regular);
    }

    .skills {
      display: flex;
      flex-wrap: wrap;
    }

    .chapter-title-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;

      .chapter-title {
        flex: 1;
        font-weight: 500;
      }
    }

    .chapter-content {
      margin: 12px 0;
      color: var(--text-regular);
      line-height: 1.6;
      font-size: 14px;
      padding: 12px;
      background-color: var(--el-fill-color-light);
      border-radius: 4px;
    }

    .chapter-description {
      margin-bottom: 12px;
      color: var(--text-regular);
      line-height: 1.6;
      font-size: 13px;
      padding: 8px 12px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;
    }

    .chapter-meta {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color-lighter);
    }
  }
}
</style>

