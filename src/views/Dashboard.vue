<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 左侧内容区域 -->
      <el-col :xs="24" :sm="24" :md="16">
        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
            <el-card class="stat-card card-hover" shadow="hover" v-loading="statsLoading">
              <div class="stat-content">
                <div class="stat-icon" :style="{ background: stat.color }">
                  <el-icon :size="24"><component :is="stat.icon" /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ statsLoading ? '...' : stat.value }}</div>
                  <div class="stat-title">{{ stat.title }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 图表区域 -->
        <el-row :gutter="20" class="charts-row">
          <el-col :xs="24" :sm="24" :md="12">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>课程匹配趋势</span>
                </div>
              </template>
              <div ref="matchTrendChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>岗位画像分布</span>
                </div>
              </template>
              <div ref="profileChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="charts-row">
          <el-col :xs="24" :sm="24" :md="12">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>培训课程完成情况</span>
                </div>
              </template>
              <div ref="trainingChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>合作高校统计</span>
                </div>
              </template>
              <div ref="cooperationChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <!-- 右侧最近活动 -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="activity-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in activities"
              :key="activity.id"
              :timestamp="activity.time"
              placement="top"
            >
              <el-card>
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { dashboardApi } from '@/api'
import { User, Connection, Document, Calendar } from '@element-plus/icons-vue'

const stats = ref([
  { 
    title: '岗位画像', 
    value: '0', 
    icon: 'User', 
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    key: 'skillProfiles',
    // 扩展所有可能的字段名
    possibleKeys: [
      'skillProfiles', 'skill_profiles', 'skillProfileCount', 'skill_profile_count', 'skillCount', 'skill_count',
      'positions', 'position_count', 'jobProfiles', 'job_profiles', 'profiles', 'profile_count',
      'skill_position', 'skill_job', 'position_skill', 'job_skill', 'skillData', 'skill_data'
    ]
  },
  { 
    title: '课程匹配', 
    value: '0', 
    icon: 'Connection', 
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
    key: 'courseMatches',
    possibleKeys: [
      'courseMatches', 'course_matches', 'courseMatchCount', 'course_match_count', 'courseCount', 'course_count',
      'matches', 'match_count', 'courseMatch', 'course_match', 'matching', 'matching_count',
      'course_matching', 'courseData', 'course_data', 'matchedCourses', 'matched_courses'
    ]
  },
  { 
    title: '培训课程', 
    value: '0', 
    icon: 'Calendar', 
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
    key: 'trainings',
    possibleKeys: [
      'trainings', 'trainingCount', 'training_count', 'planCount', 'plan_count',
      'plans', 'plan_count', 'programs', 'program_count', 'courses', 'course_count'
    ]
  },
  { 
    title: '合作项目', 
    value: '0', 
    icon: 'Document', 
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
    key: 'cooperations',
    possibleKeys: [
      'cooperations', 'cooperationCount', 'cooperation_count', 'projectCount', 'project_count',
      'projects', 'project_count', 'partners', 'partner_count', 'collaborations', 'collaboration_count'
    ]
  }
])

const statsLoading = ref(false)

const matchTrendChartRef = ref(null)
const profileChartRef = ref(null)
const trainingChartRef = ref(null)
const cooperationChartRef = ref(null)

// 计算字段名与目标字段的相似度
const getFieldSimilarity = (fieldName, targetKey) => {
  if (!fieldName || !targetKey) return 0
  
  const field = fieldName.toLowerCase()
  const target = targetKey.toLowerCase()
  
  // 完全匹配
  if (field === target) return 100
  
  // 包含关系
  if (field.includes(target) || target.includes(field)) return 80
  
  // 相似词根匹配
  const fieldWords = field.split(/[_-]/)
  const targetWords = target.split(/[_-]/)
  
  let score = 0
  for (const fWord of fieldWords) {
    for (const tWord of targetWords) {
      if (fWord === tWord) score += 30
      else if (fWord.includes(tWord) || tWord.includes(fWord)) score += 15
    }
  }
  
  return score
}

const activities = ref([
  {
    id: 1,
    title: '新增岗位画像：前端工程师',
    content: '已上传前端工程师技能画像，包含React、Supabase、n8n等技能要求',
    time: '2024-01-15 10:30'
  },
  {
    id: 2,
    title: '课程匹配完成',
    content: 'AI算法工程师岗位画像已匹配到12门相关课程章节',
    time: '2024-01-14 15:20'
  },
  {
    id: 3,
    title: '合作项目启动',
    content: '与XX大学达成合作，共同培养数据安全分析师',
    time: '2024-01-13 09:00'
  },
  {
    id: 4,
    title: '培训课程完成',
    content: '新员工入职培训课程已完成，培训周期缩短至2周',
    time: '2024-01-12 16:45'
  }
])

let matchTrendChart = null
let profileChart = null
let trainingChart = null
let cooperationChart = null

const initMatchTrendChart = () => {
  matchTrendChart = echarts.init(matchTrendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '匹配数量',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 156],
        itemStyle: {
          color: '#667eea'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  matchTrendChart.setOption(option)
}

const initProfileChart = () => {
  profileChart = echarts.init(profileChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '岗位类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 8, name: '前端工程师' },
          { value: 6, name: 'AI算法工程师' },
          { value: 5, name: '数据安全分析师' },
          { value: 3, name: 'AIGC内容设计师' },
          { value: 2, name: '其他' }
        ]
      }
    ]
  }
  profileChart.setOption(option)
}

