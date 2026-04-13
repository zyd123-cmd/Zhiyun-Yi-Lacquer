<template>
  <view>
    <view class="login-container">
      <uni-icons type="contact-filled" size="100" color="#afafaf" />
      <button type="primary" class="btn-login" @click="startWeChatLogin">一键微信登录</button>
      <view class="tips-text">登录后即可同步当前微信账号的专属资料</view>
    </view>

    <view v-if="showDialog">
      <view class="login-dialog__mask" @click="toggleDialog()" />
      <view class="login-dialog" :class="{ 'is-visible': showDialog, 'is-hidden': !showDialog }">
        <view class="login-dialog__title">
          <text class="login-dialog__title-text">请先补充微信登录所需的头像和昵称</text>
        </view>

        <view class="login-dialog__row">
          <text class="login-dialog__label">头像：</text>
          <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="avatar-image" :src="displayAvatarUrl" />
          </button>
        </view>

        <view class="login-dialog__row">
          <text class="login-dialog__label">昵称：</text>
          <input
            class="login-dialog__input"
            form-type="submit"
            type="nickname"
            placeholder="请输入昵称"
            :value="nickName"
            @blur="onNicknameBlur"
          />
        </view>

        <view class="login-dialog__actions">
          <view class="login-dialog__action-item">
            <button class="login-dialog__action-button" @click="toggleDialog()">取消</button>
          </view>
          <view class="login-dialog__action-item">
            <button class="login-dialog__action-button" type="primary" @click="submit">确认微信登录</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { CLOUD_FUNCTIONS } from '@/utils/cloud'

