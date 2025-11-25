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
              <span>培训计划完成情况</span>
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
import { User, Connection, Document, Calendar } from '@element-plus/icons-vue'

const stats = ref([
  { title: '岗位画像', value: '24', icon: 'User', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '课程匹配', value: '156', icon: 'Connection', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '合作项目', value: '12', icon: 'Document', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '培训计划', value: '8', icon: 'Calendar', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

const matchTrendChartRef = ref(null)
const profileChartRef = ref(null)
const trainingChartRef = ref(null)
const cooperationChartRef = ref(null)

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
    title: '培训计划完成',
    content: '新员工入职培训计划已完成，培训周期缩短至2周',
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

onMounted(() => {
  nextTick(() => {
    initMatchTrendChart()
    initProfileChart()
    initTrainingChart()
    initCooperationChart()
    
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
    .card-header {
      font-weight: 600;
      font-size: 16px;
      color: var(--text-primary);
    }
  }
}
</style>

