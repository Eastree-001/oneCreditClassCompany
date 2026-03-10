import request from '@/utils/request'

// OSS视频资源管理API
const ossVideoApi = {
  // 保存单个视频资源
  saveVideoSource(data) {
    return request({
      url: '/api/oss/video/save',
      method: 'post',
      data
    })
  },

  // 批量保存视频资源（多清晰度）
  batchSaveVideoSources(data) {
    return request({
      url: '/api/oss/video/batch-save',
      method: 'post',
      data
    })
  },

  // 获取视频的所有清晰度资源
  getVideoSources(videoId) {
    return request({
      url: `/api/oss/video/list/${videoId}`,
      method: 'get'
    })
  },

  // 删除视频资源
  deleteVideoSource(sourceId) {
    return request({
      url: `/api/oss/video/delete/${sourceId}`,
      method: 'delete'
    })
  }
}

export default ossVideoApi