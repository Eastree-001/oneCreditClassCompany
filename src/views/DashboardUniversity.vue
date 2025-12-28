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

const stats = ref([
  { title: '课程切片', value: '128', icon: 'Document', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '待审批提案', value: '15', icon: 'EditPen', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '教学反馈', value: '342', icon: 'DataAnalysis', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '合作企业', value: '28', icon: 'Connection', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

const courseSliceChartRef = ref(null)
const proposalChartRef = ref(null)
const feedbackChartRef = ref(null)
const cooperationChartRef = ref(null)

const activities = ref([
  { id: 1, title: '新增课程切片', content: '《Java程序设计》课程已创建5个技能切片', time: '2024-01-15 10:30' },
  { id: 2, title: '提案审批', content: '《人工智能专业共建》提案已通过审批', time: '2024-01-15 09:20' },
  { id: 3, title: '教学反馈', content: '收到15条新的教学反馈数据', time: '2024-01-14 16:45' },
  { id: 4, title: '校企合作', content: '与XX科技公司签署合作协议', time: '2024-01-14 14:20' }
])

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

const initCharts = () => {
  // 课程切片统计
  const courseSliceChart = echarts.init(courseSliceChartRef.value)
  courseSliceChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Java', 'Python', '前端', '数据库', '算法', '其他'] },
    yAxis: { type: 'value' },
    series: [{
      data: [32, 28, 24, 18, 15, 11],
      type: 'bar',
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#667eea' },
        { offset: 1, color: '#764ba2' }
      ]) }
    }]
  })

  // 提案审批状态
  const proposalChart = echarts.init(proposalChartRef.value)
  proposalChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      data: [
        { value: 8, name: '待审批' },
        { value: 5, name: '已通过' },
        { value: 2, name: '已拒绝' }
      ],
      itemStyle: {
        color: (params) => {
          const colors = ['#f093fb', '#43e97b', '#f5576c']
          return colors[params.dataIndex]
        }
      }
    }]
  })

  // 教学反馈趋势
  const feedbackChart = echarts.init(feedbackChartRef.value)
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
  const cooperationChart = echarts.init(cooperationChartRef.value)
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

