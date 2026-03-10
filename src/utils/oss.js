import OSS from 'ali-oss'
import { getOSSClientConfig, generateFilePath, validateFileType, validateFileSize, getFileURL } from '@/config/oss'
import request from '@/utils/request'

class OSSUploader {
  constructor() {
    this.client = null
    this.stsToken = null
    this.tokenExpireTime = null
  }

  // 获取STS临时凭证
  async getSTSToken() {
    try {
      // 检查token是否有效
      if (this.stsToken && this.tokenExpireTime && Date.now() < this.tokenExpireTime - 60000) {
        return this.stsToken
      }

      // 从后端获取STS token
      const response = await request({
        url: '/admin/sts-token',
        method: 'get'
      })

      if (response.code === 200) {
        console.log('后端返回的STS数据:', response.data)
        
        // 正确的数据结构：response.data 包含所有字段
        const { 
          accessKeyId,      // 临时 AccessKeyId
          accessKeySecret,  // 临时 AccessKeySecret
          securityToken,    // STS Token（前端 SDK 中叫 stsToken）
          expiration,       // 过期时间戳（毫秒）
          region,           // oss-cn-beijing
          bucket            // course-video0306
        } = response.data;

        // 转换为前端需要的格式
        this.stsToken = {
          AccessKeyId: accessKeyId,
          AccessKeySecret: accessKeySecret,
          SecurityToken: securityToken,
          Expiration: expiration, // 保持时间戳格式
          region: region,
          bucket: bucket
        }
        
        // 正确计算过期时间：使用时间戳，提前1分钟过期
        this.tokenExpireTime = expiration - 60000
        console.log('获取STS token成功，过期时间:', new Date(expiration).toLocaleString())
        return this.stsToken
      } else {
        throw new Error('获取STS token失败: ' + response.message)
      }
    } catch (error) {
      console.error('获取STS token失败:', error)
      throw error
    }
  }

  // 初始化OSS客户端（使用STS）
  async initClient() {
    try {
      const stsToken = await this.getSTSToken()
      
      this.client = new OSS({
        region: stsToken.region || 'oss-cn-beijing', // 使用后端返回的region，或默认值
        bucket: stsToken.bucket || 'course-video0306', // 使用后端返回的bucket，或默认值
        accessKeyId: stsToken.AccessKeyId,
        accessKeySecret: stsToken.AccessKeySecret,
        stsToken: stsToken.SecurityToken,
        secure: true,
        refreshSTSToken: async () => {
          // Token过期时自动刷新
          const newToken = await this.getSTSToken()
          return {
            accessKeyId: newToken.AccessKeyId,
            accessKeySecret: newToken.AccessKeySecret,
            stsToken: newToken.SecurityToken
          }
        }
      })
      
      console.log('OSS客户端初始化成功（使用STS）')
    } catch (error) {
      console.error('OSS客户端初始化失败:', error)
      throw error
    }
  }

  // 确保客户端已初始化
  async ensureClient() {
    if (!this.client || (this.tokenExpireTime && Date.now() >= this.tokenExpireTime)) {
      await this.initClient()
    }
  }

  // 上传文件到OSS
  async uploadFile(file, options = {}) {
    await this.ensureClient()

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

      // 验证文件大小
      if (!validateFileSize(file)) {
        throw new Error(`文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      }

      // 生成存储路径
      const filePath = customPath || generateFilePath(file.name, type)

      // 上传选项
      const uploadOptions = {
        progress: (p, checkpoint) => {
          if (onProgress) {
            const progress = Math.round(p * 100)
            onProgress(progress, checkpoint)
          }
        },
        headers: {
          'Content-Disposition': 'inline',
          'Cache-Control': 'max-age=31536000' // 缓存1年
        },
        timeout: 30 * 60 * 1000 // 30分钟超时
      }

      console.log('开始上传文件到OSS:', filePath)
      
      // 执行上传
      const result = await this.client.multipartUpload(filePath, file, uploadOptions)
      
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

  // 分片上传（支持大文件）
  async uploadFileChunk(file, options = {}) {
    await this.ensureClient()

    const {
      onProgress = null,
      onSuccess = null,
      onError = null,
      customPath = null,
      type = 'video',
      partSize = 5 * 1024 * 1024 // 5MB分片
    } = options

    try {
      // 验证文件类型和大小
      if (!validateFileType(file)) {
        throw new Error(`不支持的文件类型: ${file.type}`)
      }
      if (!validateFileSize(file)) {
        throw new Error(`文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      }

      // 生成存储路径
      const filePath = customPath || generateFilePath(file.name, type)

      // 分片上传选项
      const uploadOptions = {
        parallel: 4, // 并行上传分片数
        partSize: partSize,
        progress: (p, checkpoint) => {
          if (onProgress) {
            const progress = Math.round(p * 100)
            onProgress(progress, checkpoint)
          }
        },
        headers: {
          'Content-Disposition': 'inline',
          'Cache-Control': 'max-age=31536000'
        },
        timeout: 60 * 60 * 1000 // 60分钟超时
      }

      console.log('开始分片上传文件到OSS:', filePath)
      
      const result = await this.client.multipartUpload(filePath, file, uploadOptions)
      
      const fileURL = getFileURL(filePath)
      
      console.log('文件分片上传成功:', fileURL)
      
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
      console.error('文件分片上传失败:', error)
      
      if (onError) {
        onError(error)
      }

      throw error
    }
  }

  // 删除文件
  async deleteFile(filePath) {
    await this.ensureClient()

    try {
      const result = await this.client.delete(filePath)
      console.log('文件删除成功:', filePath)
      return {
        success: true,
        path: filePath
      }
    } catch (error) {
      console.error('文件删除失败:', error)
      throw error
    }
  }

  // 批量删除文件
  async deleteFiles(filePaths) {
    if (!this.client) {
      throw new Error('OSS客户端未初始化')
    }

    try {
      const objects = filePaths.map(path => ({ key: path }))
      const result = await this.client.deleteMulti(objects, { quiet: true })
      console.log('批量文件删除成功，数量:', filePaths.length)
      return {
        success: true,
        count: filePaths.length
      }
    } catch (error) {
      console.error('批量文件删除失败:', error)
      throw error
    }
  }

  // 检查文件是否存在
  async checkFileExists(filePath) {
    if (!this.client) {
      throw new Error('OSS客户端未初始化')
    }

    try {
      await this.client.head(filePath)
      return true
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return false
      }
      throw error
    }
  }

  // 获取文件信息
  async getFileInfo(filePath) {
    if (!this.client) {
      throw new Error('OSS客户端未初始化')
    }

    try {
      const result = await this.client.head(filePath)
      return {
        exists: true,
        size: result.headers['content-length'],
        lastModified: result.headers['last-modified'],
        contentType: result.headers['content-type']
      }
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return { exists: false }
      }
      throw error
    }
  }

  // 生成预签名URL（用于临时访问私有文件）
  async generatePresignedUrl(filePath, expires = 3600) {
    if (!this.client) {
      throw new Error('OSS客户端未初始化')
    }

    try {
      const url = this.client.signatureUrl(filePath, {
        expires: expires,
        method: 'GET'
      })
      return url
    } catch (error) {
      console.error('生成预签名URL失败:', error)
      throw error
    }
  }
}

// 创建单例实例
const ossUploader = new OSSUploader()

export default ossUploader

export {
  OSSUploader,
  ossUploader
}