const initTrainingChart = () => {
  trainingChart = echarts.init(trainingChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['已完成', '进行中', '待开始']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '计划数量',
        type: 'bar',
        data: [5, 2, 1],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#43e97b' },
            { offset: 1, color: '#38f9d7' }
          ])
        }
      }
    ]
  }
  trainingChart.setOption(option)
}

const initCooperationChart = () => {
  cooperationChart = echarts.init(cooperationChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['清华大学', '北京大学', '复旦大学', '上海交大', '浙江大学']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '合作项目数',
        type: 'bar',
        data: [3, 2, 2, 3, 2],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4facfe' },
            { offset: 1, color: '#00f2fe' }
          ])
        }
      }
    ]
  }
  cooperationChart.setOption(option)
}

const resizeCharts = () => {
  matchTrendChart?.resize()
  profileChart?.resize()
  trainingChart?.resize()
  cooperationChart?.resize()
}

// 获取统计数据
const fetchStatsData = async () => {
  statsLoading.value = true
  try {
    console.log('=== 开始获取统计数据 ===')
    console.log('当前token:', localStorage.getItem('token') ? '存在' : '不存在')
    console.log('API配置:', {
      BASE_URL: import.meta.env.VITE_API_BASE_URL,
      ENDPOINT: '/enterprise/dashboard/stats'
    })
    
    const result = await dashboardApi.getStats()
    console.log('=== 统计数据API响应 ===')
    console.log('完整响应:', result)
    console.log('响应类型:', typeof result)
    console.log('响应键:', Object.keys(result))
    
    // 处理不同的响应格式
    let data = result
    if (result.data) {
      console.log('使用嵌套的data字段')
      data = result.data
    }
    
    console.log('=== 处理后的统计数据 ===')
    console.log('数据对象:', data)
    console.log('数据类型:', typeof data)
    
    if (data && typeof data === 'object') {
      console.log('=== 完整的数据对象 ===')
      console.log('所有可用字段:', Object.keys(data))
      console.log('完整的响应数据:', data)
      
      // 快速分析字段类型
      console.log('=== 字段类型分析 ===')
      Object.keys(data).forEach(key => {
        const value = data[key]
        const type = typeof value
        console.log(`  ${key}: ${type} = ${value}`)
      })
      
      console.log('=== 字段映射分析 ===')
      stats.value.forEach(stat => {
        console.log(`\n查找字段 "${stat.key}" (${stat.title}):`)
        
        // 打印所有可能的字段值
        console.log('  所有字段值:')
        Object.keys(data).forEach(key => {
          console.log(`    ${key}: ${data[key]}`)
        })
        
        console.log(`  - 原始字段 "${stat.key}": ${data[stat.key]}`)
        console.log(`  - 小写字段 "${stat.key.toLowerCase()}": ${data[stat.key.toLowerCase()]}`)
        
        // 智能字段匹配：首先尝试预定义字段，然后动态查找
        console.log(`  - 预定义字段名: ${stat.possibleKeys.join(', ')}`)
        
        let value = '0'
        
        // 1. 尝试预定义字段
        for (const key of stat.possibleKeys) {
          if (data[key] !== undefined && data[key] !== null) {
            value = data[key]
            console.log(`  ✓ 预定义字段找到 "${key}": ${value}`)
            break
          }
        }
        
        // 2. 如果预定义字段没找到，尝试动态查找相似的数字字段
        if (value === '0') {
          console.log(`  - 预定义字段未找到，开始动态查找...`)
          
          // 查找所有可能的匹配字段
          const allKeys = Object.keys(data)
          console.log(`  - 所有可用字段: ${allKeys.join(', ')}`)
          
          // 按相似度排序字段
          const sortedKeys = allKeys.sort((a, b) => {
            const aScore = getFieldSimilarity(a, stat.key)
            const bScore = getFieldSimilarity(b, stat.key)
            return bScore - aScore
          })
          
          console.log(`  - 按相似度排序: ${sortedKeys.map(k => `${k}(${getFieldSimilarity(k, stat.key)})`).join(', ')}`)
          
          // 查找第一个数字类型的字段
          for (const key of sortedKeys) {
            if (typeof data[key] === 'number' && data[key] >= 0) {
              value = data[key]
              console.log(`  ✓ 动态匹配找到数字字段 "${key}": ${value}`)
              break
            }
          }
        }
        
        if (value === '0') {
          console.log(`  ✗ 仍未找到匹配字段，使用默认值 0`)
          
          // 显示所有数字字段作为参考
          const numberFields = allKeys.filter(key => typeof data[key] === 'number')
          if (numberFields.length > 0) {
            console.log(`  - 发现的数字字段: ${numberFields.map(k => `${k}: ${data[k]}`).join(', ')}`)
          }
        }
        
        stat.value = value
        console.log(`  - 最终值: ${value}`)
      })
      
      console.log('=== 更新后的统计值 ===')
      console.log(stats.value)
      
      // 如果API返回了图表数据，也可以更新图表
      if (data.charts) {
        console.log('发现图表数据，更新图表...')
        updateChartsWithData(data.charts)
      }
    } else {
      console.error('统计数据格式无效:', data)
      throw new Error('服务器返回的数据格式不正确')
    }
  } catch (error) {
    console.error('=== 获取统计数据失败 ===')
    console.error('错误信息:', error.message)
    console.error('错误堆栈:', error.stack)
    console.error('错误对象:', error)
    
    // 显示更详细的错误信息
    if (error.response) {
      console.error('HTTP错误:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers
      })
    }
    
    // 如果API调用失败，显示空状态而不是默认数据
    ElMessage.error(`获取统计数据失败: ${error.message}`)
    stats.value.forEach(stat => {
      stat.value = '--'  // 显示空状态标识，而不是假数据
    })
  } finally {
    statsLoading.value = false
    console.log('=== 统计数据获取完成，loading状态已关闭 ===')
  }
}

