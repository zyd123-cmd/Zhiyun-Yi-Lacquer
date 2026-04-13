const {
  callAdminAction,
  formatTime,
  initCloud,
} = require('../../utils/admin')

Page({
  // 中文注释：页面初始数据，用于维护文章列表和加载状态。
  data: {
    isLoading: false,
    articleList: [],
  },
  // 中文注释：页面显示时刷新文章列表，保证管理员返回后能看到最新内容。
  onShow() {
    console.log('管理员文章列表页：页面显示，准备刷新文章列表')
    initCloud()
    this.loadArticleList()
  },
  // 中文注释：加载文章列表并补充封面图与更新时间文本，便于页面直接渲染。
  async loadArticleList() {
    console.log('管理员文章列表页：开始加载文章列表')
    this.setData({
      isLoading: true,
    })

    try {
      const result = await callAdminAction('listArticles')
      console.log('管理员文章列表页：文章列表云函数返回成功', result)
      const articleList = (result.data || []).map((article) => ({
        ...article,
        coverImage: Array.isArray(article.imagesrc) && article.imagesrc.length ? article.imagesrc[0] : '',
        updatedAtText: formatTime(article.updatedAt),
      }))
      this.setData({
        articleList,
      })
      console.log('管理员文章列表页：文章列表同步完成', articleList.length)
    } catch (error) {
      console.error('管理员文章列表页：文章列表加载失败', error)
      wx.showToast({
        title: error.message || '文章列表加载失败',
        icon: 'none',
      })
    } finally {
      this.setData({
        isLoading: false,
      })
      console.log('管理员文章列表页：文章列表加载流程结束')
    }
  },
  // 中文注释：跳转到文章创建页，供管理员新增文章。
  goToCreateArticle() {
    console.log('管理员文章列表页：准备跳转到文章创建页')
    wx.navigateTo({
      url: '/pages/article-form/article-form',
    })
  },
  // 中文注释：跳转到文章编辑页，供管理员编辑当前文章。
  editArticle(event) {
    const articleId = event.currentTarget.dataset.id || ''
    console.log('管理员文章列表页：准备跳转到文章编辑页', articleId)
    wx.navigateTo({
      url: `/pages/article-form/article-form?articleId=${articleId}`,
    })
  },
  // 中文注释：删除文章前先确认，确认后调用后台删除接口并刷新列表。
  async deleteArticle(event) {
    const articleId = event.currentTarget.dataset.id || ''
    console.log('管理员文章列表页：开始删除文章流程', articleId)

    if (!articleId) {
      console.log('管理员文章列表页：当前缺少文章 id，无法执行删除')
      return
    }

    const { confirm } = await wx.showModal({
      title: '提示',
      content: '确认删除这篇文章吗？删除后文章评论也会一起清理。',
    })
    console.log('管理员文章列表页：删除文章确认框返回结果', confirm)

    if (!confirm) {
      console.log('管理员文章列表页：用户取消删除文章')
      return
    }

    try {
      const result = await callAdminAction('deleteArticle', {
        articleId,
      })
      console.log('管理员文章列表页：文章删除成功', result)
      wx.showToast({
        title: '文章已删除',
        icon: 'success',
      })
      this.loadArticleList()
    } catch (error) {
      console.error('管理员文章列表页：文章删除失败', error)
      wx.showToast({
        title: error.message || '文章删除失败',
        icon: 'none',
      })
    }
  },
})
