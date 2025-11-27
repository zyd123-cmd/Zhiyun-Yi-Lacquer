<template>
	<view style="display: flex;flex-direction: column;">
		<custom
			v-if="url"
			class="custon"
			:title="title"
			:url="url"
			:scale="scale"
		></custom>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// AR 模型 URL，从 3dview 集合的 modelUrl 字段获取
				url: '',
				// AR 标题，从 3dview 集合的 titleAR 字段获取
				title: '',
				// AR 缩放，从 3dview 集合的 scaleAR 字段获取
				scale: '',
			}
		},

		onLoad(option) {
			uni.showLoading({
				title: 'AR 模型加载中...'
			});
			if (option && option.id) {
				this.loadArData(option.id);
			} else {
				uni.hideLoading();
			}
		},
		methods: {
			loadArData(id) {
				const db = wx.cloud.database();
				db.collection('3dview').doc(id).get().then(res => {
					const data = res.data || {};
					if (data.modelUrl) {
						this.url = data.modelUrl;
					}
					if (data.titleAR) {
						this.title = data.titleAR;
					}
					if (data.scaleAR) {
						this.scale = data.scaleAR;
					}
					uni.hideLoading();
				}).catch(err => {
					console.error('加载 AR 模型数据失败', err);
					uni.hideLoading();
					uni.showToast({
						title: 'AR 模型加载失败',
						icon: 'none',
						duration: 1500,
					});
				});
			},
		}
	}
</script>

<style>
	page {}
</style>