export default {
  name: 'UserLoginPanel',
  computed: {
    ...mapState('m_user', ['userId']),
    // 中文注释：优先展示用户刚选择的新头像，没有时展示默认头像。
    displayAvatarUrl() {
      console.log('登录面板：开始计算当前展示的头像地址', this.avatarUrl)
      return this.avatarUrl || '/static/myicon/user.png'
    },
  },
  data() {
    return {
      showDialog: false,
      avatarUrl: '',
      nickName: '',
      isSubmitting: false,
    }
  },
  methods: {
    ...mapMutations('m_user', ['setLoginStatus', 'setManualLogout', 'setOpenId', 'setUserId']),
    // 中文注释：统一同步本地会话，避免快捷登录和首次建档各写一遍。
    syncLocalSession(result) {
      console.log('登录面板：开始同步本地用户会话', result)
      this.setUserId(result.data._id)
      this.setOpenId(result.openid || result.data.openid || '')
      this.setLoginStatus(true)
      this.setManualLogout(false)
      console.log('登录面板：本地用户会话同步完成')
    },
    // 中文注释：统一控制登录弹窗开关，并在取消时提示用户。
    toggleDialog(forceOpen = false, shouldToast = true) {
      console.log('登录面板：开始切换登录弹窗状态', {
        forceOpen,
        shouldToast,
        currentStatus: this.showDialog,
      })

      this.showDialog = forceOpen ? true : !this.showDialog
      console.log('登录面板：登录弹窗状态已更新', this.showDialog)

      if (!this.showDialog && shouldToast) {
        uni.showToast({
          title: '您已取消微信登录',
          icon: 'none',
          duration: 1200,
        })
        console.log('登录面板：已提示用户取消登录')
      }
    },
    // 中文注释：上传用户新选择的头像到云存储，后续直接保存 fileID。
    onChooseAvatar(event) {
      console.log('登录面板：收到用户选择头像事件', event)
      const tempPath = event && event.detail ? event.detail.avatarUrl : ''

      if (!tempPath) {
        console.log('登录面板：头像临时路径为空，终止上传流程')
        return
      }

      const suffixMatch = /\.[^\\.]+$/.exec(tempPath)
      const suffix = suffixMatch ? suffixMatch[0] : '.png'
      console.log('登录面板：已解析头像文件后缀', suffix)

      wx.cloud.uploadFile({
        cloudPath: `userimg/${Date.now()}${suffix}`,
        filePath: tempPath,
        success: (res) => {
          console.log('登录面板：头像上传成功，开始保存 fileID', res)
          this.avatarUrl = res.fileID || ''
          console.log('登录面板：头像 fileID 保存完成', this.avatarUrl)
        },
        fail: (error) => {
          console.error('登录面板：头像上传失败', error)
          uni.showToast({
            title: '头像上传失败',
            icon: 'none',
          })
        },
      })
    },
    // 中文注释：记录用户输入的昵称，提交登录时一并入库。
    onNicknameBlur(event) {
      console.log('登录面板：收到昵称输入事件', event)
      this.nickName = event && event.detail ? String(event.detail.value || '').trim() : ''
      console.log('登录面板：昵称已更新', this.nickName)
    },
    // 中文注释：封装微信官方登录接口，确保登录链路真实调用 wx.login。
    runWeChatLogin() {
      console.log('登录面板：开始调用 wx.login 获取微信登录 code')

      return new Promise((resolve, reject) => {
        wx.login({
          success: (res) => {
            console.log('登录面板：wx.login 调用成功', res)

            if (!res.code) {
              reject(new Error('wx.login 未返回有效 code'))
              return
            }

            resolve(res.code)
          },
          fail: (error) => {
            console.error('登录面板：wx.login 调用失败', error)
            reject(error)
          },
        })
      })
    },
    // 中文注释：优先尝试按当前微信身份直接登录，只有首次建档时才弹资料面板。
    async startWeChatLogin() {
      console.log('登录面板：开始执行微信快捷登录流程')

      if (this.isSubmitting) {
        console.log('登录面板：当前已有登录任务在执行，忽略本次快捷登录')
        return
      }

      this.isSubmitting = true
      console.log('登录面板：已加锁快捷登录流程，准备展示加载状态')
      uni.showLoading({
        title: '校验微信身份中',
        mask: true,
      })

      try {
        const code = await this.runWeChatLogin()
        console.log('登录面板：已拿到微信登录 code，开始尝试直接登录')

        const response = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.WECHAT_LOGIN,
          data: {
            code,
            createIfNotExists: false,
          },
        })

        const result = response && response.result ? response.result : {}
        console.log('登录面板：快捷登录云函数返回结果', result)

        if (result.success && result.data && result.data._id) {
          console.log('登录面板：当前微信账号已存在资料，准备直接完成登录')
          this.syncLocalSession(result)
          uni.reLaunch({
            url: '/pages/my/my',
          })
          return
        }

        console.log('登录面板：当前微信账号尚未建档，准备打开资料补充弹窗')
        this.toggleDialog(true, false)
      } catch (error) {
        console.error('登录面板：快捷登录失败', error)
        uni.showToast({
          title: error.message || '微信登录失败',
          icon: 'none',
        })
      } finally {
        this.isSubmitting = false
        console.log('登录面板：快捷登录流程结束，准备关闭加载状态')
        uni.hideLoading()
      }
    },
    // 中文注释：调用云函数完成微信身份登录、老账号绑定和首次建档。
    async loginByWeChat(code) {
      console.log('登录面板：开始调用微信登录云函数', {
        code,
        avatarUrl: this.avatarUrl,
        nickName: this.nickName,
        legacyUserId: this.userId,
      })

      const response = await wx.cloud.callFunction({
        name: CLOUD_FUNCTIONS.WECHAT_LOGIN,
        data: {
          code,
          avatarUrl: this.avatarUrl,
          nickName: this.nickName,
          backimage: '',
          legacyUserId: this.userId || '',
          createIfNotExists: true,
        },
      })

      const result = response && response.result ? response.result : {}
      console.log('登录面板：微信登录云函数返回结果', result)

      if (!result.success || !result.data || !result.data._id) {
        throw new Error(result.message || '微信登录失败')
      }

      return result
    },
    // 中文注释：提交资料完成首次微信建档和登录。
    async submit() {
      console.log('登录面板：开始执行微信登录提交流程')

      if (this.isSubmitting) {
        console.log('登录面板：当前已有登录请求在执行，忽略重复提交')
        return
      }

      if (!this.avatarUrl) {
        console.log('登录面板：缺少头像，阻止提交')
        uni.showToast({
          title: '请先选择头像',
          icon: 'none',
        })
        return
      }

      if (!this.nickName) {
        console.log('登录面板：缺少昵称，阻止提交')
        uni.showToast({
          title: '请先填写昵称',
          icon: 'none',
        })
        return
      }

      this.isSubmitting = true
      console.log('登录面板：已加锁提交流程，准备展示加载状态')
      uni.showLoading({
        title: '微信登录中',
        mask: true,
      })

      try {
        const code = await this.runWeChatLogin()
        console.log('登录面板：已成功获取微信登录 code，准备请求云函数')
        const result = await this.loginByWeChat(code)

        this.syncLocalSession(result)
        this.showDialog = false
        console.log('登录面板：登录弹窗已关闭，准备刷新我的页面')
        uni.reLaunch({
          url: '/pages/my/my',
        })
      } catch (error) {
        console.error('登录面板：微信登录提交流程失败', error)
        uni.showToast({
          title: error.message || '微信登录失败',
          icon: 'none',
        })
      } finally {
        this.isSubmitting = false
        console.log('登录面板：提交流程结束，准备关闭加载状态')
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

.login-dialog__title-text {
  color: #333;
}

.login-dialog__row {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.login-dialog__label {
  color: #787376;
}

.login-dialog__input {
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

.login-dialog__action-item {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-dialog__action-button {
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
