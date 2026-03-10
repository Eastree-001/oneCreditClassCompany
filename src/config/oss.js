// 阿里云OSS配置文件
// 请根据实际配置修改以下参数

export const OSS_CONFIG = {
  // 阿里云OSS访问域名
  region: 'oss-cn-hangzhou', // 根据实际地域修改
  
  // 存储空间名称
  bucket: 'edunexus-videos', // 根据实际bucket名称修改
  
  // 视频文件存储路径
  videoPath: 'videos/',
  
  // 缩略图存储路径
  thumbnailPath: 'thumbnails/',
  
  // 临时文件存储路径
  tempPath: 'temp/',
  
  // 文件上传相关配置
  uploadConfig: {
    // 分片大小（单位：字节）
    partSize: 5 * 1024 * 1024, // 5MB
    
    // 并行上传分片数
    parallel: 4,
    
    // 上传超时时间（单位：毫秒）
    timeout: 30 * 60 * 1000, // 30分钟
    
    // 上传进度回调间隔（单位：毫秒）
    progressInterval: 1000
  }
}

// 获取OSS配置（STS方案不需要长期密钥）
export const getOSSClientConfig = () => {
  return {
    region: import.meta.env.VITE_OSS_REGION || OSS_CONFIG.region,
    bucket: import.meta.env.VITE_OSS_BUCKET || OSS_CONFIG.bucket,
    secure: true // 使用HTTPS
    // accessKeyId, accessKeySecret, stsToken 将通过STS动态获取
  }
}

// 生成文件存储路径
export const generateFilePath = (filename, type = 'video') => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const ext = filename.split('.').pop()
  
  let basePath = OSS_CONFIG.videoPath
  if (type === 'thumbnail') {
    basePath = OSS_CONFIG.thumbnailPath
  } else if (type === 'temp') {
    basePath = OSS_CONFIG.tempPath
  }
  
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))
  const safeFilename = nameWithoutExt.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, '_')
  
  return `${basePath}${safeFilename}_${timestamp}_${randomStr}.${ext}`
}

// 获取文件URL
export const getFileURL = (filePath) => {
  const config = getOSSClientConfig()
  return `https://${config.bucket}.${config.region}.aliyuncs.com/${filePath}`
}

// 验证文件类型
export const validateFileType = (file, allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv']) => {
  return allowedTypes.includes(file.type)
}

// 验证文件大小
export const validateFileSize = (file, maxSize = 2 * 1024 * 1024 * 1024) => { // 默认2GB
  return file.size <= maxSize
}

// 获取文件扩展名
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

// 支持的视频格式
export const SUPPORTED_VIDEO_FORMATS = [
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'm4v', 'webm', '3gp', 'mpeg', 'mpg'
]

// 支持的缩略图格式
export const SUPPORTED_THUMBNAIL_FORMATS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp'
]

export default OSS_CONFIG