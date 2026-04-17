const {
  callAdminAction,
  initCloud,
  uploadImageList,
} = require('../../utils/admin')

Page({
  // 中文注释：页面初始数据，用于维护文章表单、加载状态和编辑文章 id。
  data: {
    articleId: '',
    pageTitle: '发布文章',
    isSubmitting: false,
    form: {
      title: '',
      author: '',
      type: '',
      contentText: '',
      imagesrc: [],
    },
  },
  // 中文注释：页面加载时解析文章 id，编辑场景下自动回填文章详情。
  onLoad(options) {
    console.log('管理员文章表单页：页面加载完成，开始解析文章 id', options || {})
    initCloud()
    const articleId = options && options.articleId ? options.articleId : ''
    this.setData({
      articleId,
      pageTitle: articleId ? '编辑文章' : '发布文章',
    })
    console.log('管理员文章表单页：文章 id 解析完成', articleId)

    if (articleId) {
      this.loadArticleDetail(articleId)
    }
  },
  // 中文注释：统一同步普通表单字段输入，避免各字段重复写赋值逻辑。
  handleFieldChange(event) {
    const fieldName = event.currentTarget.dataset.field
    const fieldValue = event.detail
    console.log('管理员文章表单页：收到普通字段输入变更', {
      fieldName,
      fieldValue,
    })

    if (!fieldName) {
      console.log('管理员文章表单页：当前字段缺少字段名，本次忽略更新')
      return
    }

    this.setData({
      [`form.${fieldName}`]: fieldValue,
    })
    console.log('管理员文章表单页：普通字段同步完成', fieldName)
  },
  // 中文注释：同步文章正文输入内容，供发布文章和编辑文章时复用。
  handleContentInput(event) {
    const fieldValue = event.detail.value || ''
    console.log('管理员文章表单页：收到正文输入变更', fieldValue)
    this.setData({
      'form.contentText': fieldValue,
    })
    console.log('管理员文章表单页：文章正文同步完成')
  },
  // 中文注释：读取文章详情并回填到表单，用于管理员编辑已有文章。
  async loadArticleDetail(articleId) {
    console.log('管理员文章表单页：开始读取文章详情', articleId)

    try {
      const result = await callAdminAction('getArticleDetail', {
        articleId,
      })
      console.log('管理员文章表单页：文章详情读取成功', result)
      const articleData = result.data || {}
      this.setData({
        form: {
          title: articleData.title || '',
          author: articleData.author || '',
          type: articleData.type || '',
          contentText: Array.isArray(articleData.content) ? articleData.content.join('\n') : '',
          imagesrc: Array.isArray(articleData.imagesrc) ? articleData.imagesrc : [],
        },
      })
      console.log('管理员文章表单页：文章详情回填完成', this.data.form)
    } catch (error) {
      console.error('管理员文章表单页：文章详情读取失败', error)
      wx.showToast({
        title: error.message || '文章详情读取失败',
        icon: 'none',
      })
    }
  },
  // 中文注释：选择文章图片并上传到云存储，上传完成后直接回填到当前表单。
  async chooseImages() {
    console.log('管理员文章表单页：开始选择文章图片')

    try {
      const chooseResult = await wx.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })
      console.log('管理员文章表单页：文章图片选择完成', chooseResult)
      wx.showLoading({
        title: '上传图片中',
        mask: true,
      })
      const fileIdList = await uploadImageList(
        chooseResult.tempFilePaths || [],
        'admin/article-image'
      )
      this.setData({
        'form.imagesrc': [...this.data.form.imagesrc, ...fileIdList],
      })
      console.log('管理员文章表单页：文章图片上传并回填完成', this.data.form.imagesrc)
    } catch (error) {
      console.error('管理员文章表单页：文章图片上传失败', error)
      if (error && error.errMsg && error.errMsg.indexOf('cancel') !== -1) {
        console.log('管理员文章表单页：用户取消了文章图片选择')
      } else {
        wx.showToast({
          title: error.message || '图片上传失败',
          icon: 'none',
        })
      }
    } finally {
      wx.hideLoading()
      console.log('管理员文章表单页：文章图片选择上传流程结束')
    }
  },
  // 中文注释：删除指定索引的文章图片，方便管理员调整封面和正文配图顺序。
  removeImage(event) {
    const removeIndex = Number((event && event.detail && event.detail.actionIndex) ?? event.currentTarget.dataset.index)
    console.log('管理员文章表单页：删除图片动作参数解析完成', {
      detail: event && event.detail ? event.detail : {},
      removeIndex,
    })
    console.log('管理员文章表单页：开始删除文章图片', removeIndex)
    const nextImageList = this.data.form.imagesrc.filter((item, index) => index !== removeIndex)
    this.setData({
      'form.imagesrc': nextImageList,
    })
    console.log('管理员文章表单页：文章图片删除完成', nextImageList)
  },
  // 中文注释：提交文章发布或编辑请求，成功后返回文章列表页。
  async submitArticle() {
    console.log('管理员文章表单页：开始提交文章', this.data.form)

    if (this.data.isSubmitting) {
      console.log('管理员文章表单页：当前已有文章提交任务在执行，忽略重复提交')
      return
    }

    this.setData({
      isSubmitting: true,
    })
    console.log('管理员文章表单页：文章提交状态已加锁')

    try {
      const result = await callAdminAction('saveArticle', {
        articleId: this.data.articleId,
        title: this.data.form.title,
        author: this.data.form.author,
        type: this.data.form.type,
        content: this.data.form.contentText,
        imagesrc: this.data.form.imagesrc,
      })
      console.log('管理员文章表单页：文章提交成功', result)
      wx.showToast({
        title: this.data.articleId ? '文章已更新' : '文章已发布',
        icon: 'success',
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    } catch (error) {
      console.error('管理员文章表单页：文章提交失败', error)
      wx.showToast({
        title: error.message || '文章提交失败',
        icon: 'none',
      })
    } finally {
      this.setData({
        isSubmitting: false,
      })
      console.log('管理员文章表单页：文章提交流程结束，已释放请求锁')
    }
  },
})
