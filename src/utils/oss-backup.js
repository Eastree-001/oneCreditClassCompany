import OSS from 'ali-oss'
import { getOSSClientConfig, generateFilePath, validateFileType, validateFileSize, getFileURL } from '@/config/oss'

// 临时解决方案 - 直接上传（需要配置CORS）
class OSSUploaderDirect {
  constructor() {
    this.client = null
    this.initClient()
  }

  // 初始化OSS客户端
  initClient() {
    try {
      const config = getOSSClientConfig()
      
      // 检查必要的配置项
      if (!config.accessKeyId || !config.accessKeySecret) {
        throw new Error('OSS配置不完整，请检查环境变量设置')
      }
      
      this.client = new OSS(config)
      console.log('OSS客户端初始化成功')
    } catch (error) {
      console.error('OSS客户端初始化失败:', error)
      throw error
    }
  }

  // 简单文件上传（不使用分片）
  async simpleUpload(file, options = {}) {
    if (!this.client) {
      throw new Error('OSS客户端未初始化')
    }

    const {
      onProgress = null,
      onSuccess = null,
      onError = null,
      customPath = null,
      type = 'video'
    } = options

    try {
      // 验证文件类型
      if (!validateFileType(file)) {
        throw new Error(`不支持的文件类型: ${file.type}`)
      }

      // 验证文件大小（限制为100MB以下使用简单上传）
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        throw new Error(`文件大小超过限制，请使用分片上传: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      }

      // 生成存储路径
      const filePath = customPath || generateFilePath(file.name, type)

      // 简单上传
      const result = await this.client.put(filePath, file, {
        headers: {
          'Content-Disposition': 'inline',
          'Cache-Control': 'max-age=31536000'
        }
      })
      
      const fileURL = getFileURL(filePath)
      
      console.log('文件上传成功:', fileURL)
      
      if (onSuccess) {
        onSuccess({
          url: fileURL,
          path: filePath,
          name: file.name,
          size: file.size,
          type: file.type
        })
      }

      return {
        success: true,
        url: fileURL,
        path: filePath,
        name: file.name,
        size: file.size
      }

    } catch (error) {
      console.error('文件上传失败:', error)
      
      if (onError) {
        onError(error)
      }

      throw error
    }
  }
}

// 创建实例
export const ossUploaderDirect = new OSSUploaderDirect()
export default ossUploaderDirect