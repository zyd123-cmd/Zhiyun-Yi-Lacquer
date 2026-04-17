const {
  callAdminAction,
  clearAdminSession,
  formatTime,
  getSessionToken,
  getStoredAdminProfile,
  initCloud,
  saveAdminSession,
} = require('../../utils/admin')

Page({
  // 中文注释：页面初始数据，用于展示管理员资料和最近登录时间。
  data: {
    adminProfile: {},
    lastLoginTimeText: '暂无时间',
  },
  // 中文注释：页面展示时刷新管理员资料，确保后台首页展示的是最新登录态。
  onShow() {
    console.log('管理员后台首页：页面显示，准备刷新管理员资料')
    initCloud()
    this.loadAdminProfile()
  },
  // 中文注释：读取当前管理员资料，没有有效会话时自动跳回登录页。
  async loadAdminProfile() {
    console.log('管理员后台首页：开始读取管理员资料')

    if (!getSessionToken()) {
      console.log('管理员后台首页：当前不存在管理员会话，准备跳转登录页')
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return
    }

    try {
      const result = await callAdminAction('getProfile')
      console.log('管理员后台首页：管理员资料读取成功', result)
      saveAdminSession(result.data)
      this.setData({
        adminProfile: result.data || {},
        lastLoginTimeText: formatTime(result.data && result.data.lastLoginAt),
      })
      console.log('管理员后台首页：管理员资料同步完成', this.data.adminProfile)
    } catch (error) {
      console.error('管理员后台首页：管理员资料读取失败，准备跳转登录页', error)
      clearAdminSession()
      const cachedProfile = getStoredAdminProfile()
      console.log('管理员后台首页：当前缓存的管理员资料为', cachedProfile || {})
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
  },
  // 中文注释：跳转到文章发布页，供管理员新增文章内容。
  goToArticleForm() {
    console.log('管理员后台首页：准备跳转到文章发布页')
    wx.navigateTo({
      url: '/pages/article-form/article-form',
    })
  },
  // 中文注释：跳转到文章列表管理页，供管理员查看和删除文章。
  goToArticleList() {
    console.log('管理员后台首页：准备跳转到文章列表管理页')
    wx.navigateTo({
      url: '/pages/article-list/article-list',
    })
  },
  // 中文注释：跳转到模型上传页，供管理员上传 glb 模型和封面。
  goToModelForm() {
    console.log('管理员后台首页：准备跳转到模型上传页')
    wx.navigateTo({
      url: '/pages/model-form/model-form',
    })
  },
  // 中文注释：跳转到模型列表管理页，供管理员查看和删除模型。
  goToModelList() {
    console.log('管理员后台首页：准备跳转到模型列表管理页')
    wx.navigateTo({
      url: '/pages/model-list/model-list',
    })
  },
  // 中文注释：跳转到彝圈审核页，供管理员审核普通用户提交的动态内容。
  goToYiquanList() {
    console.log('管理员后台首页：准备跳转到彝圈审核页')
    wx.navigateTo({
      url: '/pages/yiquan-list/yiquan-list',
    })
  },
  // 中文注释：执行管理员退出登录逻辑，同时清空本地会话并回到登录页。
  async logout() {
    console.log('管理员后台首页：开始执行管理员退出登录流程')
    const { confirm } = await wx.showModal({
      title: '提示',
      content: '确认退出管理员后台吗？',
    })
    console.log('管理员后台首页：退出确认框返回结果', confirm)

    if (!confirm) {
      console.log('管理员后台首页：用户取消退出登录')
      return
    }

    try {
      await callAdminAction('logout')
      console.log('管理员后台首页：管理员退出登录云函数执行完成')
    } catch (error) {
      console.error('管理员后台首页：管理员退出登录云函数执行失败，继续清理本地会话', error)
    }

    clearAdminSession()
    wx.reLaunch({
      url: '/pages/login/login',
    })
  },
})
