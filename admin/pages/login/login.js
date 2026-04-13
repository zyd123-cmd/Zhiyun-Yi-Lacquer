const {
  callAdminAction,
  getSessionToken,
  initCloud,
  saveAdminSession,
} = require('../../utils/admin')

Page({
  // 中文注释：页面初始数据，分别维护登录表单和初始化管理员表单。
  data: {
    activeTab: 0,
    isSubmitting: false,
    loginForm: {
      account: '',
      password: '',
    },
    bootstrapForm: {
      nickName: '',
      account: '',
      password: '',
    },
  },
  // 中文注释：页面加载时先初始化云开发，并尝试根据本地 sessionToken 静默恢复管理员登录态。
  onLoad() {
    console.log('管理员登录页：页面加载完成，准备初始化云开发并尝试恢复管理员登录态')
    initCloud()

    if (getSessionToken()) {
      console.log('管理员登录页：检测到本地存在管理员会话，准备尝试静默恢复登录态')
      this.restoreAdminSession()
      return
    }

    console.log('管理员登录页：当前不存在管理员会话，继续停留在登录页面')
  },
  // 中文注释：切换登录 Tab，便于在“登录”和“初始化管理员”之间切换。
  handleTabChange(event) {
    console.log('管理员登录页：收到 Tab 切换事件', event.detail)
    this.setData({
      activeTab: Number(event.detail.index || 0),
    })
    console.log('管理员登录页：Tab 切换完成', this.data.activeTab)
  },
  // 中文注释：统一同步表单字段输入，减少各输入框单独维护逻辑。
  handleFieldChange(event) {
    console.log('管理员登录页：收到表单输入变更事件', event.currentTarget.dataset, event.detail)
    const formName = event.currentTarget.dataset.form
    const fieldName = event.currentTarget.dataset.field
    const value = event.detail

    if (!formName || !fieldName) {
      console.log('管理员登录页：当前表单输入变更缺少表单名或字段名，直接忽略')
      return
    }

    this.setData({
      [`${formName}.${fieldName}`]: value,
    })
    console.log('管理员登录页：表单字段同步完成', {
      formName,
      fieldName,
      value,
    })
  },
  // 中文注释：静默恢复管理员登录态，避免管理员每次进入后台都重复输入账号密码。
  async restoreAdminSession() {
    console.log('管理员登录页：开始静默恢复管理员登录态')

    try {
      const result = await callAdminAction('getProfile')
      console.log('管理员登录页：管理员资料读取成功，准备更新本地会话并跳转后台首页', result)
      saveAdminSession(result.data)
      wx.reLaunch({
        url: '/pages/dashboard/dashboard',
      })
    } catch (error) {
      console.error('管理员登录页：静默恢复管理员登录态失败', error)
    }
  },
  // 中文注释：提交管理员登录请求，成功后保存本地会话并进入后台首页。
  async submitLogin() {
    console.log('管理员登录页：开始提交管理员登录请求', {
      account: this.data.loginForm.account,
      hasPassword: Boolean(this.data.loginForm.password),
    })

    if (this.data.isSubmitting) {
      console.log('管理员登录页：当前已有管理员登录请求在执行，忽略重复点击')
      return
    }

    if (!this.data.loginForm.account || !this.data.loginForm.password) {
      console.log('管理员登录页：登录表单缺少账号或密码，阻止提交')
      wx.showToast({
        title: '请填写账号和密码',
        icon: 'none',
      })
      return
    }

    this.setData({
      isSubmitting: true,
    })
    console.log('管理员登录页：管理员登录请求已加锁')

    try {
      const result = await callAdminAction('login', this.data.loginForm, {
        withoutSession: true,
      })
      console.log('管理员登录页：管理员登录成功，准备保存本地会话', result)
      saveAdminSession(result.data)
      wx.showToast({
        title: '登录成功',
        icon: 'success',
      })
      wx.reLaunch({
        url: '/pages/dashboard/dashboard',
      })
    } catch (error) {
      console.error('管理员登录页：管理员登录失败', error)
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none',
      })
    } finally {
      this.setData({
        isSubmitting: false,
      })
      console.log('管理员登录页：管理员登录流程结束，已释放请求锁')
    }
  },
  // 中文注释：初始化首个管理员账号，成功后直接保存会话并进入后台首页。
  async submitBootstrap() {
    console.log('管理员登录页：开始提交管理员初始化请求', {
      nickName: this.data.bootstrapForm.nickName,
      account: this.data.bootstrapForm.account,
      hasPassword: Boolean(this.data.bootstrapForm.password),
    })

    if (this.data.isSubmitting) {
      console.log('管理员登录页：当前已有管理员初始化请求在执行，忽略重复点击')
      return
    }

    if (!this.data.bootstrapForm.account || !this.data.bootstrapForm.password) {
      console.log('管理员登录页：初始化管理员表单缺少账号或密码，阻止提交')
      wx.showToast({
        title: '请填写账号和密码',
        icon: 'none',
      })
      return
    }

    this.setData({
      isSubmitting: true,
    })
    console.log('管理员登录页：管理员初始化请求已加锁')

    try {
      const result = await callAdminAction('bootstrapAdmin', this.data.bootstrapForm, {
        withoutSession: true,
      })
      console.log('管理员登录页：管理员初始化成功，准备保存本地会话', result)
      saveAdminSession(result.data)
      wx.showToast({
        title: '初始化成功',
        icon: 'success',
      })
      wx.reLaunch({
        url: '/pages/dashboard/dashboard',
      })
    } catch (error) {
      console.error('管理员登录页：管理员初始化失败', error)
      wx.showToast({
        title: error.message || '初始化失败',
        icon: 'none',
      })
    } finally {
      this.setData({
        isSubmitting: false,
      })
      console.log('管理员登录页：管理员初始化流程结束，已释放请求锁')
    }
  },
})
