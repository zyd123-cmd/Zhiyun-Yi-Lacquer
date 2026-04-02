<script>
	export default {
    
		onLaunch: function() {
      wx.cloud.init({
      				env:'cloud1-5gprp4v6c761393f',
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
