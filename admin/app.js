// 中文注释：管理员小程序应用入口，负责初始化云开发环境并提供全局初始化方法。
App({
  // 中文注释：应用启动时立即初始化云开发，保证后续页面和工具方法都能直接调用云函数与云存储。
  onLaunch() {
    console.log('管理员小程序：应用启动，准备初始化云开发环境')
    this.initCloud()
    console.log('管理员小程序：应用启动流程完成')
  },
  // 中文注释：统一初始化云开发环境，避免页面层重复执行初始化逻辑。
  initCloud() {
    console.log('管理员小程序：开始执行云开发初始化')

    if (!wx.cloud) {
      console.error('管理员小程序：当前基础库不支持云开发能力')
      return
    }

    if (this.cloudInitialized) {
      console.log('管理员小程序：云开发环境已初始化，本次直接复用现有状态')
      return
    }

    wx.cloud.init({
      env: 'cloud1-5gprp4v6c761393f',
      traceUser: true,
    })
    this.cloudInitialized = true
    console.log('管理员小程序：云开发初始化完成')
  },
})
