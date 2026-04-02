<template>
	<view class="container" v-if="seeable">
		<!-- 悬浮按钮 -->
		<movable-area class="movable-area">
			<movable-view class="movable-view" direction="all" @click="showPopup">
				<image src="/static/myicon/airight.png" style="width: 180rpx;" mode="widthFix"></image>
			</movable-view>
		</movable-area>

		<!-- Vant 弹出层 -->
		<van-popup 
			:show="show" 
			position="right" 
			custom-style="height: 100%; width: 85%;"
			@close="onClose"
			:closeable="true"
			close-icon-position="top-left"
		>
			<view class="chat-container">
				<!-- 聊天内容区域 -->
				<scroll-view class="chat-content" scroll-y :scroll-into-view="scrollIntoView">
					<view v-for="(item, index) in messages" :key="index">
						<!-- 用户消息 -->
						<view class="message-row user-row" v-if="item.role === 'user'">
							<view class="message-bubble user-bubble">
								{{ item.content }}
							</view>
							<image :src="item.image" class="avatar" mode="aspectFill"></image>
						</view>
						<!-- AI 消息 -->
						<view class="message-row ai-row" v-if="item.role === 'assistant'">
							<image :src="item.image" class="avatar ai-avatar" mode="widthFix"></image>
							<view class="message-bubble ai-bubble">
								{{ item.content }}
							</view>
						</view>
					</view>
					<view id="msg-bottom"></view>
				</scroll-view>

				<!-- 输入区域 -->
				<view class="input-area">
					<van-field
						:value="question"
						placeholder="请输入你想问的问题"
						:border="true"
						@change="onInputChange"
						custom-style="flex: 1; border-radius: 8rpx;"
					/>
					<van-button type="danger" size="small" @click="submit" custom-style="margin-left: 16rpx;">
						发送
					</van-button>
				</view>
			</view>
		</van-popup>
	</view>
</template>

<script>
import { mapState } from 'vuex';

export default {
	computed: {
		...mapState('m_user', ['Tank']),
	},
	data() {
		return {
			seeable: false,
			show: false,
			status: 0,
			answer: "",
			question: '',
			messages: [{
				role: "assistant",
				content: "我是智韵彝漆开发的AI助手 小智，致力于提供关于彝族历史、漆器、文化、艺术等相关问题的详尽解答。",
				image: "/static/myicon/airight.png",
			}],
			scrollIntoView: '',
		}
	},
	mounted() {
		if (this.Tank) {
			console.log("读取到了数据TANK=", wx.getStorageSync('Tank'));
			this.seeable = true;
		}
		const storedMessages = wx.getStorageSync('messages');
		if (storedMessages && Array.isArray(storedMessages)) {
			this.messages = storedMessages;
		}
	},
	methods: {
		showPopup() {
			const storedMessages = wx.getStorageSync('messages');
			if (storedMessages && Array.isArray(storedMessages)) {
				this.messages = storedMessages;
			}
			this.show = true;
			// 等待弹出层动画完成后滚动到底部
			setTimeout(() => {
				this.scrollIntoView = '';
				this.$nextTick(() => {
					this.scrollIntoView = 'msg-bottom';
				});
			}, 350);
		},
		onClose() {
			this.show = false;
		},
		onInputChange(e) {
			this.question = e.detail;
		},
		scrollToBottom() {
			this.$nextTick(() => {
				if (this.messages && this.messages.length > 0) {
					const bottomId = 'msg-bottom';
					if (this.scrollIntoView === bottomId) {
						this.scrollIntoView = '';
						this.$nextTick(() => {
							this.scrollIntoView = bottomId;
						});
					} else {
						this.scrollIntoView = bottomId;
					}
				}
			});
		},
		submit2() {
			if (!this.question) return;

			const userQuestion = this.question;
			const primaryWsUrl = "ws://localhost:3001";
			const fallbackWsUrl = "ws://192.168.100.196:3001";
			let socketTask = null;
			let aiIndex = null;
			let finished = false;
			let hasFirstDelta = false;

			uni.showLoading({ title: "AI正在加载" });

			const connect = (url, isFallback) => {
				console.log('准备连接 WebSocket, url =', url, 'isFallback =', isFallback);
				aiIndex = null;
				finished = false;
				hasFirstDelta = false;

				socketTask = wx.connectSocket({ url });

				socketTask.onOpen(() => {
					console.log('WebSocket 已打开, url =', url);
					socketTask.send({ data: JSON.stringify({ type: "ask", question: userQuestion }) });

					this.answer = "";
					this.messages.push({
						role: "assistant",
						content: "",
						image: "/static/myicon/airight.png",
					});
					aiIndex = this.messages.length - 1;
					wx.setStorageSync('messages', this.messages);
				});

				socketTask.onMessage((res) => {
					try {
						const data = JSON.parse(res.data);
						if (data.type === 'delta') {
							if (!hasFirstDelta) {
								hasFirstDelta = true;
								uni.hideLoading();
							}
							this.answer += data.content || '';
							if (aiIndex !== null && this.messages[aiIndex]) {
								this.$set(this.messages[aiIndex], 'content', this.answer);
								wx.setStorageSync('messages', this.messages);
							}
							this.scrollToBottom();
						} else if (data.type === 'done') {
							if (!finished) {
								finished = true;
								uni.hideLoading();
								wx.showToast({ title: "AI助手已提供答复", icon: "success" });
								socketTask.close({});
							}
						} else if (data.type === 'error') {
							uni.hideLoading();
							wx.showToast({ title: "AI请求失败", icon: "none" });
							socketTask.close({});
						}
					} catch (e) {
						console.log("解析ws消息失败", e);
					}
				});

				socketTask.onError((err) => {
					console.log("ws连接错误", err);
					if (!isFallback) {
						connect(fallbackWsUrl, true);
						return;
					}
					uni.hideLoading();
					wx.showToast({ title: "AI连接失败", icon: "none" });
				});

				socketTask.onClose(() => {
					if (!finished) {
						finished = true;
						uni.hideLoading();
					}
				});
			};

			connect(primaryWsUrl, false);
		},
		submit() {
			if (this.status === 0) {
				this.status = 1;
				if (this.question) {
					this.messages.push({
						role: "user",
						content: this.question,
						image: '/static/myicon/user.png',
					});
					this.submit2();
					this.question = '';
					uni.setStorageSync('messages', this.messages);
					this.status = 0;
				} else {
					wx.showToast({ title: "请先输入内容", icon: "none" });
					this.status = 0;
				}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	height: 100%;
}

.movable-area {
	pointer-events: none;
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
	pointer-events: auto;
	height: 100px;
	width: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.chat-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #f5f5f5;
}

.chat-content {
	flex: 1;
	padding: 20rpx;
	padding-top: 80rpx;
	box-sizing: border-box;
	height: calc(100vh - 120rpx);
}

.message-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 24rpx;
}

.user-row {
	justify-content: flex-end;
}

.ai-row {
	justify-content: flex-start;
}

.avatar {
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.ai-avatar {
	width: 100rpx;
	height: auto;
	border-radius: 0;
}

.message-bubble {
	max-width: 70%;
	padding: 20rpx 24rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
	line-height: 1.5;
	word-break: break-all;
}

.user-bubble {
	background-color: #e60527;
	color: #fff;
	margin-right: 16rpx;
	border-top-right-radius: 4rpx;
}

.ai-bubble {
	background-color: #fff;
	color: #333;
	margin-left: 16rpx;
	border-top-left-radius: 4rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.input-area {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background-color: #fff;
	border-top: 1rpx solid #eee;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
</style>
