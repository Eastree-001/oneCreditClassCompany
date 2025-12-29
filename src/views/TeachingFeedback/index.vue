<template>
  <div class="teaching-feedback">
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

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20" align="middle">
        <el-col :span="4">
          <el-select v-model="filterCourse" placeholder="选择课程" clearable>
            <el-option label="Java程序设计" value="java" />
            <el-option label="Python数据分析" value="python" />
            <el-option label="Vue.js前端开发" value="vue" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterType" placeholder="反馈类型" clearable>
            <el-option label="课程评价" value="course" />
            <el-option label="教学建议" value="suggestion" />
            <el-option label="问题反馈" value="issue" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>课程评分趋势</span>
            </div>
          </template>
          <div ref="scoreTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>反馈类型分布</span>
            </div>
          </template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>课程满意度对比</span>
            </div>
          </template>
          <div ref="satisfactionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>教学改进建议词云</span>
            </div>
          </template>
          <div ref="wordCloudChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 反馈列表 -->
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>反馈详情列表</span>
        </div>
      </template>
      <el-table :data="feedbackList" v-loading="loading" stripe>
        <el-table-column prop="courseName" label="课程名称" width="180" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="type" label="反馈类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="评分" width="100" align="center">
          <template #default="{ row }">
            <el-rate v-model="row.score" disabled show-score />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="反馈内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="feedbackTime" label="反馈时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看详情</el-button>
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
      title="反馈详情"
      width="700px"
    >
      <el-descriptions :column="1" border v-if="currentFeedback">
        <el-descriptions-item label="课程名称">{{ currentFeedback.courseName }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentFeedback.studentName }}</el-descriptions-item>
        <el-descriptions-item label="反馈类型">
          <el-tag :type="getTypeTag(currentFeedback.type)">{{ currentFeedback.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="评分">
          <el-rate v-model="currentFeedback.score" disabled show-score />
        </el-descriptions-item>
        <el-descriptions-item label="反馈内容">
          <div class="feedback-content">{{ currentFeedback.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="反馈时间">{{ currentFeedback.feedbackTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { DataAnalysis, ChatLineRound, Document, User } from '@element-plus/icons-vue'

const stats = ref([
  { title: '总反馈数', value: '342', icon: 'DataAnalysis', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '平均评分', value: '4.6', icon: 'ChatLineRound', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '课程评价', value: '256', icon: 'Document', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '参与学生', value: '128', icon: 'User', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

const filterCourse = ref('')
const dateRange = ref('')
const filterType = ref('')
const loading = ref(false)
const detailDialogVisible = ref(false)

const scoreTrendChartRef = ref(null)
const typeChartRef = ref(null)
const satisfactionChartRef = ref(null)
const wordCloudChartRef = ref(null)

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const feedbackList = ref([
  {
    id: 1,
    courseName: 'Java程序设计',
    studentName: '张三',
    type: '课程评价',
    score: 5,
    content: '课程内容很丰富，老师讲解清晰，实践项目很有帮助。',
    feedbackTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    courseName: 'Python数据分析',
    studentName: '李四',
    type: '教学建议',
    score: 4,
    content: '建议增加更多实际案例，让学习更有针对性。',
    feedbackTime: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    courseName: 'Vue.js前端开发',
    studentName: '王五',
    type: '问题反馈',
    score: 4,
    content: '课程视频有些地方不够清晰，希望能优化一下。',
    feedbackTime: '2024-01-13 09:15:00'
  }
])

const currentFeedback = ref(null)

const getTypeTag = (type) => {
  const typeMap = {
    '课程评价': 'primary',
    '教学建议': 'success',
    '问题反馈': 'warning'
  }
  return typeMap[type] || ''
}

const handleFilter = () => {
  ElMessage.info('筛选功能待实现')
}

const handleReset = () => {
  filterCourse.value = ''
  dateRange.value = ''
  filterType.value = ''
}

const handleView = (row) => {
  currentFeedback.value = row
  detailDialogVisible.value = true
}

const handleSizeChange = (size) => {
  pagination.value.size = size
}

const handlePageChange = (page) => {
  pagination.value.page = page
}

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

const initCharts = () => {
  // 课程评分趋势
  const scoreTrendChart = echarts.init(scoreTrendChartRef.value)
  scoreTrendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value', min: 0, max: 5 },
    series: [{
      data: [4.2, 4.5, 4.3, 4.7, 4.6, 4.8],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#667eea' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
        { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
      ]) }
    }]
  })

  // 反馈类型分布
  const typeChart = echarts.init(typeChartRef.value)
  typeChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      data: [
        { value: 256, name: '课程评价' },
        { value: 62, name: '教学建议' },
        { value: 24, name: '问题反馈' }
      ],
      itemStyle: {
        color: (params) => {
          const colors = ['#667eea', '#43e97b', '#f5576c']
          return colors[params.dataIndex]
        }
      }
    }]
  })

  // 课程满意度对比
  const satisfactionChart = echarts.init(satisfactionChartRef.value)
  satisfactionChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Java', 'Python', 'Vue.js', 'MySQL', '算法'] },
    yAxis: { type: 'value', min: 0, max: 5 },
    series: [{
      data: [4.8, 4.6, 4.7, 4.5, 4.9],
      type: 'bar',
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#4facfe' },
        { offset: 1, color: '#00f2fe' }
      ]) }
    }]
  })

  // 词云图（简化版，实际需要使用echarts-wordcloud插件）
  const wordCloudChart = echarts.init(wordCloudChartRef.value)
  wordCloudChart.setOption({
    tooltip: {},
    series: [{
      type: 'wordCloud',
      gridSize: 2,
      sizeRange: [12, 50],
      rotationRange: [-90, 90],
      shape: 'pentagon',
      width: '100%',
      height: '100%',
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: () => {
          return 'rgb(' + [
            Math.round(Math.random() * 255),
            Math.round(Math.random() * 255),
            Math.round(Math.random() * 255)
          ].join(',') + ')'
        }
      },
      data: [
        { name: '实践项目', value: 100 },
        { name: '案例教学', value: 80 },
        { name: '互动性', value: 60 },
        { name: '课程内容', value: 50 },
        { name: '教学方法', value: 40 }
      ]
    }]
  })
}
</script>

<style lang="scss" scoped>
.teaching-feedback {
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

  .filter-card {
    margin-bottom: 20px;
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

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .feedback-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--text-regular);
  }
}
</style>

