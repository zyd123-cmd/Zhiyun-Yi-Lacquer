const {
  callAdminAction,
  formatTime,
  initCloud,
} = require('../../utils/admin')

const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

Page({
  // 中文注释：页面初始数据用于维护审核状态筛选、原始动态列表和展示动态列表。
  data: {
    isLoading: false,
    isSilentRefreshing: false,
    lastRefreshTimeText: '',
    statusIndex: 1,
    statusOptions: STATUS_OPTIONS,
    postList: [],
    displayPostList: [],
  },
  // 中文注释：页面加载时初始化自动刷新定时器引用，避免多次进入页面叠加定时任务。
  onLoad() {
    console.log('管理员彝圈审核页：页面加载完成，准备初始化自动刷新状态')
    this.refreshTimer = null
    console.log('管理员彝圈审核页：自动刷新状态初始化完成')
  },
  // 中文注释：页面显示时刷新列表，保证管理员回到审核页能看到最新投稿状态。
  onShow() {
    console.log('管理员彝圈审核页：页面显示，准备加载彝圈动态列表')
    initCloud()
    this.loadPostList()
    this.startAutoRefresh()
  },
  // 中文注释：页面隐藏时停止自动刷新，避免后台页面继续消耗云函数调用次数。
  onHide() {
    console.log('管理员彝圈审核页：页面隐藏，准备停止自动刷新')
    this.stopAutoRefresh()
  },
  // 中文注释：页面卸载时再次兜底停止自动刷新，避免定时器残留造成重复请求。
  onUnload() {
    console.log('管理员彝圈审核页：页面卸载，准备清理自动刷新')
    this.stopAutoRefresh()
  },
  // 中文注释：支持管理员下拉刷新，手动触发时走静默刷新避免页面大面积闪动。
  onPullDownRefresh() {
    console.log('管理员彝圈审核页：收到下拉刷新指令，准备静默加载最新动态')
    this.loadPostList({ silent: true, stopPullDownRefresh: true })
  },
  // 中文注释：统一格式化动态数据，补齐时间文本和状态标签类型，便于模板直接渲染。
  formatPost(post) {
    console.log('管理员彝圈审核页：开始格式化单条动态', post)
    const status = post.status || 'pending'
    const tagTypeMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    }
    const formattedPost = {
      ...post,
      status,
      tagType: tagTypeMap[status] || 'default',
      createdAtText: formatTime(post.createdAt),
      reviewedAtText: post.reviewedAt ? formatTime(post.reviewedAt) : '暂无审核时间',
      imageCount: Array.isArray(post.imageList) ? post.imageList.length : 0,
    }
    console.log('管理员彝圈审核页：单条动态格式化完成', formattedPost)
    return formattedPost
  },
  // 中文注释：统一加载彝圈动态列表，包含待审核、已通过和已驳回三类状态。
  async loadPostList(options = {}) {
    const silent = Boolean(options.silent)
    const stopPullDownRefresh = Boolean(options.stopPullDownRefresh)
    console.log('管理员彝圈审核页：开始加载彝圈动态列表', options)

    if (this.data.isLoading || this.data.isSilentRefreshing) {
      console.log('管理员彝圈审核页：当前已有列表加载任务在执行，跳过本次重复刷新')
      if (stopPullDownRefresh) {
        wx.stopPullDownRefresh()
        console.log('管理员彝圈审核页：重复刷新场景下已停止下拉刷新动画')
      }
      return
    }

    if (silent) {
      this.setData({ isSilentRefreshing: true })
      console.log('管理员彝圈审核页：静默刷新状态已开启')
    } else {
      this.setData({ isLoading: true })
      console.log('管理员彝圈审核页：页面加载状态已开启')
    }

    try {
      const result = await callAdminAction('listYiquanPosts')
      console.log('管理员彝圈审核页：彝圈动态列表云函数返回结果', result)
      const postList = (result.data || []).map((post) => this.formatPost(post))
      const lastRefreshTimeText = formatTime(Date.now())
      this.setData({ postList, lastRefreshTimeText })
      console.log('管理员彝圈审核页：列表数据和最近刷新时间已写入页面状态', lastRefreshTimeText)
      this.applyStatusFilter()
      console.log('管理员彝圈审核页：彝圈动态列表加载完成', postList.length)
    } catch (error) {
      console.error('管理员彝圈审核页：彝圈动态列表加载失败', error)
      const errorMessage = error && error.message ? error.message : ''
      const toastTitle = errorMessage.indexOf('未知的管理员操作类型') !== -1
        ? '请重新上传部署 adminPortal 云函数'
        : error.message || '彝圈动态加载失败'
      wx.showToast({
        title: toastTitle,
        icon: 'none',
      })
    } finally {
      this.setData({ isLoading: false, isSilentRefreshing: false })
      if (stopPullDownRefresh) {
        wx.stopPullDownRefresh()
        console.log('管理员彝圈审核页：下拉刷新动画已停止')
      }
      console.log('管理员彝圈审核页：彝圈动态列表加载流程结束')
    }
  },
  // 中文注释：统一启动自动刷新，保证审核页停留时也能持续拿到最新待审核动态。
  startAutoRefresh() {
    console.log('管理员彝圈审核页：开始启动自动刷新定时器')
    if (this.refreshTimer) {
      console.log('管理员彝圈审核页：自动刷新定时器已存在，跳过重复启动')
      return
    }

    this.refreshTimer = setInterval(() => {
      console.log('管理员彝圈审核页：自动刷新定时器触发，准备静默加载最新动态')
      this.loadPostList({ silent: true })
    }, 8000)
    console.log('管理员彝圈审核页：自动刷新定时器启动完成')
  },
  // 中文注释：统一停止自动刷新，页面离开时主动释放定时器资源。
  stopAutoRefresh() {
    console.log('管理员彝圈审核页：开始停止自动刷新定时器')
    if (!this.refreshTimer) {
      console.log('管理员彝圈审核页：当前没有自动刷新定时器，无需清理')
      return
    }

    clearInterval(this.refreshTimer)
    this.refreshTimer = null
    console.log('管理员彝圈审核页：自动刷新定时器已停止')
  },
  // 中文注释：统一处理管理员点击刷新按钮，立即静默获取最新待审核动态。
  manualRefresh() {
    console.log('管理员彝圈审核页：收到手动刷新指令，准备静默加载最新动态')
    this.loadPostList({ silent: true })
  },
  // 中文注释：统一根据当前 tab 状态过滤动态列表。
  applyStatusFilter() {
    const activeStatus = this.data.statusOptions[this.data.statusIndex].value
    console.log('管理员彝圈审核页：开始按状态过滤动态列表', activeStatus)
    const displayPostList = activeStatus === 'all'
      ? this.data.postList
      : this.data.postList.filter((post) => post.status === activeStatus)
    this.setData({ displayPostList })
    console.log('管理员彝圈审核页：动态列表状态过滤完成', displayPostList.length)
  },
  // 中文注释：统一处理状态 tab 切换，并立刻刷新页面展示列表。
  handleStatusChange(event) {
    const statusIndex = Number(event.detail.index || 0)
    console.log('管理员彝圈审核页：收到状态 tab 切换事件', statusIndex)
    this.setData({ statusIndex }, () => {
      this.applyStatusFilter()
    })
  },
  // 中文注释：统一预览动态图片，方便管理员审核图片内容。
  previewImage(event) {
    const postId = event.currentTarget.dataset.id || ''
    const imageIndex = Number(event.currentTarget.dataset.index || 0)
    console.log('管理员彝圈审核页：开始预览动态图片', { postId, imageIndex })
    const post = this.data.postList.find((item) => item._id === postId)

    if (!post || !Array.isArray(post.imageList) || !post.imageList.length) {
      console.log('管理员彝圈审核页：当前动态没有可预览图片')
      return
    }

    wx.previewImage({
      current: post.imageList[imageIndex] || post.imageList[0],
      urls: post.imageList,
    })
    console.log('管理员彝圈审核页：动态图片预览指令已发出', post.imageList)
  },
  // 中文注释：统一收集审核动作需要的备注信息，驳回时必须填写明确理由，便于用户端展示驳回原因。
  async collectReviewRemark(reviewStatus) {
    console.log('管理员彝圈审核页：开始收集审核备注信息', reviewStatus)

    if (reviewStatus === 'approved') {
      const approvedModalResult = await wx.showModal({
        title: '提示',
        content: '确认通过这条彝圈动态吗？',
      })
      console.log('管理员彝圈审核页：通过审核确认框返回结果', approvedModalResult)

      if (!approvedModalResult.confirm) {
        console.log('管理员彝圈审核页：管理员取消了通过审核动作')
        return {
          confirmed: false,
          reviewRemark: '',
        }
      }

      console.log('管理员彝圈审核页：通过审核备注信息收集完成')
      return {
        confirmed: true,
        reviewRemark: '管理员审核通过',
      }
    }

    const rejectedModalResult = await wx.showModal({
      title: '填写驳回理由',
      content: '请输入驳回理由，用户端会看到这条驳回说明。',
      editable: true,
      placeholderText: '例如：图片不清晰、内容与主题无关',
      confirmText: '确认驳回',
      cancelText: '取消',
    })
    console.log('管理员彝圈审核页：驳回理由输入框返回结果', rejectedModalResult)

    if (!rejectedModalResult.confirm) {
      console.log('管理员彝圈审核页：管理员取消了驳回审核动作')
      return {
        confirmed: false,
        reviewRemark: '',
      }
    }

    const reviewRemark = typeof rejectedModalResult.content === 'string'
      ? rejectedModalResult.content.trim()
      : ''
    console.log('管理员彝圈审核页：驳回理由规整完成', reviewRemark)

    if (!reviewRemark) {
      console.log('管理员彝圈审核页：当前未填写驳回理由，阻止提交驳回审核')
      wx.showToast({
        title: '请先填写驳回理由',
        icon: 'none',
      })
      return {
        confirmed: false,
        reviewRemark: '',
      }
    }

    console.log('管理员彝圈审核页：驳回审核备注信息收集完成', reviewRemark)
    return {
      confirmed: true,
      reviewRemark,
    }
  },
  // 中文注释：统一执行通过或驳回审核动作，成功后刷新列表。
  async reviewPost(event) {
    const postId = (event && event.detail && event.detail.actionId) || event.currentTarget.dataset.id || ''
    const reviewStatus = (event && event.detail && event.detail.actionStatus) || event.currentTarget.dataset.status || ''
    console.log('管理员彝圈审核页：审核动作参数解析完成', {
      detail: event && event.detail ? event.detail : {},
      postId,
      reviewStatus,
    })
    console.log('管理员彝圈审核页：开始执行动态审核动作', { postId, reviewStatus })

    if (!postId || (reviewStatus !== 'approved' && reviewStatus !== 'rejected')) {
      console.log('管理员彝圈审核页：审核动作参数不完整，直接终止')
      return
    }

    const reviewPayload = await this.collectReviewRemark(reviewStatus)
    console.log('管理员彝圈审核页：审核备注收集结果', reviewPayload)

    if (!reviewPayload.confirmed) {
      console.log('管理员彝圈审核页：审核备注收集未通过，结束本次审核动作')
      return
    }

    try {
      const result = await callAdminAction('reviewYiquanPost', {
        postId,
        reviewStatus,
        reviewRemark: reviewPayload.reviewRemark,
      })
      console.log('管理员彝圈审核页：动态审核动作执行成功', result)
      wx.showToast({
        title: result.message || '审核完成',
        icon: 'success',
      })
      this.loadPostList({ silent: true })
    } catch (error) {
      console.error('管理员彝圈审核页：动态审核动作执行失败', error)
      wx.showToast({
        title: error.message || '审核失败',
        icon: 'none',
      })
    }
  },
  // 中文注释：统一执行管理员删除动态动作，删除后同时清理评论并刷新列表。
  async deletePost(event) {
    const postId = (event && event.detail && event.detail.actionId) || event.currentTarget.dataset.id || ''
    console.log('管理员彝圈审核页：删除动作参数解析完成', {
      detail: event && event.detail ? event.detail : {},
      postId,
    })
    console.log('管理员彝圈审核页：开始执行动态删除动作', postId)

    if (!postId) {
      console.log('管理员彝圈审核页：删除动态缺少动态 id，直接终止')
      return
    }

    const modalResult = await wx.showModal({
      title: '提示',
      content: '确认删除这条彝圈动态吗？删除后该动态下评论也会一起清理。',
    })
    console.log('管理员彝圈审核页：动态删除确认框返回结果', modalResult)

    if (!modalResult.confirm) {
      console.log('管理员彝圈审核页：管理员取消了动态删除动作')
      return
    }

    try {
      const result = await callAdminAction('deleteYiquanPost', { postId })
      console.log('管理员彝圈审核页：动态删除动作执行成功', result)
      wx.showToast({
        title: result.message || '动态已删除',
        icon: 'success',
      })
      this.loadPostList({ silent: true })
    } catch (error) {
      console.error('管理员彝圈审核页：动态删除动作执行失败', error)
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none',
      })
    }
  },
})
