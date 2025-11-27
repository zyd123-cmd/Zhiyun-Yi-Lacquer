Component({
properties: {
  url: {
    type: String,
    value: ''
  },
  scale:{
    type:String,
    value:" "
  },
  position:{
    type:String,
    value:" "
  }
  // 其他属性...
},

data: {


},

	methods: {
			handleReady() {
			  console.log('xr scene ready');
			},
			handleGLTFLoaded() {
			  console.log('模型加载完成');
			  wx.hideLoading();
			  // 添加更多的日志输出
			},
		},
	
})