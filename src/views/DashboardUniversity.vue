<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card card-hover" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
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
              <span>课程切片统计</span>
            </div>
          </template>
          <div ref="courseSliceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>提案审批状态</span>
            </div>
          </template>
          <div ref="proposalChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>教学反馈趋势</span>
            </div>
          </template>
          <div ref="feedbackChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>校企合作统计</span>
            </div>
          </template>
          <div ref="cooperationChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
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
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Document, EditPen, DataAnalysis, Connection } from '@element-plus/icons-vue'
import { dashboardApiUniversity } from '@/api/university'

const stats = ref([
  { title: '课程切片', value: '0', icon: 'Document', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '待审批提案', value: '0', icon: 'EditPen', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '教学反馈', value: '0', icon: 'DataAnalysis', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '合作企业', value: '0', icon: 'Connection', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

const loading = ref(false)

const courseSliceChartRef = ref(null)
const proposalChartRef = ref(null)
const feedbackChartRef = ref(null)
const cooperationChartRef = ref(null)

// 保存图表实例
let courseSliceChart = null
let proposalChart = null
let feedbackChart = null
let cooperationChart = null

const activities = ref([])

// 加载最近活动
const loadActivities = async () => {
  try {
    const result = await dashboardApiUniversity.getActivities({ page: 1, size: 10 })
    console.log('最近活动:', result)

    // 提取数据（支持嵌套 data 结构）
    const data = result.data?.data || result.data || result
    activities.value = data.list || data.activities || []
  } catch (error) {
    console.error('加载最近活动失败:', error)
  }
}

// 加载统计数据
const loadStats = async () => {
  loading.value = true
  try {
    const result = await dashboardApiUniversity.getStats()
    console.log('统计数据:', result)

    // 根据 API 返回的数据格式更新统计值
    const data = result.data || result
    stats.value[0].value = data.courseSliceCount || data.course_slice_count || 0
    stats.value[1].value = data.pendingProposalCount || data.pending_proposal_count || 0
    stats.value[2].value = data.feedbackCount || data.feedback_count || 0
    stats.value[3].value = data.cooperationCount || data.cooperation_count || 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载课程切片统计
const loadCourseSliceStats = async () => {
  try {
    const result = await dashboardApiUniversity.getCourseSliceStats()
    console.log('课程切片统计:', result)

    // 提取数据（支持嵌套 data 结构）
    const chartData = result.data?.data || result.data || result
    console.log('课程切片图表数据:', chartData)

    // 更新课程切片图表
    if (courseSliceChart) {
      courseSliceChart.setOption({
        xAxis: { data: chartData.labels || [] },
        series: [{
          data: chartData.values || []
        }]
      })
    }
  } catch (error) {
    console.error('加载课程切片统计失败:', error)
  }
}

// 加载提案审批状态统计
const loadProposalStats = async () => {
  try {
    const result = await dashboardApiUniversity.getProposalStats()
    console.log('提案审批状态统计:', result)

    // 提取数据
    const data = result.data || result
    console.log('提案审批状态数据:', data)

    // 更新提案审批状态图表
    if (proposalChart) {
      proposalChart.setOption({
        series: [{
          data: [
            { value: data.pending || 0, name: '待审批' },
            { value: data.approved || 0, name: '已通过' },
            { value: data.rejected || 0, name: '已拒绝' }
          ]
        }]
      })
    }
  } catch (error) {
    console.error('加载提案审批状态统计失败:', error)
  }
}

// 加载校企合作统计
const loadCooperationStats = async () => {
  try {
    const result = await dashboardApiUniversity.getCooperationStats()
    console.log('校企合作统计:', result)

    // 提取数据（支持嵌套 data 结构）
    const chartData = result.data?.data || result.data || result
    console.log('校企合作图表数据:', chartData)

    // 更新校企合作图表
    if (cooperationChart) {
      cooperationChart.setOption({
        xAxis: {
          data: chartData.map(item => item.industry || item.label || '')
        },
        series: [{
          data: chartData.map(item => item.count || item.value || 0)
        }]
      })
    }
  } catch (error) {
    console.error('加载校企合作统计失败:', error)
  }
}

onMounted(() => {
  // 加载统计数据
  loadStats()

  nextTick(() => {
    initCharts()
    // 初始化图表后再加载图表数据
    loadCourseSliceStats()
    loadProposalStats()
    loadCooperationStats()
    loadActivities()
  })
})

const initCharts = () => {
  // 课程切片统计
  courseSliceChart = echarts.init(courseSliceChartRef.value)
  courseSliceChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value' },
    series: [{
      data: [],
      type: 'bar',
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#667eea' },
        { offset: 1, color: '#764ba2' }
      ]) }
    }]
  })

  // 提案审批状态
  proposalChart = echarts.init(proposalChartRef.value)
  proposalChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      data: [],
      itemStyle: {
        color: (params) => {
          const colors = ['#f093fb', '#43e97b', '#f5576c']
          return colors[params.dataIndex]
        }
      }
    }]
  })

  // 教学反馈趋势
  feedbackChart = echarts.init(feedbackChartRef.value)
  feedbackChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value' },
    series: [{
      data: [120, 132, 101, 134, 90, 230],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#4facfe' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(79, 172, 254, 0.3)' },
        { offset: 1, color: 'rgba(79, 172, 254, 0.1)' }
      ]) }
    }]
  })

  // 校企合作统计
  cooperationChart = echarts.init(cooperationChartRef.value)
  cooperationChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['互联网', '金融', '制造业', '教育', '其他'] },
    yAxis: { type: 'value' },
    series: [{
      data: [12, 8, 5, 2, 1],
      type: 'bar',
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#43e97b' },
        { offset: 1, color: '#38f9d7' }
      ]) }
    }]
  })
}
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
        color: var(--text-primary);
      }
      
      .chart-container {
        height: 300px;
      }
    }
  }
  
  .activity-card {
    .card-header {
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}
</style>

