<template>
	<view class="container">
		<uni-section title="基本示例" type="mine">
			<view class="example-body box">
				<view @click="toggle('right')" style="">
					<image src="/static/myicon/airight.png" style="width: 120rpx; height: 120rpx;"></image>
				</view>
			</view>
		</uni-section>
		<view>
			<!-- 普通弹窗 -->
			<uni-popup ref="popup" background-color="#fff" @change="change" scroll-y="true">
				<view class="popup-content" :class="{ 'popup-height': type === 'left' || type === 'right' }" style=" ">
					<!-- 确保高度计算正确 -->
					<!-- 内容 -->
					<scroll-view class="maincontent" scroll-y="true" style="margin-bottom: 300rpx;">
						<view v-for="(item,index) in messages">
							<!-- 用户视角 -->
							<view class="user" v-if="item.role=='user'">
								<view class="content"
									style="display: flex;justify-self: flex-end; border-radius: 10rpx;">
									{{item.content}}
								</view>
								<image :src="item.image" mode="widthFix" style="width: 100rpx;"></image>
							</view>
							<!-- ai视角 -->
							<view class="assistant" v-if="item.role=='assistant'">
								<image :src="item.image" mode="widthFix" style="width: 130rpx;margin-left: -30rpx;">
								</image>
								<view class="content"
									style="display: flex;justify-self: flex-start; border-radius: 10rpx;margin: 10rpx;">
									{{item.content}}
								</view>
							</view>
						</view>
					</scroll-view>
					<!-- 输入框容器 -->
					<view class="mainview"
						style="display: flex; justify-content: space-between; position: absolute; bottom: 150rpx; left: 0; right: 0; padding: 10rpx;">
						<view style="display: flex; flex-direction: row;">
							<input type="text" placeholder="请输入你想问的问题" @input="getuserquestion" :value="question"
								style="width: 100%; height: 80rpx; border: black 3rpx solid;" />
							<!-- 修改后的发送按钮 -->
							<button type="warn" size="mini" @click="submit"
								style="display: flex; width: 150rpx; align-items: center; text-align: center; font-size: 25rpx;">
								<view>发送</view>
							</button>
						</view>
					</view>
				</view>
			</uni-popup>



		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				status: 0,
				answer: "",
				tokenDate: {
					access_token: "",
					expires_in: "",
				},
				type: 'center',
				msgType: 'success',
				messageText: '这是一条成功提示',
				value: '',
				question: '',
				messages: [],
				aiquestion: [],

			}
		},
		onLoad() {
			this.gettoken();
			if (wx.getStorageSync('messages')) {
				this.messages = wx.getStorageSync('messages');
			};

		},
		onReady() {},
		methods: {
			// 输出答案
			sendanswer() {
				this.messages.push({
					role: "assistant",
					content: this.answer,
					image: "/static/myicon/airight.png"
				})
				wx.setStorageSync('messages', this.messages)
			},
			// 提交问题
			submit2() {
				let access_token = this.tokenDate.access_token;
				this.aiquestion = [{
					role: "user",
					content: this.question
				}]
				wx.request({
					url: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${access_token}`,
					method: "POST",
					header: {
						"Content-Type": "application/json",
					},
					data: {
						messages: this.aiquestion
					},
					success: (res) => {
						console.log("成功了哦ai的答案是", res.data.result);
						this.answer = res.data.result;
						this.sendanswer();
					},
					fail: (err) => {
						console.log("失败了ai的错误是", err);
					}
				})
			},
			// 获取token
			gettoken() {
				let grant_type = "client_credentials";
				let client_id = "3PMbWDONNjkvU2gTYPvY5oU4";
				let client_secret = "PMhqtAhAOgTi9WCBy0mCDOOAdoK85ryV";
				wx.request({
					url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}`,
					method: "POST",
					header: {
						"Content-Type": "application/json",
					},
					success: (res) => {
						console.log("success", res);
						this.tokenDate.access_token = res.data.access_token;
						this.tokenDate.expires_in = res.data.expires_in;
						let tokendata = {
							access_token: res.data.access_token,
							expires_in: res.data.expires_in,
						}
						wx.setStorageSync('tokenData', this.tokenDate);

					},
					fail: (err) => {
						console.log("失败了", err);
					}

				})
			},
			// 获取用户输入的问题
			getuserquestion(event) {
				console.log(event.detail.value);
				this.question = event.detail.value;
			},
			change(e) {
				console.log('当前模式：' + e.type + ',状态：' + e.show);
			},
			toggle(type) {
				this.type = type
				// open 方法传入参数 等同在 uni-popup 组件上绑定 type属性
				this.$refs.popup.open(type)
			},
			// 提交
			submit() {
				if (this.status == 0) {
					this.status = 1;
					if (this.question) {
						this.messages.push({
							role: "user",
							content: this.question,
							image: '/static/myicon/airight.png',
						});
						this.submit2();
						this.question = '';
						uni.setStorageSync('messages', this.messages)
						this.status = 0;
					} else {
						wx.showToast({
							title: "请先输入内容",
							icon: "none"
						})
					}
				}
			}
		}
	}
</script>
<style lang="scss">
	.assistant {
		display: grid;
		align-self: flex-start;
		grid-template-columns: repeat(2, 100rpx 80%);
		background-color: #f5f5f5;
		border-radius: 15rpx;
		margin-bottom: 5rpx;
	}

	.user {
		display: grid;
		align-self: flex-end;
		grid-template-columns: repeat(2, 80% 100rpx);
		background-color: #f5f5f5;
		justify-self: flex-end;
		border-radius: 15rpx;
		margin-bottom: 5rpx;
		align-items: center;

	}

	.maincontent {
		height: 1100upx;
		width: 98%;
		display: flex;
		flex-direction: column;
	}

	@mixin flex {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	@mixin height {
		/* #ifndef APP-NVUE */
		height: 100%;
		/* #endif */
		/* #ifdef APP-NVUE */
		flex: 1;
		/* #endif */
	}

	.box {
		@include flex;
	}

	.button {
		@include flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		height: 35px;
		margin: 0 5px;
		border-radius: 5px;
	}

	.example-body {
		background-color: #fff;
		padding: 10px 0;
	}

	.button-text {
		color: #fff;
		font-size: 12px;
	}

	.popup-content {
		@include flex;
		align-items: center;
		justify-content: center;
		padding: 10px;
		background-color: #FFC0CB;

	}

	.popup-height {
		@include height;
		width: 400rpx;
	}

	.text {
		font-size: 12px;
		color: #333;
	}

	.popup-success {
		color: #fff;
		background-color: #e1f3d8;
	}

	.popup-warn {
		color: #fff;
		background-color: #faecd8;
	}

	.popup-error {
		color: #fff;
		background-color: #fde2e2;
	}

	.popup-info {
		color: #fff;
		background-color: #f2f6fc;
	}

	.success-text {
		color: #09bb07;
	}

	.warn-text {
		color: #e6a23c;
	}

	.error-text {
		color: #f56c6c;
	}

	.info-text {
		color: #909399;
	}
</style>