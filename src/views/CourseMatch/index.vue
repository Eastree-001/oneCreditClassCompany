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
                  {{ skill }}
                </el-tag>
              </div>
            </el-card>
          </div>

          <!-- 匹配课程列表 -->
          <div v-if="matchResults.length > 0" class="match-results">
            <div class="results-header">
              <h4>匹配到 {{ matchResults.length }} 门相关课程</h4>
              <el-radio-group v-model="sortType" size="small" @change="handleSortChange">
                <el-radio-button label="match">匹配度</el-radio-button>
                <el-radio-button label="name">课程名称</el-radio-button>
              </el-radio-group>
            </div>

            <div class="course-list">
              <el-card
                v-for="course in sortedMatchResults"
                :key="course.id"
                class="course-card card-hover"
                shadow="hover"
              >
                <div class="course-header">
                  <div class="course-title">
                    <h4>{{ course.name }}</h4>
                    <el-tag :type="getMatchTag(course.matchScore)">
                      匹配度 {{ course.matchScore }}%
                    </el-tag>
                  </div>
                </div>
                <div class="course-info">
                  <div class="info-item">
                    <el-icon><School /></el-icon>
                    <span>{{ course.school }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span>{{ course.teacher }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ course.duration }}课时</span>
                  </div>
                </div>
                <div class="course-description">{{ course.description }}</div>
                <div class="matched-skills">
                  <span class="label">匹配技能：</span>
                  <el-tag
                    v-for="(skill, index) in course.matchedSkills"
                    :key="index"
                    type="success"
                    size="small"
                    style="margin-right: 8px; margin-bottom: 4px"
                  >
                    {{ skill }}
                  </el-tag>
                </div>
                <div class="course-actions">
                  <el-button type="primary" link @click="viewCourseDetail(course)">
                    查看详情
                  </el-button>
                  <el-button type="primary" link @click="addToTraining(course)">
                    加入培训计划
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>

          <el-empty v-else description="请选择岗位画像进行匹配" />
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import * as echarts from 'echarts'
import { Refresh, School, User, Clock } from '@element-plus/icons-vue'
import { courseMatchApi } from '@/api'

const route = useRoute()
const router = useRouter()

const selectedProfileId = ref(null)
const sortType = ref('match')
const matchChartRef = ref(null)