// 获取课程匹配趋势数据
const fetchMatchTrendData = async () => {
  try {
    console.log('正在获取课程匹配趋势数据...')
    const result = await dashboardApi.getMatchTrend()
    console.log('课程匹配趋势API返回:', result)
    
    // 处理不同的响应格式
    let data = result
    if (result.data) {
      data = result.data
    }
    
    console.log('处理后的课程匹配趋势数据:', data)
    
    // 更新课程匹配趋势图表
    if (data && matchTrendChart) {
      const trendData = data.data || data.values || data.trend || [120, 132, 101, 134, 90, 156]
      const xAxisData = data.xAxis || data.months || data.labels || ['1月', '2月', '3月', '4月', '5月', '6月']
      
      matchTrendChart.setOption({
        xAxis: { data: xAxisData },
        series: [{ data: trendData }]
      })
      
      console.log('课程匹配趋势图表更新成功:', { xAxis: xAxisData, data: trendData })
    }
  } catch (error) {
    console.error('获取课程匹配趋势数据失败:', error)
    // 如果API调用失败，图表会显示默认数据
  }
}

// 获取岗位画像分布数据
const fetchProfileDistributionData = async () => {
  try {
    console.log('=== 开始获取岗位画像分布数据 ===')
    console.log('当前token:', localStorage.getItem('token') ? '存在' : '不存在')
    
    const result = await dashboardApi.getProfileDistribution()
    console.log('=== 岗位画像分布API原始响应 ===')
    console.log('完整响应:', result)
    console.log('响应类型:', typeof result)
    console.log('响应键:', result ? Object.keys(result) : 'null')
    
    // 处理不同的响应格式
    let data = result
    if (result && result.data) {
      console.log('使用嵌套的data字段')
      data = result.data
    }
    
    console.log('=== 处理后的岗位画像分布数据 ===')
    console.log('数据对象:', data)
    console.log('数据类型:', typeof data)
    
    if (data && typeof data === 'object') {
      console.log('=== 数据字段分析 ===')
      console.log('所有可用字段:', Object.keys(data))
      Object.keys(data).forEach(key => {
        const value = data[key]
        console.log(`  ${key}: ${typeof value} = ${JSON.stringify(value)}`)
      })
      
      // 尝试多种可能的数据字段
      const possibleDataFields = [
        'data', 'distribution', 'values', 'items', 'list', 'profiles', 
        'profileDistribution', 'profile_distribution', 'positions', 'jobs'
      ]
      
      let profileData = null
      
      // 查找合适的图表数据
      for (const field of possibleDataFields) {
        if (data[field] && Array.isArray(data[field])) {
          profileData = data[field]
          console.log(`✓ 找到图表数据字段 "${field}":`, profileData)
          break
        }
      }
      
      // 如果没找到数组字段，检查数据本身是否是数组
      if (!profileData && Array.isArray(data)) {
        profileData = data
        console.log('✓ 数据本身是数组:', profileData)
      }
      
      // 如果还是没找到，使用默认数据
      if (!profileData) {
        profileData = [
          { value: 8, name: '前端工程师' },
          { value: 6, name: 'AI算法工程师' },
          { value: 5, name: '数据安全分析师' },
          { value: 3, name: 'AIGC内容设计师' },
          { value: 2, name: '其他' }
        ]
        console.log('⚠ 未找到有效数据，使用默认数据:', profileData)
      }
      
      // 检查数据格式是否正确
      const isValidData = profileData.every(item => 
        item && typeof item === 'object' && 
        typeof item.value === 'number' && 
        typeof item.name === 'string'
      )
      
      if (!isValidData) {
        console.warn('⚠ 数据格式不正确，尝试转换或使用默认数据')
        console.log('当前数据:', profileData)
        
        // 尝试转换格式
        if (typeof profileData === 'object' && !Array.isArray(profileData)) {
          // 如果是对象，转换为数组格式
          profileData = Object.keys(profileData).map(key => ({
            name: key,
            value: typeof profileData[key] === 'number' ? profileData[key] : 0
          }))
          console.log('转换后的数据:', profileData)
        } else {
          // 使用默认数据
          profileData = [
            { value: 8, name: '前端工程师' },
            { value: 6, name: 'AI算法工程师' },
            { value: 5, name: '数据安全分析师' },
            { value: 3, name: 'AIGC内容设计师' },
            { value: 2, name: '其他' }
          ]
          console.log('使用默认数据:', profileData)
        }
      }
      
      // 更新图表
      if (profileChart) {
        console.log('=== 更新岗位画像分布图表 ===')
        console.log('图表数据:', profileData)
        
        profileChart.setOption({
          series: [{ 
            name: '岗位类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            data: profileData
          }]
        })
        
        console.log('✓ 岗位画像分布图表更新成功')
      } else {
        console.error('✗ profileChart 未初始化')
      }
    } else {
      console.error('✗ 数据格式无效:', data)
      throw new Error('服务器返回的数据格式不正确')
    }
  } catch (error) {
    console.error('=== 获取岗位画像分布数据失败 ===')
    console.error('错误信息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    if (error.response) {
      console.error('HTTP错误:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    }
    
    // 显示友好的错误信息
    console.log('使用默认数据显示图表')
    
    // 使用默认数据初始化图表
    if (profileChart) {
      const defaultData = [
        { value: 8, name: '前端工程师' },
        { value: 6, name: 'AI算法工程师' },
        { value: 5, name: '数据安全分析师' },
        { value: 3, name: 'AIGC内容设计师' },
        { value: 2, name: '其他' }
      ]
      
      profileChart.setOption({
        series: [{ 
          name: '岗位类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          data: defaultData
        }]
      })
    }
  }
}

// 更新图表数据
const updateChartsWithData = (chartData) => {
  console.log('更新图表数据:', chartData)
  
  if (chartData.matchTrend && matchTrendChart) {
    const trendData = chartData.matchTrend.data || chartData.matchTrend
    const trendXAxis = chartData.matchTrend.xAxis || chartData.matchTrend.months || ['1月', '2月', '3月', '4月', '5月', '6月']
    
    matchTrendChart.setOption({
      xAxis: { data: trendXAxis },
      series: [{ data: trendData || [120, 132, 101, 134, 90, 156] }]
    })
  }
  
  if (chartData.profileDistribution && profileChart) {
    const profileData = chartData.profileDistribution.data || chartData.profileDistribution || [
      { value: 8, name: '前端工程师' },
      { value: 6, name: 'AI算法工程师' },
      { value: 5, name: '数据安全分析师' },
      { value: 3, name: 'AIGC内容设计师' },
      { value: 2, name: '其他' }
    ]
    
    profileChart.setOption({
      series: [{ data: profileData }]
    })
  }
  
  if (chartData.trainingProgress && trainingChart) {
    const trainingData = chartData.trainingProgress.data || chartData.trainingProgress || [5, 2, 1]
    
    trainingChart.setOption({
      series: [{ data: trainingData }]
    })
  }
  
  if (chartData.cooperationStats && cooperationChart) {
    const coopData = chartData.cooperationStats.data || chartData.cooperationStats || [3, 2, 2, 3, 2]
    const coopXAxis = chartData.cooperationStats.xAxis || chartData.cooperationStats.schools || ['清华大学', '北京大学', '复旦大学', '上海交大', '浙江大学']
    
    cooperationChart.setOption({
      xAxis: { data: coopXAxis },
      series: [{ data: coopData }]
    })
  }
}

// 获取培训课程完成情况数据
const fetchTrainingStatusData = async () => {
  try {
    console.log('=== 开始获取培训课程完成情况数据 ===')
    console.log('当前token:', localStorage.getItem('token') ? '存在' : '不存在')
    
    const result = await dashboardApi.getTrainingStatus()
    console.log('=== 培训课程完成情况API原始响应 ===')
    console.log('完整响应:', result)
    
    // 处理API响应格式：{ code: 200, message: "Success", data: { completed: 0, ongoing: 0, pending: 1 }, errors: null }
    let trainingData = null
    
    if (result && result.data) {
      console.log('使用data字段中的培训数据')
      trainingData = result.data
    } else if (result) {
      console.log('直接使用响应数据')
      trainingData = result
    }
    
    console.log('=== 处理后的培训课程完成情况数据 ===')
    console.log('培训数据:', trainingData)
    
    if (trainingData && typeof trainingData === 'object') {
      console.log('=== 培训数据字段分析 ===')
      console.log('所有可用字段:', Object.keys(trainingData))
      Object.keys(trainingData).forEach(key => {
        const value = trainingData[key]
        console.log(`  ${key}: ${typeof value} = ${value}`)
      })
      
      // 根据API返回的数据格式转换为图表需要的格式
      const chartData = [
        trainingData.completed || 0, // 已完成
        trainingData.ongoing || 0,   // 进行中
        trainingData.pending || 0    // 待开始
      ]
      
      console.log('=== 转换后的图表数据 ===')
      console.log('图表数据:', chartData)
      console.log('对应关系: [已完成, 进行中, 待开始]')
      
      // 更新培训课程完成情况图表
      if (trainingChart) {
        console.log('=== 更新培训课程完成情况图表 ===')
        
        trainingChart.setOption({
          series: [{
            name: '计划数量',
            type: 'bar',
            data: chartData,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#43e97b' },
                { offset: 1, color: '#38f9d7' }
              ])
            }
          }]
        })
        
        console.log('✓ 培训课程完成情况图表更新成功')
      } else {
        console.error('✗ trainingChart 未初始化')
      }
    } else {
      console.error('✗ 培训数据格式无效:', trainingData)
      throw new Error('服务器返回的培训数据格式不正确')
    }
  } catch (error) {
    console.error('=== 获取培训课程完成情况数据失败 ===')
    console.error('错误信息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    if (error.response) {
      console.error('HTTP错误:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    }
    
    // 显示友好的错误信息
    console.log('使用默认数据显示培训课程完成情况图表')
    
    // 使用默认数据初始化图表
    if (trainingChart) {
      const defaultData = [5, 2, 1] // [已完成, 进行中, 待开始]
      
      trainingChart.setOption({
        series: [{
          name: '计划数量',
          type: 'bar',
          data: defaultData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#43e97b' },
              { offset: 1, color: '#38f9d7' }
            ])
          }
        }]
      })
      
      console.log('使用默认数据:', defaultData)
    }
  }
}

