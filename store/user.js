const USER_ID_STORAGE_KEY = 'userId'
const OPEN_ID_STORAGE_KEY = 'openId'
const LOGIN_STATUS_STORAGE_KEY = 'isLoggedIn'
const MANUAL_LOGOUT_STORAGE_KEY = 'manualLogout'

// 中文注释：统一读取本地缓存，避免每次都重复解析逻辑。
function readStorageValue(storageKey, fallbackValue) {
  console.log('用户状态模块：开始读取本地缓存', storageKey)
  const rawValue = uni.getStorageSync(storageKey)
  console.log('用户状态模块：读取到的原始缓存内容', storageKey, rawValue)
  return JSON.parse(rawValue || fallbackValue)
}

// 中文注释：统一写入本地缓存，保证用户会话相关字段始终同步。
function writeStorageValue(storageKey, value) {
  console.log('用户状态模块：开始写入本地缓存', storageKey, value)
  uni.setStorageSync(storageKey, JSON.stringify(value))
  console.log('用户状态模块：本地缓存写入完成', storageKey)
}

export default {
  namespaced: true,

  state: () => ({
    userId: readStorageValue(USER_ID_STORAGE_KEY, '""'),
    openId: readStorageValue(OPEN_ID_STORAGE_KEY, '""'),
    isLoggedIn: readStorageValue(LOGIN_STATUS_STORAGE_KEY, 'false'),
    manualLogout: readStorageValue(MANUAL_LOGOUT_STORAGE_KEY, 'false'),
  }),

  mutations: {
    setUserId(state, userId) {
      console.log('用户状态模块：准备更新 userId', userId)
      state.userId = userId
      writeStorageValue(USER_ID_STORAGE_KEY, userId)
      console.log('用户状态模块：userId 更新完成', state.userId)
    },
    setOpenId(state, openId) {
      console.log('用户状态模块：准备更新 openId', openId)
      state.openId = openId
      writeStorageValue(OPEN_ID_STORAGE_KEY, openId)
      console.log('用户状态模块：openId 更新完成', state.openId)
    },
    setLoginStatus(state, isLoggedIn) {
      const normalizedStatus = Boolean(isLoggedIn)
      console.log('用户状态模块：准备更新登录状态', normalizedStatus)
      state.isLoggedIn = normalizedStatus
      writeStorageValue(LOGIN_STATUS_STORAGE_KEY, normalizedStatus)
      console.log('用户状态模块：登录状态更新完成', state.isLoggedIn)
    },
    setManualLogout(state, manualLogout) {
      const normalizedStatus = Boolean(manualLogout)
      console.log('用户状态模块：准备更新手动退出标记', normalizedStatus)
      state.manualLogout = normalizedStatus
      writeStorageValue(MANUAL_LOGOUT_STORAGE_KEY, normalizedStatus)
      console.log('用户状态模块：手动退出标记更新完成', state.manualLogout)
    },
    clearUserSession(state) {
      console.log('用户状态模块：开始清空本地用户会话')
      state.userId = ''
      state.openId = ''
      state.isLoggedIn = false
      state.manualLogout = true
      writeStorageValue(USER_ID_STORAGE_KEY, state.userId)
      writeStorageValue(OPEN_ID_STORAGE_KEY, state.openId)
      writeStorageValue(LOGIN_STATUS_STORAGE_KEY, state.isLoggedIn)
      writeStorageValue(MANUAL_LOGOUT_STORAGE_KEY, state.manualLogout)
      console.log('用户状态模块：本地用户会话清空完成')
    },
  },
}
