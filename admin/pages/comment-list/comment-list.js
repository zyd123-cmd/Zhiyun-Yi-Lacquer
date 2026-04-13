const {
  callAdminAction,
  formatTime,
  initCloud,
} = require('../../utils/admin')

Page({
  // 中文注释：页面初始数据，用于维护评论列表和加载状态。
  data: {
    isLoading: false,
    commentList: [],
  },
  // 中文注释：页面显示时刷新评论列表，确保管理员看到最新评论状态。
  onShow() {
    console.log('管理员评论列表页：页面显示，准备刷新评论列表')
    initCloud()
    this.loadCommentList()
  },
  // 中文注释：加载评论列表并补充格式化时间，便于页面直接渲染。
  async loadCommentList() {
    console.log('管理员评论列表页：开始加载评论列表')
    this.setData({
      isLoading: true,
    })

    try {
      const result = await callAdminAction('listComments')
      console.log('管理员评论列表页：评论列表云函数返回成功', result)
      const commentList = (result.data || []).map((comment) => ({
        ...comment,
        createdAtText: formatTime(comment.createdAt),
      }))
      this.setData({
        commentList,
      })
      console.log('管理员评论列表页：评论列表同步完成', commentList.length)
    } catch (error) {
      console.error('管理员评论列表页：评论列表加载失败', error)
      wx.showToast({
        title: error.message || '评论列表加载失败',
        icon: 'none',
      })
    } finally {
      this.setData({
        isLoading: false,
      })
      console.log('管理员评论列表页：评论列表加载流程结束')
    }
  },
  // 中文注释：管理员删除评论前先确认，确认后调用后台删除接口并刷新评论列表。
  async deleteComment(event) {
    const commentId = event.currentTarget.dataset.id || ''
    console.log('管理员评论列表页：开始删除评论流程', commentId)

    if (!commentId) {
      console.log('管理员评论列表页：当前缺少评论 id，无法执行删除')
      return
    }

    const { confirm } = await wx.showModal({
      title: '提示',
      content: '确认删除这条评论吗？存在回复时会保留回复链并标记该评论已删除。',
    })
    console.log('管理员评论列表页：删除评论确认框返回结果', confirm)

    if (!confirm) {
      console.log('管理员评论列表页：用户取消删除评论')
      return
    }

    try {
      const result = await callAdminAction('deleteComment', {
        commentId,
      })
      console.log('管理员评论列表页：评论删除成功', result)
      wx.showToast({
        title: '评论已删除',
        icon: 'success',
      })
      this.loadCommentList()
    } catch (error) {
      console.error('管理员评论列表页：评论删除失败', error)
      wx.showToast({
        title: error.message || '评论删除失败',
        icon: 'none',
      })
    }
  },
})
