<template>
	<view v-if="isload">
		<aifunction></aifunction>
		<view style="width: 100%;">
			<image style="width: 100%;" mode="widthFix" :src="titleimage"> </image>
		</view>
		<view class="navigator-container">
			<navigator class="navigator-item" v-for="(item, index) in items" :key="index" :url="item.arpagesrc">
				<view class="navigator-content">
					<image class="navigator-image" :src="item.image"></image>
					<text class="navigator-text">{{ item.name }}</text>
				</view>
			</navigator>
		</view>
	</view>
	
</template>

<script>
	export default {

		data() {
			return {
				titleimage: "cloud://zhiyunyiqi-6gubyp7bd3a2e4ff.7a68-zhiyunyiqi-6gubyp7bd3a2e4ff-1327529386/首页轮播图/轮播图4.jpg",
				// 假设有一个items数组，每个对象包含navigator的url、图片地址和文本
				items: [],
				isload: false,
			}
		},
		onLoad() {
			this.getdata();
		},
		methods: {

			getdata() {
				uni.showLoading({
					title: '模型加载中...'
				});
				wx.cloud.callFunction({
					name: "get3d",
				}).then(res => {
					console.log(res.result.data);
					this.items = res.result.data;
					uni.hideLoading();
					this.isload = true;
				})
			},
		},
	}
</script>

<style>
	.navigator-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		padding: 10rpx;
		background-color: #dfd0bb;
		/* 更改为新的色调 */
	}

	.navigator-item {
		flex: 0 1 calc(50% - 20rpx);
		width: 48%;
		margin: 10rpx;
		height: 300rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		/* 调整阴影颜色以匹配新色调 */
		transition: transform 0.3s ease;
	}

	.navigator-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 100%;
		background-color: #fff;
		/* 可能需要调整内容背景颜色以保持可读性 */
		border-radius: 10rpx;
	}

	.navigator-image {
		width: 100%;
		height: 100%;
		border-radius: 10rpx;
		object-fit: cover;
	}

	.navigator-text {
		margin-top: 10rpx;
		text-align: center;
		font-size: 28rpx;
		color: #333;
		/* 可能需要调整文字颜色以保持可读性 */
		font-weight: bold;
	}
</style>