// 获取合作高校统计数据
const fetchCooperationStatsData = async () => {
  try {
    console.log('=== 开始获取合作高校统计数据 ===')
    console.log('当前token:', localStorage.getItem('token') ? '存在' : '不存在')
    
    const result = await dashboardApi.getCooperationStats()
    console.log('=== 合作高校统计API原始响应 ===')
    console.log('完整响应:', result)
    console.log('响应类型:', typeof result)
    console.log('响应键:', result ? Object.keys(result) : 'null')
    
    // 处理不同的响应格式
    let data = result
    if (result && result.data) {
      console.log('使用嵌套的data字段')
      data = result.data
    }
    
    console.log('=== 处理后的合作高校统计数据 ===')
    console.log('数据对象:', data)
    console.log('数据类型:', typeof data)
    
    if (data && typeof data === 'object') {
      console.log('=== 数据字段分析 ===')
      console.log('所有可用字段:', Object.keys(data))
      Object.keys(data).forEach(key => {
        const value = data[key]
        console.log(`  ${key}: ${typeof value} = ${JSON.stringify(value)}`)
      })
      
      // 尝试多种可能的数据字段
      const possibleDataFields = [
        'schools', 'data', 'stats', 'values', 'items', 'list',
        'cooperationStats', 'cooperation_stats', 'universities', 'partners'
      ]
      
      let coopData = null
      let coopSchools = null
      
      // 查找合适的图表数据
      for (const field of possibleDataFields) {
        if (data[field] && Array.isArray(data[field])) {
          console.log(`✓ 找到数据字段 "${field}":`, data[field])
          
          // 检查数据格式
          const fieldData = data[field]
          
          // 如果是简单的数字数组 [3, 2, 2, 3, 2]
          if (fieldData.every(item => typeof item === 'number')) {
            coopData = fieldData
            coopSchools = ['清华大学', '北京大学', '复旦大学', '上海交大', '浙江大学']
            console.log('✓ 识别为数字数组格式:', coopData)
            break
          }
          
          // 如果是对象数组 [{name: '清华大学', value: 3}, ...]
          if (fieldData.every(item => 
            item && typeof item === 'object' && 
            (item.name || item.school) && 
            typeof (item.value || item.count || item.projects) === 'number'
          )) {
            coopSchools = fieldData.map(item => item.name || item.school)
            coopData = fieldData.map(item => item.value || item.count || item.projects)
            console.log('✓ 识别为对象数组格式:', { schools: coopSchools, data: coopData })
            break
          }
          
          // 如果是对象格式 {"清华大学": 3, "北京大学": 2, ...}
          if (fieldData.every(item => 
            item && typeof item === 'object' && 
            Object.keys(item).length === 2 &&
            Object.values(item).some(val => typeof val === 'string') &&
            Object.values(item).some(val => typeof val === 'number')
          )) {
            // 处理形如 [{school: "清华大学", count: 3}, ...] 的数据
            if (fieldData[0].school && fieldData[0].count) {
              coopSchools = fieldData.map(item => item.school)
              coopData = fieldData.map(item => item.count)
              console.log('✓ 识别为school-count格式:', { schools: coopSchools, data: coopData })
              break
            }
          }
        }
      }
      
      // 如果没找到数组字段，检查数据本身是否是数组
      if (!coopData && Array.isArray(data)) {
        console.log('✓ 数据本身是数组:', data)
        if (data.every(item => typeof item === 'number')) {
          coopData = data
          coopSchools = ['清华大学', '北京大学', '复旦大学', '上海交大', '浙江大学']
        } else if (data.every(item => item && typeof item === 'object' && (item.name || item.school))) {
          coopSchools = data.map(item => item.name || item.school)
          coopData = data.map(item => item.value || item.count || item.projects)
        }
      }
      
      // 如果是对象格式，尝试转换
      if (!coopData && typeof data === 'object' && !Array.isArray(data)) {
        // 尝试识别 {"清华大学": 3, "北京大学": 2, ...} 格式
        const keys = Object.keys(data)
        const values = Object.values(data)
        
        if (keys.every(key => typeof key === 'string') && 
            values.every(val => typeof val === 'number')) {
          coopSchools = keys
          coopData = values
          console.log('✓ 转换对象格式为图表数据:', { schools: coopSchools, data: coopData })
        }
      }
      
      // 如果还是没找到，使用默认数据
      if (!coopData || !coopSchools) {
        coopData = [3, 2, 2, 3, 2]
        coopSchools = ['清华大学', '北京大学', '复旦大学', '上海交大', '浙江大学']
        console.log('⚠ 未找到有效数据，使用默认数据:', { schools: coopSchools, data: coopData })
      }
      
      // 确保数据长度一致
      const minLength = Math.min(coopData.length, coopSchools.length)
      coopData = coopData.slice(0, minLength)
      coopSchools = coopSchools.slice(0, minLength)
      
      console.log('=== 最终图表数据 ===')
      console.log('高校名称:', coopSchools)
      console.log('合作数量:', coopData)
      
      // 更新合作高校统计图表
      if (cooperationChart) {
        console.log('=== 更新合作高校统计图表 ===')
        
        cooperationChart.setOption({
          xAxis: { 
            data: coopSchools,
            axisLabel: {
              rotate: coopSchools.some(name => name.length > 4) ? 45 : 0
            }
          },
          series: [{
            name: '合作项目数',
            type: 'bar',
            data: coopData,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#4facfe' },
                { offset: 1, color: '#00f2fe' }
              ])
            }
          }]
        })
        
        console.log('✓ 合作高校统计图表更新成功')
      } else {
        console.error('✗ cooperationChart 未初始化')
      }
    } else {
      console.error('✗ 数据格式无效:', data)
      throw new Error('服务器返回的数据格式不正确')
    }
  } catch (error) {
    console.error('=== 获取合作高校统计数据失败 ===')
    console.error('错误信息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    if (error.response) {
      console.error('HTTP错误:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    }
    
    // 显示友好的错误信息
    console.log('使用默认数据显示合作高校统计图表')
    
    // 使用默认数据初始化图表
    if (cooperationChart) {
      const defaultData = [3, 2, 2, 3, 2]
      const defaultSchools = ['清华大学', '北京大学', '复旦大学', '上海交大', '浙江大学']
      
      cooperationChart.setOption({
        xAxis: { data: defaultSchools },
        series: [{
          name: '合作项目数',
          type: 'bar',
          data: defaultData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4facfe' },
              { offset: 1, color: '#00f2fe' }
            ])
          }
        }]
      })
      
      console.log('使用默认数据:', { schools: defaultSchools, data: defaultData })
    }
  }
}

