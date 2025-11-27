<script>
	export default {
    
		onLaunch: function() {
      wx.cloud.init({
      				env:'cloud1-1gr3ry1bac666189',
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
