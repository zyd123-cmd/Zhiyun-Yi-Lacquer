const {
  callAdminAction,
  initCloud,
  uploadImageList,
  uploadSingleFile,
} = require('../../utils/admin')

Page({
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
      titleAR: '',
      scaleAR: '1 1 1',
      description: '',
      order: '0',
    },
  },

  onLoad(options) {
    initCloud()
    const modelId = options && options.modelId ? options.modelId : ''

    this.setData({
      modelId,
      pageTitle: modelId ? '编辑模型' : '上传模型',
    })

    if (modelId) {
      this.loadModelDetail(modelId)
    }
  },

  handleFieldChange(event) {
    const fieldName = event.currentTarget.dataset.field
    const fieldValue = event.detail

    if (!fieldName) {
      return
    }

    this.setData({
      [`form.${fieldName}`]: fieldValue,
    })
  },

  async loadModelDetail(modelId) {
    try {
      const result = await callAdminAction('getModelDetail', {
        modelId,
      })
      const modelData = result.data || {}

      this.setData({
        modelFileName: modelData.modelUrl ? (modelData.modelUrl.split('/').pop() || '') : '',
        form: {
          name: modelData.name || '',
          image: modelData.image || '',
          modelUrl: modelData.modelUrl || '',
          scale3d: modelData.scale3d || '1 1 1',
          position3d: modelData.position3d || '0 0 0',
          titleAR: modelData.titleAR || modelData.name || '',
          scaleAR: modelData.scaleAR || modelData.scale3d || '1 1 1',
          description: modelData.description || '',
          order: String(modelData.order || 0),
        },
      })
    } catch (error) {
      console.error('模型详情读取失败', error)
      wx.showToast({
        title: error.message || '模型详情读取失败',
        icon: 'none',
      })
    }
  },

  async chooseCoverImage() {
    try {
      const chooseResult = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

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
    } catch (error) {
      console.error('模型封面上传失败', error)
      if (!error || !error.errMsg || error.errMsg.indexOf('cancel') === -1) {
        wx.showToast({
          title: error.message || '封面上传失败',
          icon: 'none',
        })
      }
    } finally {
      wx.hideLoading()
    }
  },

  async chooseModelFile() {
    try {
      const chooseResult = await wx.chooseMessageFile({
        count: 1,
        type: 'file',
      })
      const tempFile = chooseResult.tempFiles && chooseResult.tempFiles[0] ? chooseResult.tempFiles[0] : null

      if (!tempFile) {
        return
      }

      const fileName = tempFile.name || ''

      if (!fileName.toLowerCase().endsWith('.glb')) {
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
    } catch (error) {
      console.error('GLB 模型文件上传失败', error)
      if (!error || !error.errMsg || error.errMsg.indexOf('cancel') === -1) {
        wx.showToast({
          title: error.message || 'GLB 上传失败',
          icon: 'none',
        })
      }
    } finally {
      wx.hideLoading()
    }
  },

  async submitModel() {
    if (this.data.isSubmitting) {
      return
    }

    this.setData({
      isSubmitting: true,
    })

    try {
      await callAdminAction('saveModel', {
        modelId: this.data.modelId,
        name: this.data.form.name,
        image: this.data.form.image,
        modelUrl: this.data.form.modelUrl,
        scale3d: this.data.form.scale3d,
        position3d: this.data.form.position3d,
        titleAR: this.data.form.titleAR,
        scaleAR: this.data.form.scaleAR,
        description: this.data.form.description,
        order: this.data.form.order,
      })

      wx.showToast({
        title: this.data.modelId ? '模型已更新' : '模型已上传',
        icon: 'success',
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    } catch (error) {
      console.error('模型提交失败', error)
      wx.showToast({
        title: error.message || '模型提交失败',
        icon: 'none',
      })
    } finally {
      this.setData({
        isSubmitting: false,
      })
    }
  },
})