// 获取最近活动记录数据
const fetchActivitiesData = async () => {
  try {
    console.log('=== 开始获取最近活动记录数据 ===')
    console.log('当前token:', localStorage.getItem('token') ? '存在' : '不存在')
    console.log('API基础URL:', import.meta.env.VITE_API_BASE_URL)
    console.log('请求端点:', '/enterprise/dashboard/activities')
    console.log('完整URL:', `${import.meta.env.VITE_API_BASE_URL}/enterprise/dashboard/activities`)
    console.log('更新前的活动数据:', activities.value)
    
    const result = await dashboardApi.getActivities()
    console.log('=== 最近活动记录API原始响应 ===')
    console.log('完整响应:', result)
    
    // 强制更新：不管什么格式都尝试更新
    let activitiesArray = null
    
    // 1. 检查result.data
    if (result && result.data) {
      console.log('检查result.data...')
      if (Array.isArray(result.data)) {
        activitiesArray = result.data
        console.log('✓ result.data是数组:', activitiesArray)
      } else if (result.data.activities && Array.isArray(result.data.activities)) {
        activitiesArray = result.data.activities
        console.log('✓ result.data.activities是数组:', activitiesArray)
      }
    }
    
    // 2. 检查result本身
    if (!activitiesArray && result) {
      console.log('检查result本身...')
      if (Array.isArray(result)) {
        activitiesArray = result
        console.log('✓ result本身是数组:', activitiesArray)
      }
    }
    
    // 3. 强制创建测试数据（用于验证API是否工作）
    if (!activitiesArray) {
      console.log('⚠ 未找到数组数据，创建测试数据验证API连接')
      // 如果到达这里说明API调用成功了，但返回格式不是我们期望的
      // 创建一个明显的测试数据来替换默认数据
      activitiesArray = [
        {
          id: 'test-' + Date.now(),
          title: '[API测试] 后端连接成功',
          content: 'API调用成功，时间:' + new Date().toLocaleTimeString(),
          time: new Date().toLocaleString('zh-CN')
        }
      ]
      console.log('✓ 创建测试数据:', activitiesArray)
    }
    
    if (activitiesArray && activitiesArray.length > 0) {
      console.log('=== 准备更新活动数据 ===')
      console.log('新活动数据:', activitiesArray)
      
      // 直接更新活动列表
      activities.value = activitiesArray.map((item, index) => ({
        id: item.id || index + 1,
        title: item.title || item.activity || item.event || item.name || '未知活动',
        content: item.content || item.description || item.detail || item.message || '暂无描述',
        time: formatTime(item.time || item.timestamp || item.date || item.created_at || item.createTime)
      }))
      
      console.log('✓ 活动列表已更新:', activities.value)
      console.log('更新后的活动数量:', activities.value.length)
      
      // 验证更新是否生效
      console.log('验证更新是否生效 - 第一个活动:', activities.value[0])
    } else {
      console.log('⚠ 没有有效的活动数据')
    }
    
  } catch (error) {
    console.error('=== 获取最近活动记录数据失败 ===')
    console.error('错误类型:', error.name)
    console.error('错误信息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    if (error.response) {
      console.error('HTTP错误详情:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.response.config?.url,
        data: error.response.data
      })
    } else if (error.request) {
      console.error('网络错误 - 请求已发送但无响应')
      console.error('请求URL:', error.config?.url)
    } else {
      console.error('请求配置错误:', error.config)
    }
    
    console.log('❌ API调用失败，保持默认数据')
  }
}

