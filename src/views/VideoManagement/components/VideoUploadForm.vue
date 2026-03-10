<template>
  <div class="video-upload-form">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <!-- 文件上传区域 -->
      <el-form-item label="视频文件" prop="file" required>
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :before-upload="beforeUpload"
          :http-request="handleCustomUpload"
          :show-file-list="false"
          :accept="acceptTypes"
          :limit="1"
          :disabled="uploading"
        >
          <div v-if="!uploading" class="upload-content">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              <div>点击或拖拽视频文件到此区域</div>
              <div class="upload-hint">支持 MP4、AVI、MOV、WMV 格式，最大 500MB</div>
            </div>
          </div>
          
          <div v-else class="upload-progress">
            <el-progress 
              type="circle"  
              :percentage="uploadProgress" 
              :width="80"
            />
            <div class="progress-text">
              <div>上传中...</div>
              <div class="progress-detail">
                {{ formatFileSize(uploadedSize) }} / {{ formatFileSize(totalSize) }}
              </div>
            </div>
          </div>
        </el-upload>
        
        <!-- 文件信息 -->
        <div v-if="selectedFile" class="file-info">
          <div class="file-name">
            <el-icon><Document /></el-icon>
            {{ selectedFile.name }}
          </div>
          <div class="file-details">
            <span>大小: {{ formatFileSize(selectedFile.size) }}</span>
            <span>类型: {{ selectedFile.type }}</span>
          </div>
          <el-button 
            v-if="!uploading" 
            type="danger" 
            link 
            size="small" 
            @click="clearFile"
          >
            移除
          </el-button>
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

      <!-- 视频类型（非必填） -->
      <el-form-item label="视频类型" prop="video_type">
        <el-select v-model="form.video_type" placeholder="请选择视频类型（可选）" style="width: 100%;">
          <el-option label="课程视频" value="course" />
          <el-option label="培训视频" value="training" />
          <el-option label="宣传视频" value="promotional" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-input
          v-model="form.tags"
          placeholder="请输入标签，用逗号分隔"
          @keyup.enter="addTag"
        >
          <template #append>
            <el-button @click="addTag">添加</el-button>
          </template>
        </el-input>
        <div class="tags-container" v-if="tagList.length > 0">
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

      <el-form-item label="可见性" prop="visibility">
        <el-radio-group v-model="form.visibility">
          <el-radio label="public">公开（所有用户可见）</el-radio>
          <el-radio label="private">私有（仅管理员可见）</el-radio>
          <el-radio label="internal">内部（仅内部用户可见）</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button 
          type="primary" 
          :loading="submitting" 
          :disabled="!selectedFile || uploading"
          @click="handleSubmit"
        >
          确认上传
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import ossUploader from '@/utils/oss'
import adminApi from '@/api/admin'

const emit = defineEmits(['success', 'cancel'])

// 表单引用
const formRef = ref()

// 上传状态
const uploading = ref(false)
const submitting = ref(false)
const uploadProgress = ref(0)
const uploadedSize = ref(0)
const totalSize = ref(0)

// el-upload 引用
const uploadRef = ref()

// 选择的文件
const selectedFile = ref(null)

// 表单数据
const form = reactive({
  file: null,
  title: '',
  description: '',
  video_type: '',
  tags: '',
  visibility: 'public',
  oss_url: '',
  oss_path: '',
  video_id: null // 用于存储视频ID
})

// 标签列表
const tagList = ref([])

// 上传配置
const acceptTypes = '.mp4,.avi,.mov,.wmv,.flv,.mkv,.m4v,.webm,.3gp,.mpeg,.mpg'

// 表单验证规则
const rules = {
  file: [
    { required: true, message: '请选择视频文件', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度在 1 到 200 个字符', trigger: 'blur' }
  ]
}

// 文件上传前验证
const beforeUpload = (file) => {
  // 检查文件类型
  const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska']
  const isVideo = allowedTypes.includes(file.type)
  
  if (!isVideo) {
    ElMessage.error('只能上传视频文件！')
    return false
  }

  // 检查文件大小（500MB）
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('视频文件大小不能超过 500MB！')
    return false
  }

  // 设置文件信息
  selectedFile.value = file
  totalSize.value = file.size
  form.file = file
  
  return true
}

// 自定义上传处理
const handleCustomUpload = async (options) => {
  const { file } = options
  uploading.value = true
  uploadProgress.value = 0
  uploadedSize.value = 0
  totalSize.value = file.size

  try {
    console.log('开始上传文件到OSS:', file.name)
    
    // 1. 上传视频到 OSS（直接使用put方法）
    await ossUploader.ensureClient()
    
    // 生成存储路径
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filePath = `videos/${timestamp}_${Math.random().toString(36).slice(2, 11)}.${fileExtension}`
    
    console.log('OSS文件路径:', filePath)
    
    // 使用put方法上传文件
    const result = await ossUploader.client.put(filePath, file, {
      progress: (p) => {
        const progress = Math.round(p * 100)
        uploadProgress.value = progress
        uploadedSize.value = (progress / 100) * file.size
        console.log(`上传进度: ${progress}%`)
      },
      headers: {
        'Content-Disposition': 'inline',
        'Cache-Control': 'max-age=31536000'
      }
    })

    console.log('OSS上传成功，返回结果:', result)
    
    // 获取文件URL
    const fileURL = result.url
    form.oss_url = fileURL
    form.oss_path = filePath
    
    uploading.value = false
    uploadProgress.value = 100
    ElMessage.success('视频上传到OSS成功')
    
  } catch (error) {
    uploading.value = false
    uploadProgress.value = 0
    console.error('上传过程出错:', error)
    ElMessage.error(`视频上传失败: ${error.message}`)
    throw error
  }
}

