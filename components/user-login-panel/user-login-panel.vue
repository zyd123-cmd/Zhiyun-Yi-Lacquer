<template>
  <view>
    <view class="login-container">
      <uni-icons type="contact-filled" size="100" color="#afafaf" />
      <button type="primary" class="btn-login" @click="toggleDialog">一键登录</button>
      <view class="tips-text">登录后尽享更多权益</view>
    </view>

    <view v-if="showDialog">
      <view class="login-dialog__mask" @click="toggleDialog" />
      <view class="login-dialog" :class="{ 'is-visible': showDialog, 'is-hidden': !showDialog }">
        <view class="login-dialog__title">
          <text>申请获取您的头像、昵称</text>
        </view>
        <view class="login-dialog__row">
          <text>头像：</text>
          <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="avatar-image" :src="avatarUrl" />
          </button>
        </view>
        <view class="login-dialog__row">
          <text>昵称：</text>
          <input form-type="submit" type="nickname" placeholder="请输入昵称" @blur="onNicknameBlur" />
        </view>

        <view class="login-dialog__actions">
          <view><button @click="toggleDialog">拒绝</button></view>
          <view><button type="primary" @click="submit">允许</button></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapMutations } from 'vuex'
import { CLOUD_FUNCTIONS } from '@/utils/cloud'

export default {
  name: 'UserLoginPanel',
  data() {
    return {
      showDialog: false,
      avatarUrl: '',
      nickName: '',
    }
  },
  methods: {
    ...mapMutations('m_user', ['setUserId', 'setLoginStatus']),
    toggleDialog() {
      this.showDialog = !this.showDialog

      if (!this.showDialog) {
        uni.showToast({
          title: '您取消了登录',
          icon: 'none',
          duration: 500,
        })
      }
    },
    onChooseAvatar(event) {
      const tempPath = event.detail.avatarUrl
      const suffixMatch = /\.[^\\.]+$/.exec(tempPath)
      const suffix = suffixMatch ? suffixMatch[0] : '.png'

      wx.cloud.uploadFile({
        cloudPath: `userimg/${Date.now()}${suffix}`,
        filePath: tempPath,
        success: (res) => {
          this.avatarUrl = res.fileID
        },
        fail: (err) => {
          console.error('头像上传失败', err)
        },
      })
    },
    onNicknameBlur(event) {
      this.nickName = event.detail.value
    },
    async createUserProfile() {
      const response = await wx.cloud.callFunction({
        name: CLOUD_FUNCTIONS.CREATE_USER_PROFILE,
        data: {
          avatarUrl: this.avatarUrl,
          nickName: this.nickName,
          backimage: '',
        },
      })

      const result = response && response.result ? response.result : {}

      if (!result.success || !result.data || !result.data._id) {
        throw new Error(result.message || '注册失败')
      }

      this.setUserId(result.data._id)
      this.setLoginStatus(true)
    },
    async submit() {
      if (!this.avatarUrl) {
        uni.showToast({
          title: '请先选择头像',
          icon: 'none',
        })
        return
      }

      if (!this.nickName) {
        uni.showToast({
          title: '请先填写昵称',
          icon: 'none',
        })
        return
      }

      uni.showLoading({
        title: '登录中',
        mask: true,
      })

      try {
        await this.createUserProfile()
        this.showDialog = false
        uni.reLaunch({
          url: '/pages/my/my',
        })
      } catch (error) {
        console.error('提交过程中发生错误:', error)
        this.showDialog = false
      } finally {
        uni.hideLoading()
      }
    },
  },
}
</script>

<style lang="scss">
.login-container {
  position: relative;
  height: 750rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  overflow: hidden;

  &::after {
    content: ' ';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    display: block;
    background-color: #fff;
    border-radius: 100%;
    transform: translateY(50%);
  }
}

.btn-login {
  width: 90%;
  margin: 15px 0;
  border-radius: 100px;
  background-color: #c00000;
}

.tips-text {
  font-size: 12px;
  color: gray;
}

.login-dialog__mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 666;
  opacity: 0.3;
  background: #000;
}

.login-dialog {
  position: fixed;
  bottom: 0;
  z-index: 999999;
  width: 100%;
  padding: 30rpx;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  transition: all 0.3s;
}

.login-dialog.is-visible {
  margin-bottom: 0;
}

.login-dialog.is-hidden {
  margin-bottom: -700rpx;
}

.login-dialog__title {
  padding-bottom: 30rpx;
  font-weight: 700;
  border-bottom: 1px solid #eee;
}

.login-dialog__row {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.login-dialog__row text {
  color: #787376;
}

.login-dialog__row input {
  width: 80%;
  text-align: right;
}

.login-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 50rpx 0;
  box-sizing: border-box;
}

.login-dialog__actions view {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-dialog__actions view button {
  width: 90%;
}

.avatar-button {
  width: 80rpx !important;
  height: 80rpx !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
  border-radius: 50% !important;
  font-size: 32rpx !important;
}

.avatar-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}
</style>