// 时间格式化函数
const formatTime = (timeValue) => {
  if (!timeValue) {
    console.warn('⚠ 时间值为空，使用当前时间')
    return new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  try {
    const date = new Date(timeValue)
    if (isNaN(date.getTime())) {
      console.warn('⚠ 无效的时间格式，使用原值:', timeValue)
      return String(timeValue)
    }
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.warn('⚠ 时间格式化失败，使用原值:', timeValue, error)
    return String(timeValue)
  }
}

// 测试API连接
const testApiConnection = async () => {
  try {
    console.log('=== 测试API连接 ===')
    
    // 测试最简单的统计API
    console.log('测试统计数据API...')
    const statsResult = await dashboardApi.getStats()
    console.log('统计数据API成功:', statsResult)
    
    // 测试活动API
    console.log('测试活动API...')
    const activitiesResult = await dashboardApi.getActivities()
    console.log('活动API成功:', activitiesResult)
    
  } catch (error) {
    console.error('=== API连接测试失败 ===')
    console.error('错误类型:', error.name)
    console.error('错误信息:', error.message)
    
    if (error.response) {
      console.error('HTTP状态:', error.response.status)
      console.error('响应数据:', error.response.data)
      console.error('响应头:', error.response.headers)
    } else if (error.request) {
      console.error('请求已发送但无响应:', error.request)
    } else {
      console.error('请求配置错误:', error.config)
    }
  }
}

onMounted(async () => {
  console.log('Dashboard组件开始挂载...')
  
  await nextTick(() => {
    // 初始化图表
    console.log('初始化图表...')
    initMatchTrendChart()
    initProfileChart()
    initTrainingChart()
    initCooperationChart()
    
    // 获取统计数据
    console.log('开始获取统计数据...')
    fetchStatsData()
    
    // 获取课程匹配趋势数据
    console.log('开始获取课程匹配趋势数据...')
    fetchMatchTrendData()
    
    // 获取岗位画像分布数据
    console.log('开始获取岗位画像分布数据...')
    fetchProfileDistributionData()
    
    // 获取培训课程完成情况数据
    console.log('开始获取培训课程完成情况数据...')
    fetchTrainingStatusData()
    
    // 获取合作高校统计数据
    console.log('开始获取合作高校统计数据...')
    fetchCooperationStatsData()
    
    // 获取最近活动记录数据
    console.log('开始获取最近活动记录数据...')
    fetchActivitiesData()
    
    // 测试API连接
    console.log('开始测试API连接...')
    testApiConnection()
    
    // 监听窗口大小变化
    window.addEventListener('resize', resizeCharts)
  })
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stats-row {
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
          
          .stat-title {
            font-size: 14px;
            color: var(--text-secondary);
          }
        }
      }
    }
  }
  
  .charts-row {
    margin-bottom: 20px;
    
    .chart-card {
      .card-header {
        font-weight: 600;
        font-size: 16px;
        color: var(--text-primary);
      }
      
      .chart-container {
        width: 100%;
        height: 300px;
      }
    }
  }
  
  .activity-card {
    position: sticky;
    top: 20px;
    height: fit-content;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    
    .card-header {
      font-weight: 600;
      font-size: 16px;
      color: var(--text-primary);
    }
    
    .el-timeline {
      margin-top: 10px;
      
      .el-timeline-item {
        :deep(.el-card) {
          margin-bottom: 10px;
          
          h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
          }
          
          p {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
          }
        }
      }
    }
  }
  
  // 小屏幕下取消 sticky 定位
  @media (max-width: 768px) {
    .activity-card {
      position: static;
      max-height: none;
    }
  }
}
</style>

