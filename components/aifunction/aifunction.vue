<template>
	<view class="container" v-if="seeable">
		<uni-section type="mine">
			<view class="example-body box">
				<view @click="toggle('right')">
					<movable-area class="movable-area">
						<movable-view class="movable-view" direction="all">
							<view
								style="width: 100%;height: 100%;display: flex;align-self: flex-end;justify-self: flex-end;">
								<image src="/static/myicon/airight.png" style="width: 200rpx;" mode="widthFix"></image>
							</view>
						</movable-view>
					</movable-area>
				</view>
			</view>
		</uni-section>
		<view>
			<!-- 普通弹窗 -->
			<uni-popup ref="popup" background-color="#fff" @change="change" scroll-y="true">
				<view class="popup-content" :class="{ 'popup-height': type === 'left' || type === 'right' }" style=" ">
					<!-- 确保高度计算正确 -->
					<scroll-view class="maincontent" scroll-y="true">
						<view v-for="(item, index) in messages" :key="index" ref="messages">
							<!-- 用户视角 -->
							<view class="user" v-if="item.role=='user'">
								<view class="content"
									style="display: flex;justify-self: flex-end; border-radius: 10rpx;margin-right: 20rpx;">
									{{item.content}}
								</view>
								<image :src="item.image" mode="widthFix" style="width: 80rpx;border-radius: 20rpx;">
								</image>
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
	import { log } from 'neo-async';
import {
	  mapState,
	} from 'vuex';
	export default {
		computed: {
		  // 调用 mapState 方法，把 m_cart 模块中的 cart 数组映射到当前页面中，作为计算属性来使用
		  // ...mapState('模块的名称', ['要映射的数据名称1', '要映射的数据名称2'])
		  ...mapState('m_user', ['Tank']),
		},
		data() {
			return {
				seeable:false,
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
				messages: [{
					role: "assistant",
					content: "我是智美彝漆开发的AI助手 小智，致力于提供关于彝族历史、漆器、文化、艺术等相关问题的详尽解答。",
					image: "/static/myicon/airight.png",
				}, ],
				aiquestion: [],
			}
		},
		mounted() {
			if (this.Tank) {
				console.log("读取到了数据TANK=",wx.getStorageSync('Tank'));
				this.seeable=true;
			};
			if (wx.getStorageSync('messages')) {
				let storedMessages = wx.getStorageSync('messages');
				this.messages = Array.isArray(storedMessages) ? storedMessages : [];
			};
			if (!wx.getStorageSync('tokenDate')) {
				console.log("没有token需要请求");
				console.log("变量中的token是", this.tokenDate);
				this.gettoken();
			} else {
				console.log("已经有token不用再请求了");
				this.tokenDate = wx.getStorageSync('tokenDate');
				if (this.tokenDate.expires_in < 1 * 24 * 60 * 60) {
					console.log("token即将过期再次获取token");
					this.gettoken();
				}
			};
		},
		methods: {
			
			// 记录滚动到底部
			// 输出答案
			sendanswer() {
				this.messages.push({
					role: "assistant",
					content: this.answer,
					image: "/static/myicon/airight.png"
				});
				wx.setStorageSync('messages', this.messages);
				// 使用 $nextTick 确保在 DOM 更新后执行滚动操作
			},




			// 提交问题返回答案
			submit2() {
				if (!wx.getStorageSync('tokenDate')) {
					console.log("没有token需要请求");
					console.log("变量中的token是", this.tokenDate);
					this.gettoken();
				} else {
					console.log("已经有token不用再请求了");
					this.tokenDate = wx.getStorageSync('tokenDate');
					if (this.tokenDate.expires_in < 1 * 24 * 60 * 60) {
						console.log("token即将过期再次获取token");
						this.gettoken();
					}
				};
				let access_token = this.tokenDate.access_token;
				this.aiquestion = [{
					role: "user",
					content: this.question+"简单回答一下，回答得越快越好"
				}];
				uni.showLoading({
						title: "AI正在加载",
					}),
					wx.request({
						url: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${access_token}`,
						method: "POST",
						header: {
							"Content-Type": "application/json",
						},
						data: {
							messages: this.aiquestion,
							max_output_tokens: 160,
							disable_search: true, //关闭实时搜索
							top_p: 0.3, //多样性
							temperature: 0.5, //集中性
							system: "我是由彝族文化研究小组开发的AI助手，致力于提供关于彝族历史、文化、艺术等相关问题的详尽解答。特别地，我能够为您提供关于彝族漆器的详细信息，包括其历史背景、制作工艺、文化意义以及相关传承发展等内容。我将尽力帮助您更深入地了解彝族及其独特的漆器艺术。"
							// stream:true,//流形式返回

						},
						success: (res) => {
							console.log("ai返回的数据是",res);
							console.log("成功了哦ai的答案是", res.data.result);
							this.answer = res.data.result;
							this.sendanswer();
							uni.hideLoading();
							wx.showToast({
								title: "AI助手已提供答复",
								icon: "success"
							})
						},
						fail: (err) => {
							console.log("失败了ai的错误是", err);
							uni.hideLoading();
						}
					})
			},
			// 获取token
			gettoken() {
			let grant_type = "client_credentials";
			let client_id = "a5tE7nHmE22YPruqbCPJfmkF";
			let client_secret ="jUjXZ056PjDHuFVhX6CiBLCNxTBb0HyZ";

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
						wx.setStorageSync('tokenDate', this.tokenDate);

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
				if (wx.getStorageSync('messages')) {
					let storedMessages = wx.getStorageSync('messages');
					this.messages = Array.isArray(storedMessages) ? storedMessages : [];
				};
			},
			// 提交
			submit() {
				if (this.status == 0) {
					this.status = 1;
					if (this.question) {
						this.messages.push({
							role: "user",
							content: this.question,
							image: '/static/myicon/user.png',
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
		height: 1000rpx;
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

	}

	.button-text {
		color: #fff;
		font-size: 12px;
	}

	.popup-content {
		@include flex;
		justify-content: center;
		padding: 5px;
		background-color: #FFC0CB;

	}

	.popup-height {
		@include height;
		width: 500rpx;
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

	.movable-area {
		pointer-events: none; // 这个属性设置为none,让所有事件穿透过去
		z-index: 100;
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

	}

	.movable-view {
		pointer-events: auto; // 重设为auto,覆盖父属性设置
		height: 100px;
		width: 100px;
		display: flex;
		align-items: center;
		justify-content: center;

	}

	.container {
		height: 100%;
	}
</style>