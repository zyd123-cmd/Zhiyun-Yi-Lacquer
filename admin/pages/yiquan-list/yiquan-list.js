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
    statusIndex: 1,
    statusOptions: STATUS_OPTIONS,
    postList: [],
    displayPostList: [],
  },
  // 中文注释：页面显示时刷新列表，保证管理员回到审核页能看到最新投稿状态。
  onShow() {
    console.log('管理员彝圈审核页：页面显示，准备加载彝圈动态列表')
    initCloud()
    this.loadPostList()
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
  async loadPostList() {
    console.log('管理员彝圈审核页：开始加载彝圈动态列表')
    this.setData({ isLoading: true })

    try {
      const result = await callAdminAction('listYiquanPosts')
      console.log('管理员彝圈审核页：彝圈动态列表云函数返回结果', result)
      const postList = (result.data || []).map((post) => this.formatPost(post))
      this.setData({ postList })
      this.applyStatusFilter()
      console.log('管理员彝圈审核页：彝圈动态列表加载完成', postList.length)
    } catch (error) {
      console.error('管理员彝圈审核页：彝圈动态列表加载失败', error)
      wx.showToast({
        title: error.message || '彝圈动态加载失败',
        icon: 'none',
      })
    } finally {
      this.setData({ isLoading: false })
      console.log('管理员彝圈审核页：彝圈动态列表加载流程结束')
    }
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
  // 中文注释：统一执行通过或驳回审核动作，成功后刷新列表。
  async reviewPost(event) {
    const postId = event.currentTarget.dataset.id || ''
    const reviewStatus = event.currentTarget.dataset.status || ''
    console.log('管理员彝圈审核页：开始执行动态审核动作', { postId, reviewStatus })

    if (!postId || (reviewStatus !== 'approved' && reviewStatus !== 'rejected')) {
      console.log('管理员彝圈审核页：审核动作参数不完整，直接终止')
      return
    }

    const modalResult = await wx.showModal({
      title: '提示',
      content: reviewStatus === 'approved' ? '确认通过这条彝圈动态吗？' : '确认驳回这条彝圈动态吗？',
    })
    console.log('管理员彝圈审核页：动态审核确认框返回结果', modalResult)

    if (!modalResult.confirm) {
      console.log('管理员彝圈审核页：管理员取消了动态审核动作')
      return
    }

    try {
      const result = await callAdminAction('reviewYiquanPost', {
        postId,
        reviewStatus,
        reviewRemark: reviewStatus === 'approved' ? '管理员审核通过' : '管理员审核驳回',
      })
      console.log('管理员彝圈审核页：动态审核动作执行成功', result)
      wx.showToast({
        title: result.message || '审核完成',
        icon: 'success',
      })
      this.loadPostList()
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
    const postId = event.currentTarget.dataset.id || ''
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
      this.loadPostList()
    } catch (error) {
      console.error('管理员彝圈审核页：动态删除动作执行失败', error)
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none',
      })
    }
  },
})
