const ADMIN_CLOUD_FUNCTION_NAME = 'adminPortal'
const ADMIN_SESSION_TOKEN_STORAGE_KEY = 'adminSessionToken'
const ADMIN_PROFILE_STORAGE_KEY = 'adminProfile'

// 中文注释：统一初始化云开发环境，保证管理员工具函数独立调用时也能正常工作。
function initCloud() {
  console.log('管理员工具模块：开始初始化云开发环境')
  const app = getApp()

  if (app && typeof app.initCloud === 'function') {
    app.initCloud()
    console.log('管理员工具模块：已通过应用实例完成云开发初始化')
    return
  }

  wx.cloud.init({
    env: 'cloud1-5gprp4v6c761393f',
    traceUser: true,
  })
  console.log('管理员工具模块：已直接完成云开发初始化')
}

// 中文注释：统一对管理员请求参数做脱敏处理，避免调试日志直接暴露密码和会话 token。
function maskSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data
  }

  const maskedData = {
    ...data,
  }

  if (Object.prototype.hasOwnProperty.call(maskedData, 'password')) {
    maskedData.password = maskedData.password ? '***' : ''
  }

  if (Object.prototype.hasOwnProperty.call(maskedData, 'sessionToken')) {
    maskedData.sessionToken = maskedData.sessionToken ? '***' : ''
  }

  return maskedData
}

// 中文注释：统一读取本地管理员会话 token，用于后续后台接口鉴权。
function getSessionToken() {
  const sessionToken = wx.getStorageSync(ADMIN_SESSION_TOKEN_STORAGE_KEY) || ''
  console.log('管理员工具模块：管理员会话 token 读取完成', sessionToken ? '***' : '')
  return sessionToken
}

// 中文注释：统一写入管理员会话信息，保证后台项目重启后仍可恢复登录态。
function saveAdminSession(adminProfile) {
  console.log('管理员工具模块：开始保存管理员会话信息', maskSensitiveData(adminProfile || {}))
  const sessionToken = adminProfile && adminProfile.sessionToken ? adminProfile.sessionToken : ''
  wx.setStorageSync(ADMIN_SESSION_TOKEN_STORAGE_KEY, sessionToken)
  wx.setStorageSync(ADMIN_PROFILE_STORAGE_KEY, adminProfile || {})
  console.log('管理员工具模块：管理员会话信息保存完成', sessionToken ? '***' : '')
}

// 中文注释：统一清空管理员会话信息，用于退出登录和登录失效场景。
function clearAdminSession() {
  console.log('管理员工具模块：开始清空管理员会话信息')
  wx.removeStorageSync(ADMIN_SESSION_TOKEN_STORAGE_KEY)
  wx.removeStorageSync(ADMIN_PROFILE_STORAGE_KEY)
  console.log('管理员工具模块：管理员会话信息清空完成')
}

// 中文注释：统一读取本地缓存的管理员资料，用于页面头部展示。
function getStoredAdminProfile() {
  const adminProfile = wx.getStorageSync(ADMIN_PROFILE_STORAGE_KEY) || null
  console.log('管理员工具模块：本地管理员资料读取完成', maskSensitiveData(adminProfile || {}))
  return adminProfile
}

// 中文注释：统一调用管理员云函数入口，自动携带本地 sessionToken 并处理登录失效场景。
async function callAdminAction(action, data = {}, options = {}) {
  console.log('管理员工具模块：开始调用管理员云函数动作', {
    action,
    data: maskSensitiveData(data),
    options,
  })
  initCloud()

  const shouldAttachSession = options.withoutSession !== true
  const payload = shouldAttachSession
    ? {
        action,
        sessionToken: getSessionToken(),
        ...data,
      }
    : {
        action,
        ...data,
      }
  console.log('管理员工具模块：管理员云函数请求参数组装完成', maskSensitiveData(payload))

  const response = await wx.cloud.callFunction({
    name: ADMIN_CLOUD_FUNCTION_NAME,
    data: payload,
  })
  const result = response && response.result ? response.result : {}
  console.log('管理员工具模块：管理员云函数返回结果', result)

  if (result && result.success === false) {
    const errorMessage = result.message || '管理员后台请求失败'
    console.error('管理员工具模块：管理员云函数返回失败结果', errorMessage)

    if (
      shouldAttachSession &&
      (
        errorMessage.indexOf('重新登录') !== -1 ||
        errorMessage.indexOf('会话') !== -1 ||
        errorMessage.indexOf('登录') !== -1
      )
    ) {
      console.log('管理员工具模块：检测到管理员会话失效，准备清空本地会话')
      clearAdminSession()
    }

    throw new Error(errorMessage)
  }

  return result
}

// 中文注释：统一上传图片列表到云存储，供文章封面和模型封面上传流程复用。
async function uploadImageList(tempFilePathList, cloudFolderName) {
  console.log('管理员工具模块：开始批量上传图片到云存储', {
    tempFilePathList,
    cloudFolderName,
  })
  initCloud()

  const uploadTaskList = (tempFilePathList || []).map((tempFilePath) => {
    const suffixMatch = /\.[^\\.]+$/.exec(tempFilePath)
    const suffix = suffixMatch ? suffixMatch[0] : '.png'
    const cloudPath = `${cloudFolderName}/${Date.now()}-${Math.random().toString(16).slice(2)}${suffix}`
    console.log('管理员工具模块：开始上传单张图片', {
      tempFilePath,
      cloudPath,
    })

    return wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
    }).then((uploadResult) => {
      console.log('管理员工具模块：单张图片上传完成', uploadResult.fileID)
      return uploadResult.fileID
    })
  })

  const fileIdList = await Promise.all(uploadTaskList)
  console.log('管理员工具模块：图片批量上传完成', fileIdList)
  return fileIdList
}

// 中文注释：统一上传单个文件到云存储，供 glb 模型文件上传流程复用。
async function uploadSingleFile(tempFilePath, fileName, cloudFolderName) {
  console.log('管理员工具模块：开始上传单个文件到云存储', {
    tempFilePath,
    fileName,
    cloudFolderName,
  })
  initCloud()
  const safeFileName = fileName || `file-${Date.now()}`
  const cloudPath = `${cloudFolderName}/${Date.now()}-${safeFileName}`
  const uploadResult = await wx.cloud.uploadFile({
    cloudPath,
    filePath: tempFilePath,
  })
  console.log('管理员工具模块：单个文件上传完成', uploadResult.fileID)
  return uploadResult.fileID
}

// 中文注释：统一格式化时间，供管理员列表页显示创建时间和更新时间。
function formatTime(timestamp) {
  console.log('管理员工具模块：开始格式化时间', timestamp)

  if (!timestamp) {
    return '暂无时间'
  }

  const date = new Date(Number(timestamp))
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const formattedTime = `${year}-${month}-${day} ${hour}:${minute}`
  console.log('管理员工具模块：时间格式化完成', formattedTime)
  return formattedTime
}

module.exports = {
  callAdminAction,
  clearAdminSession,
  formatTime,
  getSessionToken,
  getStoredAdminProfile,
  initCloud,
  saveAdminSession,
  uploadImageList,
  uploadSingleFile,
}
