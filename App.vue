<script>
	export default {
    
		onLaunch: function() {
      wx.cloud.init({
      				env:'zhiyunyiqi-6gubyp7bd3a2e4ff',
      				traceUser:true
      			})
      			
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