// 清除选择的文件
const clearFile = () => {
  selectedFile.value = null
  form.file = null
  uploadProgress.value = 0
  uploadedSize.value = 0
  totalSize.value = 0
  
  // 清空 el-upload 组件的文件列表，使其可以重新上传
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 添加标签
const addTag = () => {
  if (form.tags.trim()) {
    const tags = form.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    tags.forEach(tag => {
      if (!tagList.value.includes(tag)) {
        tagList.value.push(tag)
      }
    })
    form.tags = ''
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

    if (!selectedFile.value) {
      ElMessage.error('请先选择视频文件')
      return
    }

    if (!form.oss_url) {
      ElMessage.error('请先完成视频文件上传')
      return
    }

    // 检查管理员登录状态
    console.log('=== 检查管理员登录状态 ===')
    const adminToken = localStorage.getItem('token_admin')
    const userStoreAdmin = JSON.parse(localStorage.getItem('userInfo_admin') || 'null')
    
    console.log('token_admin:', adminToken ? `${adminToken.substring(0, 30)}...` : 'null')
    console.log('token_admin长度:', adminToken ? adminToken.length : 0)
    console.log('userInfo_admin:', userStoreAdmin)
    console.log('当前路由模式:', window.location.pathname)
    
    // 使用auth.js中的验证函数检查token
    const { getValidToken } = await import('@/utils/auth')
    const validToken = getValidToken('admin')
    console.log('getValidToken验证结果:', validToken ? `${validToken.substring(0, 30)}...` : 'null')
    
    if (!adminToken || !validToken) {
      console.log('管理员token不存在或无效，跳转到登录页')
      console.log('adminToken:', adminToken)
      console.log('validToken:', validToken)
      ElMessage.error('请先登录管理员账号')
      
      // 暂时注释掉跳转，用于调试
      // window.location.href = '/login?mode=admin'
      
      // 显示详细的错误信息
      ElMessage.error(`Token验证失败: adminToken=${!!adminToken}, validToken=${!!validToken}`)
      
      return
    }
    
    console.log('管理员登录状态检查通过，token有效')

    submitting.value = true

    // 准备上传数据，匹配接口要求
    const videoData = {
      videoUrl: form.oss_url,           // OSS 返回的URL（必填）
      title: form.title,                // 视频标题（必填）
      description: form.description || '',    // 描述
      videoType: form.video_type || '',       // 类型
      tags: tagList.value.join(','),    // 标签
      visibility: form.visibility === 'public' ? 1 : form.visibility === 'internal' ? 2 : 0, // 1-公开，2-内部，0-私有
      videoSize: selectedFile.value.size, // 文件大小
      videoFormat: selectedFile.value.name.split('.').pop().toLowerCase(), // 视频格式
      resolution: '1920x1080',          // 分辨率（默认值）
      coverImage: '',                   // 封面图（可选，后续可扩展）
      videoDuration: 0,                 // 时长（可选，后续可获取）
      uploaderId: 1,                    // 上传者ID（必填，这里使用默认值，实际应从用户信息获取）
      uploaderType: 'admin',            // 上传者类型
      status: 0                         // 状态：0-待审核
    }

    console.log('开始保存视频信息到数据库:', videoData)
    
    // 调用管理员视频API保存基本信息
    const videoResponse = await adminApi.uploadVideo(videoData)
    
    if (videoResponse.code !== 200) {
      throw new Error(videoResponse.message || '保存视频信息失败')
    }

    // 获取视频ID
    const videoId = videoResponse.data.id || videoResponse.data.videoId
    form.video_id = videoId

    console.log('视频信息保存成功，视频ID:', videoId)
    
    ElMessage.success('视频上传和资源保存成功')
    emit('success', { videoId: videoId })
    
    // 重置表单
    resetForm()
  } catch (error) {
    console.error('保存失败:', error)
    
    // 检查是否是权限错误
    if (error.message.includes('401') || error.message.includes('未授权') || error.message.includes('token')) {
      ElMessage.error('管理员登录已过期，请重新登录')
      // 清除过期token
      localStorage.removeItem('token_admin')
      localStorage.removeItem('userInfo_admin')
      // 跳转到登录页面
      window.location.href = '/login?mode=admin'
    } else {
      ElMessage.error(`保存失败: ${error.message}`)
    }
  } finally {
    submitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  if (uploading.value) {
    ElMessage.warning('正在上传中，请稍后再取消')
    return
  }
  resetForm()
  emit('cancel')
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  selectedFile.value = null
  tagList.value = []
  uploadProgress.value = 0
  uploadedSize.value = 0
  totalSize.value = 0
  uploading.value = false
  form.oss_url = ''
  form.oss_path = ''
}

// 工具函数
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.video-upload-form {
  padding: 20px 0;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
  color: #606266;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.upload-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
}

.progress-text {
  text-align: center;
}

.progress-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.file-info {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.file-name {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 8px;
}

.file-name .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.file-details {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}

.tags-container {
  margin-top: 8px;
}
</style>