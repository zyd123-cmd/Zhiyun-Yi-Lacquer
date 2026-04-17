const {
  callAdminAction,
  formatTime,
  initCloud,
} = require('../../utils/admin')

Page({
  // 中文注释：页面初始数据，用于维护模型列表和加载状态。
  data: {
    isLoading: false,
    modelList: [],
  },
  // 中文注释：页面显示时刷新模型列表，确保管理员看到的是最新模型数据。
  onShow() {
    console.log('管理员模型列表页：页面显示，准备刷新模型列表')
    initCloud()
    this.loadModelList()
  },
  // 中文注释：加载模型列表并补充更新时间文本，便于页面直接展示。
  async loadModelList() {
    console.log('管理员模型列表页：开始加载模型列表')
    this.setData({
      isLoading: true,
    })

    try {
      const result = await callAdminAction('listModels')
      console.log('管理员模型列表页：模型列表云函数返回成功', result)
      const modelList = (result.data || []).map((model) => ({
        ...model,
        updatedAtText: formatTime(model.updatedAt),
      }))
      this.setData({
        modelList,
      })
      console.log('管理员模型列表页：模型列表同步完成', modelList.length)
    } catch (error) {
      console.error('管理员模型列表页：模型列表加载失败', error)
      wx.showToast({
        title: error.message || '模型列表加载失败',
        icon: 'none',
      })
    } finally {
      this.setData({
        isLoading: false,
      })
      console.log('管理员模型列表页：模型列表加载流程结束')
    }
  },
  // 中文注释：跳转到模型上传页，供管理员新增 glb 模型。
  goToCreateModel() {
    console.log('管理员模型列表页：准备跳转到模型上传页')
    wx.navigateTo({
      url: '/pages/model-form/model-form',
    })
  },
  // 中文注释：跳转到模型编辑页，供管理员编辑当前模型。
  editModel(event) {
    const modelId = (event && event.detail && event.detail.actionId) || event.currentTarget.dataset.id || ''
    console.log('管理员模型列表页：编辑动作参数解析完成', {
      detail: event && event.detail ? event.detail : {},
      modelId,
    })
    console.log('管理员模型列表页：准备跳转到模型编辑页', modelId)
    wx.navigateTo({
      url: `/pages/model-form/model-form?modelId=${modelId}`,
    })
  },
  // 中文注释：删除模型前先确认，确认后调用后台删除接口并刷新列表。
  async deleteModel(event) {
    const modelId = (event && event.detail && event.detail.actionId) || event.currentTarget.dataset.id || ''
    console.log('管理员模型列表页：删除动作参数解析完成', {
      detail: event && event.detail ? event.detail : {},
      modelId,
    })
    console.log('管理员模型列表页：开始删除模型流程', modelId)

    if (!modelId) {
      console.log('管理员模型列表页：当前缺少模型 id，无法执行删除')
      return
    }

    const { confirm } = await wx.showModal({
      title: '提示',
      content: '确认删除这个模型吗？',
    })
    console.log('管理员模型列表页：删除模型确认框返回结果', confirm)

    if (!confirm) {
      console.log('管理员模型列表页：用户取消删除模型')
      return
    }

    try {
      const result = await callAdminAction('deleteModel', {
        modelId,
      })
      console.log('管理员模型列表页：模型删除成功', result)
      wx.showToast({
        title: '模型已删除',
        icon: 'success',
      })
      this.loadModelList()
    } catch (error) {
      console.error('管理员模型列表页：模型删除失败', error)
      wx.showToast({
        title: error.message || '模型删除失败',
        icon: 'none',
      })
    }
  },
})
