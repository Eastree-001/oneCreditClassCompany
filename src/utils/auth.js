// JWT token 解析和验证工具

/**
 * 解析JWT token（不验证签名，仅获取payload）
 * @param {string} token - JWT token
 * @returns {Object|null} - 解析后的payload对象，解析失败返回null
 */
export const parseJWT = (token) => {
  try {
    if (!token) return null
    
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT解析失败:', error)
    return null
  }
}

/**
 * 检查token是否过期
 * @param {string} token - JWT token
 * @returns {boolean} - true表示已过期，false表示未过期或无效token
 */
export const isTokenExpired = (token) => {
  const payload = parseJWT(token)
  if (!payload) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp ? payload.exp < currentTime : false
}

/**
 * 检查token是否即将过期（例如5分钟内）
 * @param {string} token - JWT token
 * @param {number} bufferTime - 缓冲时间（秒），默认300秒（5分钟）
 * @returns {boolean} - true表示即将过期
 */
export const isTokenExpiringSoon = (token, bufferTime = 300) => {
  const payload = parseJWT(token)
  if (!payload) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp ? payload.exp < currentTime + bufferTime : false
}

/**
 * 获取token中的用户信息
 * @param {string} token - JWT token
 * @returns {Object|null} - 用户信息对象
 */
export const getUserInfoFromToken = (token) => {
  const payload = parseJWT(token)
  if (!payload) return null
  
  return {
    userId: payload.userId || payload.sub || payload.id,
    username: payload.username || payload.name,
    email: payload.email,
    companyName: payload.companyName,
    roles: payload.roles || payload.authorities || [],
    permissions: payload.permissions || []
  }
}

/**
 * 验证token的基本格式
 * @param {string} token - JWT token
 * @returns {boolean} - true表示格式正确
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  return parts.length === 3 && parts.every(part => part.length > 0)
}

/**
 * 从localStorage获取有效的token
 * @param {string} mode - 'enterprise' | 'university'
 * @returns {string|null} - 有效token或null
 */
export const getValidToken = (mode = null) => {
  // 如果没有指定模式，从 app store 获取当前模式
  if (!mode) {
    const appMode = localStorage.getItem('appMode') || 'enterprise'
    mode = appMode
  }

  const tokenKey = mode === 'university' ? 'token_university' : 'token'
  const userInfoKey = mode === 'university' ? 'userInfo_university' : 'userInfo'
  const token = localStorage.getItem(tokenKey)

  console.log('获取token验证:', {
    mode: mode,
    tokenKey: tokenKey,
    hasToken: !!token,
    tokenFormat: isValidTokenFormat(token),
    isExpired: token ? isTokenExpired(token) : null
  })

  if (!token || !isValidTokenFormat(token)) {
    console.log('Token格式无效，清除token')
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userInfoKey)
    return null
  }

  if (isTokenExpired(token)) {
    console.log('Token已过期，清除token和用户信息')
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userInfoKey)
    return null
  }

  console.log('Token验证通过')
  return token
}