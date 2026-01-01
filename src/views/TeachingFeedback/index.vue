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
            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
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
      v-loading="detailLoading"
    >
      <el-descriptions :column="1" border v-if="currentFeedback">
        <el-descriptions-item label="课程名称">{{ currentFeedback.courseName }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentFeedback.studentName }}</el-descriptions-item>
        <el-descriptions-item label="反馈类型">
          <el-tag :type="getTypeTag(currentFeedback.type)">{{ getTypeText(currentFeedback.type) }}</el-tag>
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
import { teachingFeedbackApi } from '@/api/university'

const stats = ref([
  { title: '总反馈数', value: '0', icon: 'DataAnalysis', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { title: '平均评分', value: '0', icon: 'ChatLineRound', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '课程评价', value: '0', icon: 'Document', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '参与学生', value: '0', icon: 'User', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

const filterCourse = ref('')
const dateRange = ref('')
const filterType = ref('')
const loading = ref(false)
const detailDialogVisible = ref(false)
const detailLoading = ref(false)

const scoreTrendChartRef = ref(null)
const typeChartRef = ref(null)
const satisfactionChartRef = ref(null)
const wordCloudChartRef = ref(null)

// 保存图表实例
let scoreTrendChart = null
let typeChart = null
let satisfactionChart = null
let wordCloudChart = null

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const feedbackList = ref([])

const currentFeedback = ref(null)

// 加载教学反馈列表
const loadFeedbackList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size
    }

    if (filterCourse.value) {
      params.course = filterCourse.value
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    if (filterType.value) {
      params.type = filterType.value
    }

    const result = await teachingFeedbackApi.getList(params)
    console.log('教学反馈列表:', result)

    // 提取数据（支持嵌套 data 结构）
    const data = result.data?.data || result.data || result
    feedbackList.value = data.list || []
    pagination.value.total = data.total || 0
  } catch (error) {
    console.error('加载教学反馈列表失败:', error)
    ElMessage.error('加载教学反馈列表失败')
  } finally {
    loading.value = false
  }
}

const getTypeTag = (type) => {
  const typeMap = {
    'course': 'primary',
    'suggestion': 'success',
    'issue': 'warning',
    '课程评价': 'primary',
    '教学建议': 'success',
    '问题反馈': 'warning'
  }
  return typeMap[type] || ''
}

const getTypeText = (type) => {
  const typeMap = {
    'course': '课程评价',
    'suggestion': '教学建议',
    'issue': '问题反馈'
  }
  return typeMap[type] || type
}

const handleFilter = () => {
  pagination.value.page = 1
  loadFeedbackList()
  loadStats()
  loadChartData()
}

const handleReset = () => {
  filterCourse.value = ''
  dateRange.value = ''
  filterType.value = ''
  pagination.value.page = 1
  loadFeedbackList()
  loadStats()
  loadChartData()
}

const handleView = async (row) => {
  detailLoading.value = true
  detailDialogVisible.value = true
  try {
    const result = await teachingFeedbackApi.getDetail(row.id)
    console.log('教学反馈详情:', result)

    // 提取数据（支持嵌套 data 结构）
    const data = result.data?.data || result.data || result
    currentFeedback.value = data
  } catch (error) {
    console.error('加载教学反馈详情失败:', error)
    ElMessage.error('加载教学反馈详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  loadFeedbackList()
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadFeedbackList()
}

// 加载统计数据
const loadStats = async () => {
  try {
    const params = {}
    if (filterCourse.value) {
      params.course_id = filterCourse.value
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const result = await teachingFeedbackApi.getStats(params)
    console.log('教学反馈统计:', result)

    // 提取数据（支持嵌套 data 结构）
    const data = result.data?.data || result.data || result
    stats.value[0].value = data.totalCount || 0
    stats.value[1].value = data.averageScore || 0
    stats.value[2].value = data.courseEvaluationCount || 0
    stats.value[3].value = data.studentCount || 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载图表数据
const loadChartData = async () => {
  try {
    const params = {}
    if (filterCourse.value) {
      params.course_id = filterCourse.value
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const result = await teachingFeedbackApi.getTrend(params)
    console.log('教学反馈趋势:', result)

    // 提取数据（支持嵌套 data 结构）
    const data = result.data?.data || result.data || result

    // 更新课程评分趋势
    if (scoreTrendChart && data.score_trend) {
      scoreTrendChart.setOption({
        xAxis: { data: data.score_trend.labels || [] },
        series: [{ data: data.score_trend.values || [] }]
      })
    }

    // 更新反馈类型分布
    if (typeChart && data.type_distribution) {
      typeChart.setOption({
        series: [{
          data: data.type_distribution.map(item => ({
            value: item.value,
            name: item.name
          }))
        }]
      })
    }

    // 更新课程满意度对比
    if (satisfactionChart && data.satisfaction_comparison) {
      satisfactionChart.setOption({
        xAxis: { data: data.satisfaction_comparison.map(item => item.course) },
        series: [{
          data: data.satisfaction_comparison.map(item => item.score)
        }]
      })
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

onMounted(() => {
  // 加载反馈列表和统计数据
  loadFeedbackList()
  loadStats()

  nextTick(() => {
    initCharts()
    // 初始化图表后加载图表数据
    loadChartData()
  })
})

const initCharts = () => {
  // 课程评分趋势
  scoreTrendChart = echarts.init(scoreTrendChartRef.value)
  scoreTrendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value', min: 0, max: 5 },
    series: [{
      data: [],
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
  typeChart = echarts.init(typeChartRef.value)
  typeChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      data: [],
      itemStyle: {
        color: (params) => {
          const colors = ['#667eea', '#43e97b', '#f5576c']
          return colors[params.dataIndex]
        }
      }
    }]
  })

  // 课程满意度对比
  satisfactionChart = echarts.init(satisfactionChartRef.value)
  satisfactionChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value', min: 0, max: 5 },
    series: [{
      data: [],
      type: 'bar',
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#4facfe' },
        { offset: 1, color: '#00f2fe' }
      ]) }
    }]
  })

  // 词云图（简化版，实际需要使用echarts-wordcloud插件）
  wordCloudChart = echarts.init(wordCloudChartRef.value)
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

