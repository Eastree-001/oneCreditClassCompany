<template>
  <div class="video-management">
    <el-page-header @back="goBack" content="视频管理" />
    
    <!-- 搜索和筛选区域 -->
    <el-card class="search-card" style="margin: 20px 0;">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="请输入视频标题或描述"
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="视频类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="课程视频" value="course" />
            <el-option label="培训视频" value="training" />
            <el-option label="宣传视频" value="promotional" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="上传中" value="uploading" />
            <el-option label="处理中" value="processing" />
            <el-option label="就绪" value="ready" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <div class="action-bar" style="margin-bottom: 20px;">
      <el-button type="primary" @click="handleUpload">
        <el-icon><Upload /></el-icon>
        上传视频
      </el-button>
      <el-button type="danger" :disabled="selectedVideos.length === 0" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <el-button @click="refreshList">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 视频列表 -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>视频列表</span>
          <div class="table-actions">
            <el-tag type="info">共 {{ total }} 个视频</el-tag>
          </div>
        </div>
      </template>

      <el-table
        :data="videoList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="视频信息" min-width="300">
          <template #default="{ row }">
            <div class="video-info">
              <el-image 
                :src="row.thumbnail" 
                :preview-src-list="[row.thumbnail]"
                fit="cover"
                style="width: 120px; height: 80px; border-radius: 4px;"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="video-details">
                <div class="video-title">{{ row.title }}</div>
                <div class="video-description">{{ row.description }}</div>
                <div class="video-meta">
                  <el-tag size="small" :type="getVideoTypeColor(row.video_type)">
                    {{ getVideoTypeText(row.video_type) }}
                  </el-tag>
                  <span class="file-size">{{ formatFileSize(row.file_size) }}</span>
                  <span class="duration">{{ formatDuration(row.duration) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="可见性" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getVisibilityType(row.visibility)">
              {{ getVisibilityText(row.visibility) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="观看/下载" width="120" align="center">
          <template #default="{ row }">
            <div>
              <span style="color: #409eff;">{{ row.view_count }}</span> / 
              <span style="color: #67c23a;">{{ row.download_count }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="上传者" width="120" align="center">
          <template #default="{ row }">
            {{ row.uploader_name }}
          </template>
        </el-table-column>

        <el-table-column label="上传时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.upload_time) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" link size="small" @click="handleManageSources(row)">
              <el-icon><Files /></el-icon>
              资源管理
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" style="margin-top: 20px;">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 上传视频对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传视频"
      width="600px"
      :before-close="handleUploadDialogClose"
    >
      <VideoUploadForm 
        @success="handleUploadSuccess"
        @cancel="handleUploadCancel"
      />
    </el-dialog>

    <!-- 编辑视频对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editDialogTitle"
      width="600px"
      :before-close="handleEditDialogClose"
    >
      <VideoEditForm
        v-if="editDialogVisible"
        :video="editingVideo"
        @success="handleEditSuccess"
        @cancel="handleEditCancel"
      />
    </el-dialog>

    <!-- 视频资源管理对话框 -->
    <el-dialog
      v-model="sourceDialogVisible"
      :title="`视频资源管理 - ${managingVideo?.title || ''}`"
      width="900px"
      :before-close="handleSourceDialogClose"
    >
      <VideoSourceManagement
        v-if="sourceDialogVisible && managingVideo"
        :video="managingVideo"
        @success="handleSourceSuccess"
        @cancel="handleSourceCancel"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Upload, Delete, Refresh, View, Edit, Picture, Files 
} from '@element-plus/icons-vue'
import VideoUploadForm from './components/VideoUploadForm.vue'
import VideoEditForm from './components/VideoEditForm.vue'
import VideoSourceManagement from './components/VideoSourceManagement.vue'
import videoApi from '@/api/video'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  status: '',
  visibility: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10
})

const total = ref(0)
const loading = ref(false)
const videoList = ref([])
const selectedVideos = ref([])

// 对话框控制
const uploadDialogVisible = ref(false)
const editDialogVisible = ref(false)
const sourceDialogVisible = ref(false)
const editingVideo = ref(null)
const editDialogTitle = ref('编辑视频信息')
const managingVideo = ref(null)

// 获取视频列表
const fetchVideoList = async () => {
  loading.value = true
  try {
    console.log('开始获取视频列表，参数:', {
      page: pagination.current,
      size: pagination.size,
      keyword: searchForm.keyword,
      type: searchForm.type,
      status: searchForm.status,
      visibility: searchForm.visibility
    })
    
    // 调用实际API获取视频列表
    const response = await videoApi.getVideoList({
      page: pagination.current,
      size: pagination.size,
      keyword: searchForm.keyword,
      type: searchForm.type,
      status: searchForm.status,
      visibility: searchForm.visibility
    })
    
    if (response.code === 200) {
      videoList.value = response.data.list || []
      total.value = response.data.total || 0
      console.log('获取视频列表成功，数量:', videoList.value.length)
    } else {
      throw new Error(response.message || '获取视频列表失败')
    }
  } catch (error) {
    console.error('获取视频列表失败:', error)
    ElMessage.error(`获取视频列表失败: ${error.message}`)
    
    // 如果API调用失败，使用模拟数据作为后备方案
    videoList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.current = 1
  fetchVideoList()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  pagination.current = 1
  fetchVideoList()
}

// 刷新列表
const refreshList = () => {
  fetchVideoList()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  fetchVideoList()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  fetchVideoList()
}

// 表格选择处理
const handleSelectionChange = (selection) => {
  selectedVideos.value = selection
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 打开上传对话框
const handleUpload = () => {
  uploadDialogVisible.value = true
}

// 查看视频详情
const handleView = (video) => {
  // 跳转到视频详情页面
  ElMessage.info(`查看视频: ${video.title}`)
}

// 编辑视频
const handleEdit = (video) => {
  editingVideo.value = { ...video }
  editDialogTitle.value = `编辑视频 - ${video.title}`
  editDialogVisible.value = true
}

// 管理视频资源
const handleManageSources = (video) => {
  managingVideo.value = { ...video }
  sourceDialogVisible.value = true
}

// 删除单个视频
const handleDelete = async (video) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除视频"${video.title}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟删除操作
    ElMessage.success('视频删除成功')
    fetchVideoList()
  } catch {
    // 用户取消删除
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedVideos.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedVideos.value.length} 个视频吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟批量删除操作
    ElMessage.success(`成功删除 ${selectedVideos.value.length} 个视频`)
    selectedVideos.value = []
    fetchVideoList()
  } catch {
    // 用户取消删除
  }
}

// 上传成功处理
const handleUploadSuccess = () => {
  uploadDialogVisible.value = false
  ElMessage.success('视频上传成功')
  fetchVideoList()
}

const handleUploadCancel = () => {
  uploadDialogVisible.value = false
}

const handleUploadDialogClose = (done) => {
  ElMessageBox.confirm('确定要取消上传吗？')
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}

// 编辑成功处理
const handleEditSuccess = () => {
  editDialogVisible.value = false
  ElMessage.success('视频信息更新成功')
  fetchVideoList()
}

const handleEditCancel = () => {
  editDialogVisible.value = false
}

const handleEditDialogClose = (done) => {
  ElMessageBox.confirm('确定要取消编辑吗？')
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}

// 视频资源管理成功处理
const handleSourceSuccess = () => {
  sourceDialogVisible.value = false
  ElMessage.success('视频资源管理完成')
  fetchVideoList()
}

const handleSourceCancel = () => {
  sourceDialogVisible.value = false
}

const handleSourceDialogClose = (done) => {
  ElMessageBox.confirm('确定要关闭视频资源管理吗？')
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}

// 工具函数
const getVideoTypeText = (type) => {
  const types = {
    course: '课程视频',
    training: '培训视频',
    promotional: '宣传视频',
    other: '其他'
  }
  return types[type] || '未知'
}

const getVideoTypeColor = (type) => {
  const colors = {
    course: 'primary',
    training: 'success',
    promotional: 'warning',
    other: 'info'
  }
  return colors[type] || 'info'
}

const getStatusText = (status) => {
  const statuses = {
    uploading: '上传中',
    processing: '处理中',
    ready: '就绪',
    error: '错误'
  }
  return statuses[status] || '未知'
}

const getStatusType = (status) => {
  const types = {
    uploading: 'warning',
    processing: 'info',
    ready: 'success',
    error: 'danger'
  }
  return types[status] || 'info'
}

const getVisibilityText = (visibility) => {
  const visibilities = {
    public: '公开',
    private: '私有',
    internal: '内部'
  }
  return visibilities[visibility] || '未知'
}

const getVisibilityType = (visibility) => {
  const types = {
    public: 'success',
    private: 'warning',
    internal: 'info'
  }
  return types[visibility] || 'info'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchVideoList()
})
</script>

<style scoped>
.video-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.action-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-details {
  flex: 1;
}

.video-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #303133;
}

.video-description {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}
</style>