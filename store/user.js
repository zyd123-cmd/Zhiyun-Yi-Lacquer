const USER_ID_STORAGE_KEY = 'userId'
const LOGIN_STATUS_STORAGE_KEY = 'isLoggedIn'

export default {
  namespaced: true,

  state: () => ({
    userId: JSON.parse(uni.getStorageSync(USER_ID_STORAGE_KEY) || '""'),
    isLoggedIn: JSON.parse(uni.getStorageSync(LOGIN_STATUS_STORAGE_KEY) || 'false'),
  }),

  mutations: {
    setUserId(state, userId) {
      state.userId = userId
      uni.setStorageSync(USER_ID_STORAGE_KEY, JSON.stringify(userId))
    },
    setLoginStatus(state, isLoggedIn) {
      state.isLoggedIn = Boolean(isLoggedIn)
      uni.setStorageSync(LOGIN_STATUS_STORAGE_KEY, JSON.stringify(Boolean(isLoggedIn)))
    },
  },
}
