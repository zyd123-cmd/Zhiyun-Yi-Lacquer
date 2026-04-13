const {
  callAdminAction,
  initCloud,
  uploadImageList,
  uploadSingleFile,
} = require('../../utils/admin')

Page({
  // 中文注释：页面初始数据，用于维护模型表单、编辑模型 id 和当前文件名。
  data: {
    modelId: '',
    modelFileName: '',
    pageTitle: '上传模型',
    isSubmitting: false,
    form: {
      name: '',
      image: '',
      modelUrl: '',
      scale3d: '1 1 1',
      position3d: '0 0 0',
      description: '',
      order: '0',
    },
  },
  // 中文注释：页面加载时解析模型 id，编辑场景下自动回填模型详情。
  onLoad(options) {
    console.log('管理员模型表单页：页面加载完成，开始解析模型 id', options || {})
    initCloud()
    const modelId = options && options.modelId ? options.modelId : ''
    this.setData({
      modelId,
      pageTitle: modelId ? '编辑模型' : '上传模型',
    })
    console.log('管理员模型表单页：模型 id 解析完成', modelId)

    if (modelId) {
      this.loadModelDetail(modelId)
    }
  },
  // 中文注释：统一同步模型普通表单字段输入，减少重复赋值代码。
  handleFieldChange(event) {
    const fieldName = event.currentTarget.dataset.field
    const fieldValue = event.detail
    console.log('管理员模型表单页：收到普通字段输入变更', {
      fieldName,
      fieldValue,
    })

    if (!fieldName) {
      console.log('管理员模型表单页：当前字段缺少字段名，本次忽略更新')
      return
    }

    this.setData({
      [`form.${fieldName}`]: fieldValue,
    })
    console.log('管理员模型表单页：普通字段同步完成', fieldName)
  },
  // 中文注释：读取模型详情并回填到表单，用于管理员编辑已有模型。
  async loadModelDetail(modelId) {
    console.log('管理员模型表单页：开始读取模型详情', modelId)

    try {
      const result = await callAdminAction('getModelDetail', {
        modelId,
      })
      console.log('管理员模型表单页：模型详情读取成功', result)
      const modelData = result.data || {}
      this.setData({
        modelFileName: modelData.modelUrl ? (modelData.modelUrl.split('/').pop() || '') : '',
        form: {
          name: modelData.name || '',
          image: modelData.image || '',
          modelUrl: modelData.modelUrl || '',
          scale3d: modelData.scale3d || '1 1 1',
          position3d: modelData.position3d || '0 0 0',
          description: modelData.description || '',
          order: String(modelData.order || 0),
        },
      })
      console.log('管理员模型表单页：模型详情回填完成', this.data.form)
    } catch (error) {
      console.error('管理员模型表单页：模型详情读取失败', error)
      wx.showToast({
        title: error.message || '模型详情读取失败',
        icon: 'none',
      })
    }
  },
  // 中文注释：选择模型封面图并上传到云存储，上传完成后直接回填表单。
  async chooseCoverImage() {
    console.log('管理员模型表单页：开始选择模型封面图')

    try {
      const chooseResult = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })
      console.log('管理员模型表单页：模型封面图选择完成', chooseResult)
      wx.showLoading({
        title: '上传封面中',
        mask: true,
      })
      const fileIdList = await uploadImageList(
        chooseResult.tempFilePaths || [],
        'admin/model-cover'
      )
      this.setData({
        'form.image': fileIdList[0] || '',
      })
      console.log('管理员模型表单页：模型封面图上传完成', this.data.form.image)
    } catch (error) {
      console.error('管理员模型表单页：模型封面图上传失败', error)
      if (error && error.errMsg && error.errMsg.indexOf('cancel') !== -1) {
        console.log('管理员模型表单页：用户取消了模型封面图选择')
      } else {
        wx.showToast({
          title: error.message || '封面上传失败',
          icon: 'none',
        })
      }
    } finally {
      wx.hideLoading()
      console.log('管理员模型表单页：模型封面图上传流程结束')
    }
  },
  // 中文注释：选择 glb 模型文件并上传到云存储，上传完成后记录 fileID 和文件名。
  async chooseModelFile() {
    console.log('管理员模型表单页：开始选择 glb 模型文件')

    try {
      const chooseResult = await wx.chooseMessageFile({
        count: 1,
        type: 'file',
      })
      console.log('管理员模型表单页：模型文件选择完成', chooseResult)
      const tempFile = chooseResult.tempFiles && chooseResult.tempFiles[0] ? chooseResult.tempFiles[0] : null

      if (!tempFile) {
        console.log('管理员模型表单页：当前未拿到模型文件，结束上传流程')
        return
      }

      const fileName = tempFile.name || ''

      if (!fileName.toLowerCase().endsWith('.glb')) {
        console.log('管理员模型表单页：当前模型文件不是 glb 格式，阻止上传', fileName)
        wx.showToast({
          title: '只能上传 glb 格式模型',
          icon: 'none',
        })
        return
      }

      wx.showLoading({
        title: '上传 GLB 中',
        mask: true,
      })
      const fileId = await uploadSingleFile(
        tempFile.path,
        fileName,
        'admin/model-glb'
      )
      this.setData({
        modelFileName: fileName,
        'form.modelUrl': fileId,
      })
      console.log('管理员模型表单页：glb 模型文件上传完成', fileId)
    } catch (error) {
      console.error('管理员模型表单页：glb 模型文件上传失败', error)
      if (error && error.errMsg && error.errMsg.indexOf('cancel') !== -1) {
        console.log('管理员模型表单页：用户取消了 glb 模型文件选择')
      } else {
        wx.showToast({
          title: error.message || 'GLB 上传失败',
          icon: 'none',
        })
      }
    } finally {
      wx.hideLoading()
      console.log('管理员模型表单页：glb 模型文件上传流程结束')
    }
  },
  // 中文注释：提交模型上传或编辑请求，成功后返回模型列表页。
  async submitModel() {
    console.log('管理员模型表单页：开始提交模型', this.data.form)

    if (this.data.isSubmitting) {
      console.log('管理员模型表单页：当前已有模型提交任务在执行，忽略重复提交')
      return
    }

    this.setData({
      isSubmitting: true,
    })
    console.log('管理员模型表单页：模型提交状态已加锁')

    try {
      const result = await callAdminAction('saveModel', {
        modelId: this.data.modelId,
        name: this.data.form.name,
        image: this.data.form.image,
        modelUrl: this.data.form.modelUrl,
        scale3d: this.data.form.scale3d,
        position3d: this.data.form.position3d,
        description: this.data.form.description,
        order: this.data.form.order,
      })
      console.log('管理员模型表单页：模型提交成功', result)
      wx.showToast({
        title: this.data.modelId ? '模型已更新' : '模型已上传',
        icon: 'success',
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    } catch (error) {
      console.error('管理员模型表单页：模型提交失败', error)
      wx.showToast({
        title: error.message || '模型提交失败',
        icon: 'none',
      })
    } finally {
      this.setData({
        isSubmitting: false,
      })
      console.log('管理员模型表单页：模型提交流程结束，已释放请求锁')
    }
  },
})
