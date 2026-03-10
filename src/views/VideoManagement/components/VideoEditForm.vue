<template>
  <div class="video-edit-form">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <!-- 视频预览 -->
      <el-form-item label="视频预览">
        <div class="video-preview">
          <el-image 
            :src="form.thumbnail" 
            :preview-src-list="[form.thumbnail]"
            fit="cover"
            style="width: 200px; height: 120px; border-radius: 4px;"
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="video-info">
            <div class="file-name">{{ form.filename }}</div>
            <div class="file-details">
              <span>大小: {{ formatFileSize(form.file_size) }}</span>
              <span>时长: {{ formatDuration(form.duration) }}</span>
            </div>
            <div class="upload-time">上传时间: {{ formatDateTime(form.upload_time) }}</div>
          </div>
        </div>
      </el-form-item>

      <!-- 视频信息表单 -->
      <el-form-item label="视频标题" prop="title" required>
        <el-input 
          v-model="form.title" 
          placeholder="请输入视频标题"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="视频描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入视频描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="视频类型" prop="video_type" required>
            <el-select v-model="form.video_type" placeholder="请选择视频类型" style="width: 100%;">
              <el-option label="课程视频" value="course" />
              <el-option label="培训视频" value="training" />
              <el-option label="宣传视频" value="promotional" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="视频分类" prop="category">
            <el-input 
              v-model="form.category" 
              placeholder="请输入视频分类"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="标签" prop="tags">
        <el-input
          v-model="newTag"
          placeholder="请输入标签，用逗号分隔"
          @keyup.enter="addTag"
        >
          <template #append>
            <el-button @click="addTag">添加</el-button>
          </template>
        </el-input>
        <div class="tags-container">
          <el-tag
            v-for="tag in tagList"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag }}
          </el-tag>
        </div>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%;">
              <el-option label="上传中" value="uploading" />
              <el-option label="处理中" value="processing" />
              <el-option label="就绪" value="ready" />
              <el-option label="错误" value="error" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="可见性" prop="visibility">
            <el-select v-model="form.visibility" placeholder="请选择可见性" style="width: 100%;">
              <el-option label="公开" value="public" />
              <el-option label="私有" value="private" />
              <el-option label="内部" value="internal" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 统计信息 -->
      <el-form-item label="统计信息">
        <div class="stats-info">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ form.view_count || 0 }}</div>
                <div class="stat-label">观看次数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ form.download_count || 0 }}</div>
                <div class="stat-label">下载次数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ formatDateTime(form.processed_time) || '未处理' }}</div>
                <div class="stat-label">处理时间</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ form.uploader_name || '未知' }}</div>
                <div class="stat-label">上传者</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          保存修改
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="warning" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

const props = defineProps({
  video: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['success', 'cancel'])

// 表单引用
const formRef = ref()

// 表单状态
const submitting = ref(false)
const newTag = ref('')

// 表单数据
const form = reactive({
  id: '',
  title: '',
  description: '',
  filename: '',
  file_size: 0,
  duration: 0,
  thumbnail: '',
  video_type: '',
  category: '',
  status: '',
  visibility: '',
  uploader_name: '',
  view_count: 0,
  download_count: 0,
  upload_time: '',
  processed_time: ''
})

// 标签列表
const tagList = ref([])

// 原始数据（用于重置）
const originalData = ref({})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
  ],
  video_type: [
    { required: true, message: '请选择视频类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择视频状态', trigger: 'change' }
  ],
  visibility: [
    { required: true, message: '请选择可见性', trigger: 'change' }
  ]
}

// 监听props变化，初始化表单数据
watch(() => props.video, (newVideo) => {
  if (newVideo && Object.keys(newVideo).length > 0) {
    Object.keys(form).forEach(key => {
      if (key in newVideo) {
        form[key] = newVideo[key]
      }
    })
    
    // 处理标签
    if (newVideo.tags && Array.isArray(newVideo.tags)) {
      tagList.value = [...newVideo.tags]
    } else if (typeof newVideo.tags === 'string') {
      tagList.value = newVideo.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    } else {
      tagList.value = []
    }
    
    // 保存原始数据
    originalData.value = { ...form }
  }
}, { immediate: true, deep: true })

// 检查表单是否有修改
const hasChanges = computed(() => {
  return JSON.stringify(form) !== JSON.stringify(originalData.value) ||
         JSON.stringify(tagList.value) !== JSON.stringify(originalData.value.tags || [])
})

// 添加标签
const addTag = () => {
  if (newTag.value.trim()) {
    const tags = newTag.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    tags.forEach(tag => {
      if (!tagList.value.includes(tag)) {
        tagList.value.push(tag)
      }
    })
    newTag.value = ''
  }
}

// 移除标签
const removeTag = (tag) => {
  const index = tagList.value.indexOf(tag)
  if (index > -1) {
    tagList.value.splice(index, 1)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    if (!hasChanges.value) {
      ElMessage.warning('没有检测到任何修改')
      return
    }

    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 构建请求数据
    const requestData = {
      ...form,
      tags: tagList.value
    }

    // 实际API调用应该在这里
    // const response = await fetch(`/api/admin/videos/${form.id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify(requestData)
    // })

    ElMessage.success('视频信息更新成功')
    emit('success')
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请检查表单')
  } finally {
    submitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  if (hasChanges.value) {
    ElMessageBox.confirm('有未保存的修改，确定要取消吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      resetForm()
      emit('cancel')
    }).catch(() => {
      // 用户取消操作
    })
  } else {
    emit('cancel')
  }
}

// 重置表单
const handleReset = () => {
  ElMessageBox.confirm('确定要重置所有修改吗？', '重置确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    resetForm()
    ElMessage.success('表单已重置')
  }).catch(() => {
    // 用户取消重置
  })
}

// 重置表单到原始状态
const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key in originalData.value) {
      form[key] = originalData.value[key]
    }
  })
  
  if (originalData.value.tags && Array.isArray(originalData.value.tags)) {
    tagList.value = [...originalData.value.tags]
  } else if (typeof originalData.value.tags === 'string') {
    tagList.value = originalData.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
  } else {
    tagList.value = []
  }
  
  newTag.value = ''
}

// 工具函数
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
</script>

<style scoped>
.video-edit-form {
  padding: 20px 0;
}

.video-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.video-info {
  flex: 1;
}

.file-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #303133;
}

.file-details {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.upload-time {
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

.tags-container {
  margin-top: 8px;
}

.stats-info {
  width: 100%;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}
</style>