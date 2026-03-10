<template>
  <div class="video-source-management">
    <div class="header">
      <h3>视频资源管理 - {{ video.title }}</h3>
      <el-button type="primary" @click="handleAddSource" :disabled="loading">
        <el-icon><Plus /></el-icon>
        添加资源
      </el-button>
    </div>

    <!-- 资源列表 -->
    <el-table :data="sourceList" v-loading="loading" style="margin-top: 20px;">
      <el-table-column label="清晰度" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getQualityType(row.quality)">
            {{ row.quality }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="视频地址" min-width="300">
        <template #default="{ row }">
          <div class="video-url">
            <el-input 
              :value="row.videoUrl" 
              readonly 
              size="small"
              style="margin-bottom: 8px;"
            >
              <template #append>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="copyVideoUrl(row.videoUrl)"
                >
                  复制
                </el-button>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="previewVideo(row.videoUrl)"
            >
              预览
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="文件大小" width="120" align="center">
        <template #default="{ row }">
          {{ formatFileSize(row.videoSize) }}
        </template>
      </el-table-column>

      <el-table-column label="码率" width="100" align="center">
        <template #default="{ row }">
          {{ row.bitrate }} kbps
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'warning'">
            {{ row.status === 'active' ? '可用' : '不可用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="160" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            link 
            size="small" 
            @click="handleEditSource(row)"
          >
            编辑
          </el-button>
          <el-button 
            type="danger" 
            link 
            size="small" 
            @click="handleDeleteSource(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑资源对话框 -->
    <el-dialog
      v-model="sourceDialogVisible"
      :title="sourceDialogTitle"
      width="500px"
    >
      <el-form :model="sourceForm" :rules="sourceRules" ref="sourceFormRef" label-width="100px">
        <el-form-item label="清晰度" prop="quality">
          <el-select v-model="sourceForm.quality" placeholder="请选择清晰度" style="width: 100%;">
            <el-option label="240p" value="240p" />
            <el-option label="360p" value="360p" />
            <el-option label="480p" value="480p" />
            <el-option label="720p" value="720p" />
            <el-option label="1080p" value="1080p" />
            <el-option label="2K" value="2k" />
            <el-option label="4K" value="4k" />
          </el-select>
        </el-form-item>

        <el-form-item label="视频地址" prop="videoUrl">
          <el-input 
            v-model="sourceForm.videoUrl" 
            placeholder="请输入视频URL"
            @blur="handleUrlBlur"
          />
        </el-form-item>

        <el-form-item label="文件大小" prop="videoSize">
          <el-input-number
            v-model="sourceForm.videoSize"
            :min="0"
            :step="1024"
            style="width: 100%;"
            placeholder="文件大小（字节）"
          >
            <template #append>字节</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="码率" prop="bitrate">
          <el-input-number
            v-model="sourceForm.bitrate"
            :min="0"
            :step="100"
            style="width: 100%;"
            placeholder="视频码率"
          >
            <template #append>kbps</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="sourceForm.status">
            <el-radio label="active">可用</el-radio>
            <el-radio label="inactive">不可用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="sourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSourceSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 视频预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="视频预览" width="800px">
      <video 
        :src="previewUrl" 
        controls 
        style="width: 100%; max-height: 400px;"
        @error="handleVideoError"
      >
        您的浏览器不支持视频播放
      </video>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ossVideoApi from '@/api/oss-video'

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['success', 'cancel'])

// 数据
const loading = ref(false)
const sourceList = ref([])
const sourceDialogVisible = ref(false)
const sourceDialogTitle = ref('添加视频资源')
const submitting = ref(false)
const previewDialogVisible = ref(false)
const previewUrl = ref('')

// 表单引用
const sourceFormRef = ref()

// 表单数据
const sourceForm = reactive({
  id: null,
  videoId: null,
  quality: '',
  videoUrl: '',
  videoSize: 0,
  bitrate: 0,
  status: 'active'
})

// 表单验证规则
const sourceRules = {
  quality: [
    { required: true, message: '请选择清晰度', trigger: 'change' }
  ],
  videoUrl: [
    { required: true, message: '请输入视频URL', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入有效的URL', trigger: 'blur' }
  ]
}

// 获取视频资源列表
const fetchVideoSources = async () => {
  loading.value = true
  try {
    const response = await ossVideoApi.getVideoSources(props.video.id)
    if (response.code === 200) {
      sourceList.value = response.data || []
    } else {
      ElMessage.error('获取视频资源列表失败')
    }
  } catch (error) {
    console.error('获取视频资源失败:', error)
    ElMessage.error('获取视频资源失败')
  } finally {
    loading.value = false
  }
}

// 添加资源
const handleAddSource = () => {
  resetSourceForm()
  sourceForm.videoId = props.video.id
  sourceDialogTitle.value = '添加视频资源'
  sourceDialogVisible.value = true
}

// 编辑资源
const handleEditSource = (source) => {
  Object.assign(sourceForm, {
    id: source.id,
    videoId: source.videoId,
    quality: source.quality,
    videoUrl: source.videoUrl,
    videoSize: source.videoSize,
    bitrate: source.bitrate,
    status: source.status
  })
  sourceDialogTitle.value = '编辑视频资源'
  sourceDialogVisible.value = true
}

// 删除资源
const handleDeleteSource = async (source) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${source.quality} 清晰度的资源吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await ossVideoApi.deleteVideoSource(source.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      fetchVideoSources()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch {
    // 用户取消删除
  }
}

// 提交资源表单
const handleSourceSubmit = async () => {
  if (!sourceFormRef.value) return

  try {
    await sourceFormRef.value.validate()
    submitting.value = true

    let response
    if (sourceForm.id) {
      // 编辑现有资源
      response = await ossVideoApi.saveVideoSource(sourceForm)
    } else {
      // 添加新资源
      response = await ossVideoApi.saveVideoSource(sourceForm)
    }

    if (response.code === 200) {
      ElMessage.success('操作成功')
      sourceDialogVisible.value = false
      fetchVideoSources()
      emit('success')
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// URL失去焦点时自动填充文件大小和码率
const handleUrlBlur = async () => {
  if (!sourceForm.videoUrl || sourceForm.videoSize > 0) return

  try {
    // 这里可以添加从URL获取文件信息的逻辑
    // 目前暂时使用默认值
    if (!sourceForm.videoSize) {
      sourceForm.videoSize = 0
    }
    if (!sourceForm.bitrate) {
      sourceForm.bitrate = 2000
    }
  } catch (error) {
    console.error('获取文件信息失败:', error)
  }
}

// 复制视频URL
const copyVideoUrl = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('URL已复制到剪贴板')
  }).catch(() => {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('URL已复制到剪贴板')
  })
}

// 预览视频
const previewVideo = (url) => {
  previewUrl.value = url
  previewDialogVisible.value = true
}

// 视频播放错误处理
const handleVideoError = () => {
  ElMessage.error('视频播放失败，请检查URL是否正确')
}

// 重置表单
const resetSourceForm = () => {
  Object.assign(sourceForm, {
    id: null,
    videoId: null,
    quality: '',
    videoUrl: '',
    videoSize: 0,
    bitrate: 0,
    status: 'active'
  })
}

// 清晰度类型颜色
const getQualityType = (quality) => {
  const types = {
    '240p': 'info',
    '360p': '',
    '480p': 'success',
    '720p': 'warning',
    '1080p': 'danger',
    '2k': 'danger',
    '4k': 'danger'
  }
  return types[quality] || 'info'
}

// 工具函数
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 监听视频ID变化
watch(() => props.video.id, (newId) => {
  if (newId) {
    fetchVideoSources()
  }
})

// 初始化
onMounted(() => {
  if (props.video.id) {
    fetchVideoSources()
  }
})
</script>

<style scoped>
.video-source-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.video-url {
  max-width: 100%;
  overflow: hidden;
}
</style>