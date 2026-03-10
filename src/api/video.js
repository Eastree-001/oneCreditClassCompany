import request from '@/utils/request'

// 视频管理API
const videoApi = {
  // 获取视频列表
  getVideoList(params) {
    return request({
      url: '/admin/videos',
      method: 'get',
      params
    })
  },

  // 获取视频详情
  getVideoDetail(id) {
    return request({
      url: `/admin/videos/${id}`,
      method: 'get'
    })
  },

  // 上传视频
  uploadVideo(data) {
    return request({
      url: '/api/videos/save',
      method: 'post',
      data
    })
  },

  // 分片上传视频
  uploadVideoChunk(data) {
    return request({
      url: '/admin/videos/chunk-upload',
      method: 'post',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 合并分片视频
  mergeVideoChunks(data) {
    return request({
      url: '/admin/videos/merge-chunks',
      method: 'post',
      data
    })
  },

  // 更新视频信息
  updateVideo(id, data) {
    return request({
      url: `/admin/videos/${id}`,
      method: 'put',
      data
    })
  },

  // 删除视频
  deleteVideo(id) {
    return request({
      url: `/admin/videos/${id}`,
      method: 'delete'
    })
  },

  // 批量删除视频
  batchDeleteVideos(data) {
    return request({
      url: '/admin/videos/batch-delete',
      method: 'post',
      data
    })
  },

  // 获取视频统计信息
  getVideoStatistics(id, params) {
    return request({
      url: `/admin/videos/${id}/statistics`,
      method: 'get',
      params
    })
  },

  // 获取转码任务列表
  getTranscodingTasks(id) {
    return request({
      url: `/admin/videos/${id}/transcoding-tasks`,
      method: 'get'
    })
  },

  // 创建转码任务
  createTranscodingTask(id, data) {
    return request({
      url: `/admin/videos/${id}/transcode`,
      method: 'post',
      data
    })
  },

  // 获取视频评论列表
  getVideoComments(id, params) {
    return request({
      url: `/admin/videos/${id}/comments`,
      method: 'get',
      params
    })
  },

  // 审核视频评论
  reviewComment(id, data) {
    return request({
      url: `/admin/comments/${id}/review`,
      method: 'post',
      data
    })
  },

  // 删除视频评论
  deleteComment(id) {
    return request({
      url: `/admin/comments/${id}`,
      method: 'delete'
    })
  }
}

// 视频管理模拟数据
const videoMockData = {
  // 获取视频列表模拟数据
  getVideoList: (params) => {
    const { page = 1, size = 10, keyword = '', type = '', status = '', visibility = '' } = params || {}
    
    // 模拟数据
    const allVideos = [
      {
        id: 1,
        title: 'Java入门教程',
        description: 'Java基础语法讲解，适合初学者学习',
        filename: 'java_tutorial.mp4',
        file_size: 104857600,
        duration: 1800,
        thumbnail: '/thumbnails/java_tutorial.jpg',
        video_type: 'course',
        category: '编程语言',
        tags: ['Java', '编程', '教程'],
        status: 'ready',
        visibility: 'public',
        uploader_name: '管理员',
        view_count: 156,
        download_count: 23,
        upload_time: '2024-01-15 10:30:00',
        created_at: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        title: '企业培训视频',
        description: '企业文化建设培训',
        filename: 'enterprise_training.mp4',
        file_size: 209715200,
        duration: 2400,
        thumbnail: '/thumbnails/enterprise_training.jpg',
        video_type: 'training',
        category: '企业培训',
        tags: ['培训', '企业文化', '管理'],
        status: 'processing',
        visibility: 'internal',
        uploader_name: '操作员',
        view_count: 89,
        download_count: 12,
        upload_time: '2024-01-14 14:20:00',
        created_at: '2024-01-14 14:20:00'
      },
      {
        id: 3,
        title: '产品宣传视频',
        description: '最新产品功能介绍',
        filename: 'product_promo.mp4',
        file_size: 157286400,
        duration: 900,
        thumbnail: '/thumbnails/product_promo.jpg',
        video_type: 'promotional',
        category: '产品宣传',
        tags: ['宣传', '产品', '介绍'],
        status: 'ready',
        visibility: 'public',
        uploader_name: '管理员',
        view_count: 234,
        download_count: 45,
        upload_time: '2024-01-13 09:15:00',
        created_at: '2024-01-13 09:15:00'
      },
      {
        id: 4,
        title: 'Python数据分析',
        description: '使用Python进行数据分析的实战教程',
        filename: 'python_data_analysis.mp4',
        file_size: 314572800,
        duration: 3600,
        thumbnail: '/thumbnails/python_data_analysis.jpg',
        video_type: 'course',
        category: '数据分析',
        tags: ['Python', '数据分析', '教程'],
        status: 'uploading',
        visibility: 'private',
        uploader_name: '操作员',
        view_count: 0,
        download_count: 0,
        upload_time: '2024-01-16 16:45:00',
        created_at: '2024-01-16 16:45:00'
      },
      {
        id: 5,
        title: '团队协作培训',
        description: '提升团队协作效率的培训视频',
        filename: 'team_collaboration.mp4',
        file_size: 262144000,
        duration: 2700,
        thumbnail: '/thumbnails/team_collaboration.jpg',
        video_type: 'training',
        category: '团队管理',
        tags: ['团队', '协作', '培训'],
        status: 'error',
        visibility: 'internal',
        uploader_name: '管理员',
        view_count: 0,
        download_count: 0,
        upload_time: '2024-01-12 11:30:00',
        created_at: '2024-01-12 11:30:00'
      }
    ]

    // 筛选数据
    let filteredVideos = allVideos.filter(video => {
      // 关键词搜索
      if (keyword && !video.title.includes(keyword) && !video.description.includes(keyword)) {
        return false
      }
      // 类型筛选
      if (type && video.video_type !== type) {
        return false
      }
      // 状态筛选
      if (status && video.status !== status) {
        return false
      }
      // 可见性筛选
      if (visibility && video.visibility !== visibility) {
        return false
      }
      return true
    })

    // 分页处理
    const startIndex = (page - 1) * size
    const endIndex = startIndex + size
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex)

    return {
      code: 200,
      data: {
        list: paginatedVideos,
        total: filteredVideos.length,
        page: parseInt(page),
        size: parseInt(size)
      }
    }
  },

  // 获取视频详情模拟数据
  getVideoDetail: (id) => {
    const videos = {
      1: {
        id: 1,
        title: 'Java入门教程',
        description: 'Java基础语法讲解，适合初学者学习',
        filename: 'java_tutorial.mp4',
        file_path: '/videos/java_tutorial.mp4',
        file_size: 104857600,
        duration: 1800,
        thumbnail: '/thumbnails/java_tutorial.jpg',
        video_type: 'course',
        category: '编程语言',
        tags: ['Java', '编程', '教程', '基础'],
        status: 'ready',
        visibility: 'public',
        uploader_id: 1,
        uploader_name: '管理员',
        view_count: 156,
        download_count: 23,
        upload_time: '2024-01-15 10:30:00',
        processed_time: '2024-01-15 10:35:00',
        transcoding_tasks: [
          {
            id: 1,
            task_id: 'transcode_001',
            target_format: 'mp4',
            resolution: '1080p',
            status: 'completed',
            progress: 100,
            output_file: '/videos/java_tutorial_1080p.mp4',
            start_time: '2024-01-15 10:30:00',
            end_time: '2024-01-15 10:35:00'
          },
          {
            id: 2,
            task_id: 'transcode_002',
            target_format: 'mp4',
            resolution: '720p',
            status: 'completed',
            progress: 100,
            output_file: '/videos/java_tutorial_720p.mp4',
            start_time: '2024-01-15 10:36:00',
            end_time: '2024-01-15 10:40:00'
          }
        ],
        created_at: '2024-01-15 10:30:00',
        updated_at: '2024-01-15 10:35:00'
      }
    }

    const video = videos[id]
    if (video) {
      return {
        code: 200,
        data: video
      }
    } else {
      return {
        code: 404,
        message: '视频不存在'
      }
    }
  },

  // 上传视频模拟数据
  uploadVideo: (data) => {
    return {
      code: 200,
      message: '视频上传成功',
      data: {
        id: Math.floor(Math.random() * 1000) + 6,
        upload_id: `upload_${Date.now()}`,
        file_path: `/videos/temp/${data.file.name}`,
        estimated_time: '2分钟'
      }
    }
  },

  // 更新视频信息模拟数据
  updateVideo: (id, data) => {
    return {
      code: 200,
      message: '视频信息更新成功'
    }
  },

  // 删除视频模拟数据
  deleteVideo: (id) => {
    return {
      code: 200,
      message: '视频删除成功'
    }
  },

  // 批量删除视频模拟数据
  batchDeleteVideos: (data) => {
    return {
      code: 200,
      message: `批量删除成功，删除${data.ids.length}个视频`
    }
  },

  // 获取视频统计信息模拟数据
  getVideoStatistics: (id, params) => {
    return {
      code: 200,
      data: {
        total_views: 156,
        total_downloads: 23,
        avg_watch_time: 1200,
        completion_rate: 65.5,
        daily_stats: [
          {
            date: '2024-01-15',
            views: 12,
            downloads: 2,
            avg_watch_time: 1100
          },
          {
            date: '2024-01-16',
            views: 18,
            downloads: 3,
            avg_watch_time: 1250
          }
        ]
      }
    }
  }
}

// 导出API和模拟数据
export { videoApi as default, videoMockData }