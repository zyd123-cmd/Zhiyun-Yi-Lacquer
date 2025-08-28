export default {
  // 为当前模块开启命名空间
  namespaced: true,

  // 模块的 state 数据
  state: () => ({
    userid: JSON.parse(uni.getStorageSync('userid') || '[]'),
    Tank:JSON.parse(uni.getStorageSync('Tank') || false),
    loginTank:JSON.parse(uni.getStorageSync('Tank') || true),
  }),

  // 模块的 mutations 方法
  mutations: {
    // 更新userid
    updateUserid(state, userid) {
      state.userid = userid
      console.log('存到本地的userid是',userid);
      // 通过 this.commit() 方法，调用 m_user 模块下的 saveUserInfoToStorage 方法，将 userinfo 对象持久化存储到本地
      this.commit('m_user/saveUseridToStorage')
    },
    // 更新 Tank
    updateTank(state,Tank) {
      state. Tank =  Tank
      console.log('存到本地的 Tank是', Tank);
      // 通过 this.commit() 方法，调用 m_user 模块下的 saveUserInfoToStorage 方法，将 userinfo 对象持久化存储到本地
      this.commit('m_user/saveTankToStorage')
    },
    // 更新 loginTank
    updateloginTank(state,loginTank) {
      state. loginTank =  loginTank
      console.log('存到本地的 loginTank是', loginTank);
      // 通过 this.commit() 方法，调用 m_user 模块下的 saveUserInfoToStorage 方法，将 userinfo 对象持久化存储到本地
      this.commit('m_user/saveloginTankToStorage')
    },
     // 将 userid 持久化存储到本地
      saveUseridToStorage(state) {
        uni.setStorageSync('userid', JSON.stringify(state.userid))
      },
      // 将 Tank 持久化存储到本地
       saveTankToStorage(state) {
         uni.setStorageSync('Tank', JSON.stringify(state.Tank))
       },
       // 将 loginTank 持久化存储到本地
        saveloginTankToStorage(state) {
          uni.setStorageSync('loginTank ', JSON.stringify(state.loginTank ))
        }
  },

  // 模块的 getters 属性
  getters: {},
}