const matchStats = ref([
  { label: '总匹配数', value: '156', icon: 'Connection', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: '高匹配度', value: '45', icon: 'CircleCheck', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { label: '已加入计划', value: '28', icon: 'DocumentAdd', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: '待审核', value: '12', icon: 'Clock', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
])

const profileList = ref([])

const selectedProfile = computed(() => {
  return profileList.value.find(p => p.id === selectedProfileId.value)
})

const matchResults = ref([])

const sortedMatchResults = computed(() => {
  const results = [...matchResults.value]
  if (sortType.value === 'match') {
    return results.sort((a, b) => b.matchScore - a.matchScore)
  } else {
    return results.sort((a, b) => a.name.localeCompare(b.name))
  }
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
      updateMatchStats(data.stats)
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

// 更新匹配统计信息
const updateMatchStats = (stats) => {
  if (!stats) return
  
  matchStats.value = [
    { 
      label: '总匹配数', 
      value: stats.total.toString(), 
      icon: 'Connection', 
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    },
    { 
      label: '高匹配度', 
      value: stats.highMatch.toString(), 
      icon: 'CircleCheck', 
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
    },
    { 
      label: '中等匹配', 
      value: stats.mediumMatch.toString(), 
      icon: 'DocumentAdd', 
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
    },
    { 
      label: '低匹配度', 
      value: stats.lowMatch.toString(), 
      icon: 'Clock', 
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
    }
  ]
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
    selectedProfileId.value = parseInt(profileId)
    // 如果有预设的profileId，等profiles加载完成后再处理
    nextTick(() => {
      setTimeout(() => {
        handleProfileChange()
      }, 500)
    })
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
    matchResults.value = []
    suggestions.value = []
    // 清空图表
    updateMatchChart()
    return
  }

  console.log('=== 开始获取匹配结果 ===')
  console.log('选择的岗位画像ID:', selectedProfileId.value)
  console.log('选择的岗位画像:', selectedProfile.value)

  try {
    // 并行调用两个API：匹配结果和优化建议
    const [matchResult, suggestionResult] = await Promise.allSettled([
      courseMatchApi.getResults({
        profileId: selectedProfileId.value
      }),
      courseMatchApi.getSuggestions({
        profileId: selectedProfileId.value
      })
    ])
    
    console.log('=== 匹配结果API响应 ===')
    if (matchResult.status === 'fulfilled') {
      console.log('完整响应:', matchResult.value)
      
      // 处理不同的响应格式
      let data = matchResult.value
      if (matchResult.value.data) {
        data = matchResult.value.data
      }
      
      console.log('=== 处理后的匹配结果数据 ===')
      console.log('数据类型:', typeof data)
      console.log('数据内容:', data)
      
      // 根据提供的API格式处理响应数据
      if (data && data.matches && Array.isArray(data.matches)) {
        // 处理API返回的匹配结果格式
        matchResults.value = data.matches.map(match => ({
          id: match.id,
          courseId: match.courseId,
          name: match.courseName,
          school: match.school,
          teacher: match.teacher,
          duration: match.duration,
          description: match.description,
          matchScore: match.matchScore,
          matchedSkills: match.matchedSkills || []
        }))
        
        // 如果匹配结果中包含统计数据，也更新统计面板
        if (data.stats) {
          updateMatchStats(data.stats)
        }
        
        console.log('设置匹配结果成功:', matchResults.value)
      } else if (data && (Array.isArray(data.courses) || Array.isArray(data.matches) || Array.isArray(data.results))) {
        // 兼容其他可能的格式
        matchResults.value = data.courses || data.matches || data.results || []
        console.log('设置匹配结果（兼容格式）:', matchResults.value)
      } else {
        console.warn('匹配结果数据格式不正确:', data)
        matchResults.value = []
      }
    } else {
      console.error('匹配结果API调用失败:', matchResult.reason)
      ElMessage.warning('获取匹配结果失败')
      matchResults.value = []
    }
    
    console.log('=== 优化建议API响应 ===')
    if (suggestionResult.status === 'fulfilled') {
      console.log('完整响应:', suggestionResult.value)
      
      // 处理不同的响应格式
      let suggestionData = suggestionResult.value
      if (suggestionResult.value.data) {
        suggestionData = suggestionResult.value.data
      }
      
      console.log('=== 处理后的优化建议数据 ===')
      console.log('数据类型:', typeof suggestionData)
      console.log('数据内容:', suggestionData)
      
      // 设置优化建议
      if (suggestionData && Array.isArray(suggestionData.suggestions) || Array.isArray(suggestionData.data) || Array.isArray(suggestionData)) {
        suggestions.value = suggestionData.suggestions || suggestionData.data || suggestionData || []
        console.log('设置优化建议:', suggestions.value)
      } else {
        console.warn('优化建议数据格式不正确:', suggestionData)
      }
    } else {
      console.error('优化建议API调用失败:', suggestionResult.reason)
      console.log('优化建议获取失败，将在模拟数据中生成')
    }
    
    // 如果没有获取到有效的匹配结果，不使用模拟数据，显示空状态
    if (matchResults.value.length === 0) {
      console.log('未获取到有效的匹配结果，显示空状态，不使用模拟数据')
      // 不调用 setSimulatedMatchResults()
      
      // 如果有匹配结果但没有优化建议，生成默认建议
      if (suggestions.value.length === 0) {
        console.log('未获取到优化建议，生成默认建议')
        generateDefaultSuggestions()
      }
      // 更新匹配度分析图表（显示空数据）
      updateMatchChart()
    } else {
      // 如果有匹配结果但没有优化建议，生成默认建议
      if (suggestions.value.length === 0) {
        console.log('未获取到优化建议，生成默认建议')
        generateDefaultSuggestions()
      }
      // 更新匹配度分析图表
      updateMatchChart()
    }
    
  } catch (error) {
    console.error('=== 获取匹配结果和优化建议失败 ===')
    console.error('错误信息:', error)
    ElMessage.error('获取数据失败，请检查后端服务')
    
    // 如果API调用失败，不使用模拟数据，显示空状态
    matchResults.value = []
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
      content: `当前岗位画像已匹配到 ${matchResults.value.length} 门课程。建议补充以下技能以提升匹配度：Node.js、Git版本控制。`,
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
      title: '培训计划建议',
      content: '建议将高匹配度课程（匹配度>85%）纳入新员工培训计划，预计可缩短培训周期至2-3周。',
      actions: [
        { label: '创建培训计划', action: 'training' }
      ]
    }
  ]
}

// 生成默认优化建议（当API调用失败或返回空数据时使用）
const generateDefaultSuggestions = () => {
  const profile = selectedProfile.value
  if (!profile) return
  
  const highMatchCount = matchResults.value.filter(course => course.matchScore >= 85).length
  const totalSkills = profile.skills ? profile.skills.length : 0
  
  suggestions.value = [
    {
      type: '数据分析',
      title: '匹配结果分析',
      content: `当前岗位画像共包含${totalSkills}项技能要求，已匹配到${matchResults.value.length}门相关课程，其中${highMatchCount}门为高匹配度课程。`,
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
    // 调用刷新接口
    const result = await courseMatchApi.refreshResults({
      profileId: selectedProfileId.value
    })
    
    console.log('=== 刷新匹配结果API响应 ===')
    console.log('完整响应:', result)
    
    // 处理不同的响应格式
    let data = result
    if (result.data) {
      data = result.data
    }
    
    console.log('=== 处理后的刷新结果数据 ===')
    console.log('数据类型:', typeof data)
    console.log('数据内容:', data)
    console.log('数据键名:', data ? Object.keys(data) : 'null')
    console.log('是否为数组:', Array.isArray(data))
    console.log('data.courses:', data?.courses)
    console.log('data.matches:', data?.matches)
    console.log('data.results:', data?.results)
    console.log('data.list:', data?.list)
    console.log('data.data:', data?.data)
    
    // 根据接口文档，刷新接口返回的是操作状态，不是匹配结果
    // 响应格式: { "code": 200, "message": "匹配完成", "data": { "match_count": 5 } }
    if (result.code === 200 || (data && data.code === 200)) {
      console.log('刷新操作成功，重新获取匹配结果')
      
      // 刷新成功后，重新调用获取匹配结果接口
      await handleProfileChange()
      ElMessage.success('匹配结果已刷新')
    } else {
      console.warn('刷新操作失败:', data)
      
      // 显示详细的错误信息，帮助调试
      const dataStr = JSON.stringify(data, null, 2)
      console.error('完整响应数据:', dataStr)
      
      ElMessage.error('刷新匹配结果失败，请重试')
    }
    
  } catch (error) {
    console.error('=== 刷新匹配结果失败 ===')
    console.error('错误信息:', error)
    ElMessage.error('刷新匹配结果失败，请重试')
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

const viewCourseDetail = (course) => {
  ElMessage.info(`查看课程详情：${course.name}`)
}

const addToTraining = (course) => {
  ElMessage.success(`已将《${course.name}》加入培训计划`)
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
  console.log('matchResults length:', matchResults.value.length)
  
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
  
  try {
    // 调用真实API获取匹配度分析数据
    const result = await courseMatchApi.getAnalysis({
      profileId: selectedProfileId.value  // 修改参数名，后端期望 profileId 而不是 profile_id
    })
    
    console.log('=== 匹配度分析API响应 ===')
    console.log('完整响应:', result)
    
    // 处理响应数据
    let data = result
    if (result.data) {
      data = result.data
    }
    
    console.log('=== 处理后的分析数据 ===')
    console.log('数据类型:', typeof data)
    console.log('数据内容:', data)
    
    let chartData = []
    if (Array.isArray(data)) {
      // 直接是数组格式
      chartData = data
    } else if (data && Array.isArray(data.data)) {
      // 嵌套在data字段中
      chartData = data.data
    } else if (data && data.code === 200 && Array.isArray(data.data)) {
      // 标准响应格式
      chartData = data.data
    }
    
    console.log('最终图表数据:', chartData)
    
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
    
  } catch (error) {
    console.error('=== 获取匹配度分析失败 ===')
    console.error('错误信息:', error)
    
    // 记录服务器错误（特别是500错误）
    if (error.response?.status === 500) {
      recordServerError(error, '/enterprise/course-match/analysis')
      
      console.error('🔥 500错误 - 服务器内部错误详情:')
      console.error('请求URL:', error.config?.url)
      console.error('请求方法:', error.config?.method?.toUpperCase())
      console.error('请求参数:', error.config?.params)
      console.error('完整响应:', error.response?.data)
      
      // 尝试显示后端返回的具体错误信息
      if (error.response?.data) {
        const errorData = error.response.data
        if (typeof errorData === 'string') {
          console.error('后端错误详情:', errorData)
        } else if (errorData.message) {
          console.error('后端错误消息:', errorData.message)
        } else if (errorData.error) {
          console.error('后端错误:', errorData.error)
        } else if (errorData.details) {
          console.error('后端详细错误:', errorData.details)
        }
      }
      
      // 显示用户友好的错误提示
      ElMessage.warning('分析服务暂时不可用，正在使用备用数据')
    } else {
      ElMessage.error(`获取匹配度分析失败: ${error.message}`)
    }
    
    // 如果API调用失败，回退到使用匹配结果数据
    const fallbackData = matchResults.value.map(course => ({
      value: course.matchScore,
      name: course.name
    }))
    
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
          data: fallbackData.length > 0 ? fallbackData : [{ value: 0, name: '数据加载失败' }]
        }
      ]
    }
    
    matchChart.setOption(option)
  }
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
    
    .match-results {
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
          }
          
          .matched-skills {
            margin-bottom: 12px;
            
            .label {
              font-weight: 600;
              margin-right: 8px;
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
</style>

