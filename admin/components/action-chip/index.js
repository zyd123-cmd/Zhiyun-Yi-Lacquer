Component({
  // 中文注释：启用虚拟宿主节点，避免自定义组件外层盒模型影响按钮显示宽度和布局。
  options: {
    virtualHost: true,
  },
  // 中文注释：组件属性用于统一接收后台操作文案、色系和禁用态，避免各页面重复拼装按钮样式。
  properties: {
    text: {
      type: String,
      value: '',
    },
    tone: {
      type: String,
      value: 'primary',
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    actionId: {
      type: String,
      value: '',
    },
    actionStatus: {
      type: String,
      value: '',
    },
    actionIndex: {
      type: Number,
      value: -1,
    },
  },
  lifetimes: {
    // 中文注释：组件挂载时输出当前配置，方便后续排查某个页面是否传错色系或文案。
    attached() {
      console.log('后台操作胶囊组件：组件挂载完成', this.data)
    },
  },
  methods: {
    // 中文注释：统一处理点击事件，禁用态直接拦截，可点击时再把完整动作参数抛给外层页面。
    handleTap() {
      console.log('后台操作胶囊组件：收到点击事件', this.data)

      if (this.data.disabled) {
        console.log('后台操作胶囊组件：当前组件处于禁用状态，已拦截点击')
        return
      }

      const actionDetail = {
        text: this.data.text,
        tone: this.data.tone,
        actionId: this.data.actionId,
        actionStatus: this.data.actionStatus,
        actionIndex: this.data.actionIndex,
      }
      console.log('后台操作胶囊组件：准备抛出动作事件详情', actionDetail)
      this.triggerEvent('action', actionDetail)
      console.log('后台操作胶囊组件：动作事件已抛出给外层页面')
    },
  },
})
