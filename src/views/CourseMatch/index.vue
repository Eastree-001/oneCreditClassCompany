<template>
  <div class="course-match">
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Refresh, School, User, Clock } from '@element-plus/icons-vue'

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

const profileList = ref([
  {
    id: 1,
    name: '前端工程师',
    type: 'tech',
    skills: ['React', 'Supabase', 'n8n', 'TypeScript', 'Vue.js']
  },
  {
    id: 2,
    name: 'AI算法工程师',
    type: 'tech',
    skills: ['Python', 'TensorFlow', 'PyTorch', '机器学习', '深度学习']
  },
  {
    id: 3,
    name: '数据安全分析师',
    type: 'tech',
    skills: ['网络安全', '数据加密', '风险评估', '安全审计']
  },
  {
    id: 4,
    name: 'AIGC内容设计师',
    type: 'design',
    skills: ['Midjourney', 'Stable Diffusion', 'ChatGPT', '设计思维']
  }
])

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

onMounted(() => {
  const profileId = route.query.profileId
  if (profileId) {
    selectedProfileId.value = parseInt(profileId)
    handleProfileChange()
  }
  
  nextTick(() => {
    initMatchChart()
  })
})

const handleProfileChange = () => {
  if (!selectedProfileId.value) {
    matchResults.value = []
    suggestions.value = []
    return
  }

  // 模拟匹配结果
  const profile = selectedProfile.value
  if (profile) {
    if (profile.id === 1) {
      // 前端工程师匹配结果
      matchResults.value = [
        {
          id: 1,
          name: 'React 前端开发实战',
          school: '清华大学',
          teacher: '张教授',
          duration: 32,
          description: '全面讲解React框架，包括Hooks、状态管理、路由等核心概念',
          matchScore: 95,
          matchedSkills: ['React', 'TypeScript']
        },
        {
          id: 2,
          name: '现代Web开发技术栈',
          school: '北京大学',
          teacher: '李教授',
          duration: 40,
          description: '涵盖Vue.js、React等主流前端框架，以及现代工具链',
          matchScore: 88,
          matchedSkills: ['Vue.js', 'React']
        },
        {
          id: 3,
          name: '云数据库应用开发',
          school: '复旦大学',
          teacher: '王教授',
          duration: 24,
          description: '学习Supabase等云数据库平台的使用和集成',
          matchScore: 85,
          matchedSkills: ['Supabase']
        },
        {
          id: 4,
          name: '工作流自动化工具',
          school: '上海交大',
          teacher: '陈教授',
          duration: 16,
          description: '使用n8n等工具实现业务流程自动化',
          matchScore: 82,
          matchedSkills: ['n8n']
        },
        {
          id: 5,
          name: 'TypeScript 高级编程',
          school: '浙江大学',
          teacher: '刘教授',
          duration: 28,
          description: '深入理解TypeScript类型系统和高级特性',
          matchScore: 90,
          matchedSkills: ['TypeScript']
        }
      ]
    } else {
      // 其他岗位的匹配结果（简化）
      matchResults.value = [
        {
          id: 6,
          name: '相关课程示例',
          school: '示例大学',
          teacher: '示例教师',
          duration: 20,
          description: '这是一个示例课程',
          matchScore: 75,
          matchedSkills: profile.skills.slice(0, 2)
        }
      ]
    }

    // 生成优化建议
    generateSuggestions(profile)
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

const handleSortChange = () => {
  // 排序已在computed中处理
}

const handleRefresh = () => {
  if (selectedProfileId.value) {
    ElMessage.success('正在重新匹配...')
    setTimeout(() => {
      handleProfileChange()
      ElMessage.success('匹配完成')
    }, 1000)
  } else {
    ElMessage.warning('请先选择岗位画像')
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
  }
}

let matchChart = null

const initMatchChart = () => {
  if (!matchChartRef.value) return
  matchChart = echarts.init(matchChartRef.value)
  updateMatchChart()
}

const updateMatchChart = () => {
  if (!matchChart) return
  
  const data = matchResults.value.map(course => ({
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
        data: data.length > 0 ? data : [{ value: 0, name: '暂无数据' }]
      }
    ]
  }
  
  matchChart.setOption(option)
}

const resizeChart = () => {
  matchChart?.resize()
}

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

