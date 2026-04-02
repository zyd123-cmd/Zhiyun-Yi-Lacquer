<template>
  <view class="container" v-if="visible">
    <movable-area class="movable-area">
      <movable-view class="movable-view" direction="all" @click="showPopup">
        <image src="/static/myicon/airight.png" class="assistant-trigger-image" mode="aspectFit" />
      </movable-view>
    </movable-area>

    <van-popup
      :show="show"
      position="right"
      custom-style="height: 100%; width: 85%;"
      :closeable="true"
      close-icon-position="top-left"
      @close="onClose"
    >
      <view class="chat-container">
        <scroll-view class="chat-content" scroll-y :scroll-into-view="scrollIntoView">
          <view v-for="(item, index) in messages" :key="index">
            <view v-if="item.role === 'user'" class="message-row user-row">
              <view class="message-bubble user-bubble">{{ item.content }}</view>
              <image :src="item.image" class="avatar" mode="aspectFill" />
            </view>

            <view v-if="item.role === 'assistant'" class="message-row ai-row">
              <image :src="item.image" class="avatar ai-avatar" mode="widthFix" />
              <view class="message-bubble ai-bubble">{{ item.content }}</view>
            </view>
          </view>

          <view id="msg-bottom" />
        </scroll-view>

        <view class="input-area">
          <van-field
            :value="question"
            placeholder="请输入你想问的问题"
            :border="true"
            custom-style="flex: 1; border-radius: 8rpx;"
            @change="onInputChange"
          />
          <van-button type="danger" size="small" custom-style="margin-left: 16rpx;" @click="submit">
            发送
          </van-button>
        </view>
      </view>
    </van-popup>
  </view>
</template>

<script>
import { mapState } from 'vuex'

const DEFAULT_ASSISTANT_MESSAGE = {
  role: 'assistant',
  content: '我是智韵彝漆的 AI 助手小智，可以为你解答彝族历史、漆器、文化与艺术相关问题。',
  image: '/static/myicon/airight.png',
}

export default {
  name: 'AiAssistant',
  computed: {
    ...mapState('m_user', ['isLoggedIn']),
    visible() {
      return this.isLoggedIn
    },
  },
  data() {
    return {
      show: false,
      status: 0,
      answer: '',
      question: '',
      messages: [DEFAULT_ASSISTANT_MESSAGE],
      scrollIntoView: '',
    }
  },
  mounted() {
    const storedMessages = wx.getStorageSync('messages')
    if (storedMessages && Array.isArray(storedMessages) && storedMessages.length > 0) {
      this.messages = storedMessages
    }
  },
  watch: {
    isLoggedIn(value) {
      if (!value) {
        this.show = false
      }
    },
  },
  methods: {
    showPopup() {
      const storedMessages = wx.getStorageSync('messages')
      if (storedMessages && Array.isArray(storedMessages) && storedMessages.length > 0) {
        this.messages = storedMessages
      }

      this.show = true
      setTimeout(() => {
        this.scrollIntoView = ''
        this.$nextTick(() => {
          this.scrollIntoView = 'msg-bottom'
        })
      }, 350)
    },
    onClose() {
      this.show = false
    },
    onInputChange(event) {
      this.question = event.detail
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollIntoView = ''
        this.$nextTick(() => {
          this.scrollIntoView = 'msg-bottom'
        })
      })
    },
    requestAnswer() {
      if (!this.question) {
        return
      }

      const userQuestion = this.question
      const primaryWsUrl = 'ws://localhost:3001'
      const fallbackWsUrl = 'ws://192.168.100.196:3001'
      let socketTask = null
      let assistantMessageIndex = null
      let finished = false
      let hasFirstDelta = false

      uni.showLoading({ title: 'AI 正在加载' })

      const connect = (url, isFallback) => {
        assistantMessageIndex = null
        finished = false
        hasFirstDelta = false

        socketTask = wx.connectSocket({ url })

        socketTask.onOpen(() => {
          socketTask.send({
            data: JSON.stringify({ type: 'ask', question: userQuestion }),
          })

          this.answer = ''
          this.messages.push({
            role: 'assistant',
            content: '',
            image: '/static/myicon/airight.png',
          })
          assistantMessageIndex = this.messages.length - 1
          wx.setStorageSync('messages', this.messages)
        })

        socketTask.onMessage((res) => {
          try {
            const data = JSON.parse(res.data)

            if (data.type === 'delta') {
              if (!hasFirstDelta) {
                hasFirstDelta = true
                uni.hideLoading()
              }

              this.answer += data.content || ''
              if (assistantMessageIndex !== null && this.messages[assistantMessageIndex]) {
                this.$set(this.messages[assistantMessageIndex], 'content', this.answer)
                wx.setStorageSync('messages', this.messages)
              }

              this.scrollToBottom()
              return
            }

            if (data.type === 'done') {
              if (!finished) {
                finished = true
                uni.hideLoading()
                wx.showToast({ title: 'AI 助手已提供答复', icon: 'success' })
                socketTask.close({})
              }
              return
            }

            if (data.type === 'error') {
              console.error('AI 服务返回错误:', data.detail)
              uni.hideLoading()
              wx.showToast({
                title: 'AI 请求失败',
                icon: 'none',
              })
              socketTask.close({})
            }
          } catch (error) {
            console.log('解析 ws 消息失败', error)
          }
        })

        socketTask.onError((error) => {
          console.log('ws 连接错误', error)
          if (!isFallback) {
            connect(fallbackWsUrl, true)
            return
          }

          uni.hideLoading()
          wx.showToast({ title: 'AI 连接失败', icon: 'none' })
        })

        socketTask.onClose(() => {
          if (!finished) {
            finished = true
            uni.hideLoading()
          }
        })
      }

      connect(primaryWsUrl, false)
    },
    submit() {
      if (this.status !== 0) {
        return
      }

      this.status = 1

      if (!this.question) {
        wx.showToast({ title: '请先输入内容', icon: 'none' })
        this.status = 0
        return
      }

      this.messages.push({
        role: 'user',
        content: this.question,
        image: '/static/myicon/user.png',
      })
      this.requestAnswer()
      this.question = ''
      uni.setStorageSync('messages', this.messages)
      this.status = 0
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}

.movable-area {
  position: fixed;
  inset: 0;
  z-index: 100;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.movable-view {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.assistant-trigger-image {
  width: 180rpx;
  height: 180rpx;
  display: block;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.chat-content {
  flex: 1;
  height: calc(100vh - 120rpx);
  padding: 80rpx 20rpx 20rpx;
  box-sizing: border-box;
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
  flex-shrink: 0;
  border-radius: 50%;
}

.ai-avatar {
  width: 100rpx;
  height: auto;
  border-radius: 0;
}

.message-bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  line-height: 1.5;
  border-radius: 16rpx;
  word-break: break-all;
}

.user-bubble {
  margin-right: 16rpx;
  color: #fff;
  background-color: #e60527;
  border-top-right-radius: 4rpx;
}

.ai-bubble {
  margin-left: 16rpx;
  color: #333;
  background-color: #fff;
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
