// 500错误分析工具
export class ErrorAnalyzer {
  constructor() {
    this.errorHistory = []
    this.maxHistorySize = 10
  }

  // 分析500错误
  analyze500Error(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: '500 Internal Server Error',
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      params: error.config?.params,
      data: error.config?.data,
      responseData: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      context: context
    }

    // 添加到历史记录
    this.addToHistory(errorInfo)

    // 输出详细分析
    this.logDetailedAnalysis(errorInfo)

    return errorInfo
  }

  // 添加到历史记录
  addToHistory(errorInfo) {
    this.errorHistory.unshift(errorInfo)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop()
    }
  }

  // 输出详细分析
  logDetailedAnalysis(errorInfo) {
    console.group(`🔥 500错误分析 - ${errorInfo.timestamp}`)
    console.log('📡 请求信息:')
    console.log(`  方法: ${errorInfo.method}`)
    console.log(`  URL: ${errorInfo.url}`)
    console.log(`  参数:`, errorInfo.params)
    console.log(`  数据:`, errorInfo.data)
    
    console.log('📡 响应信息:')
    console.log(`  状态码: ${errorInfo.status}`)
    console.log(`  状态文本: ${errorInfo.statusText}`)
    console.log(`  响应头:`, errorInfo.headers)
    
    console.log('📡 服务器错误详情:')
    const responseData = errorInfo.responseData
    if (responseData) {
      if (typeof responseData === 'string') {
        console.log('  原始响应:', responseData)
      } else {
        console.log('  响应对象:', responseData)
        if (responseData.message) console.log('  错误消息:', responseData.message)
        if (responseData.error) console.log('  错误:', responseData.error)
        if (responseData.details) console.log('  详细信息:', responseData.details)
        if (responseData.stack) console.log('  堆栈:', responseData.stack)
      }
    }
    
    console.log('📡 上下文信息:')
    console.log('  页面:', errorInfo.context.page || '未知')
    console.log('  组件:', errorInfo.context.component || '未知')
    console.log('  操作:', errorInfo.context.action || '未知')
    
    console.groupEnd()
  }

  // 获取错误历史
  getErrorHistory() {
    return this.errorHistory
  }

  // 清除历史记录
  clearHistory() {
    this.errorHistory = []
  }

  // 生成错误报告
  generateReport() {
    if (this.errorHistory.length === 0) {
      return '暂无500错误记录'
    }

    let report = '🔥 500错误报告\n'
    report += '=' .repeat(50) + '\n\n'
    
    this.errorHistory.forEach((error, index) => {
      report += `${index + 1}. ${error.timestamp}\n`
      report += `   请求: ${error.method} ${error.url}\n`
      report += `   状态: ${error.status}\n`
      if (error.responseData?.message) {
        report += `   错误: ${error.responseData.message}\n`
      }
      report += '\n'
    })
    
    return report
  }

  // 获取最常见的错误URL
  getMostCommonErrorUrls() {
    const urlCount = {}
    this.errorHistory.forEach(error => {
      const url = error.url
      urlCount[url] = (urlCount[url] || 0) + 1
    })
    
    return Object.entries(urlCount)
      .sort(([,a], [,b]) => b - a)
      .map(([url, count]) => ({ url, count }))
  }
}

// 创建全局实例
export const errorAnalyzer = new ErrorAnalyzer()

// 便捷方法
export const analyze500Error = (error, context) => {
  return errorAnalyzer.analyze500Error(error, context)
}

export const getErrorReport = () => {
  return errorAnalyzer.generateReport()
}

export const clearErrorHistory = () => {
  errorAnalyzer.clearHistory()
}