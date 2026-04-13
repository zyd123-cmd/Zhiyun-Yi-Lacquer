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
      console.log('登录面板：开始计算当前展示的头像地址', {
        avatarPreviewUrl: this.avatarPreviewUrl,
        avatarUrl: this.avatarUrl,
      })
      return this.avatarPreviewUrl || '/static/myicon/user.png'
    },
  },
  data() {
    return {
      showDialog: false,
      avatarUrl: '',
      avatarPreviewUrl: '',
      nickName: '',
      isSubmitting: false,
      isAvatarUploading: false,
      loadingVisibleCount: 0,
    }
  },
  methods: {
    ...mapMutations('m_user', [
      'setLoginStatus',
      'setManualLogout',
      'setOpenId',
      'setUserId',
      'setUserProfile',
    ]),
    // 中文注释：统一标准化用户资料，保证父页面和缓存拿到同样结构。
    normalizeUserProfile(profile) {
      console.log('登录面板：开始标准化登录返回的用户资料', profile)
      const normalizedProfile = {
        id: (profile && (profile.id || profile._id)) || '',
        avatarUrl: (profile && profile.avatarUrl) || '',
        nickName: (profile && profile.nickName) || '',
      }
      console.log('登录面板：用户资料标准化完成', normalizedProfile)
      return normalizedProfile
    },
    // 中文注释：统一判断当前返回结果是否已经带有可用的项目用户资料。
    hasBoundUserProfile(result) {
      const hasProfile = Boolean(
        result &&
        result.data &&
        (result.data._id || result.data.id)
      )
      console.log('登录面板：完成登录结果用户资料判断', result, hasProfile)
      return hasProfile
    },
    // 中文注释：识别开发者工具仍在运行旧版本地云函数时返回的原始 event 结构，避免误判为未建档。
    isRawWechatLoginEvent(result) {
      const isRawEvent = Boolean(
        result &&
        !Object.prototype.hasOwnProperty.call(result, 'success') &&
        (result.tcbContext || result.userInfo || Object.prototype.hasOwnProperty.call(result, 'code'))
      )
      console.log('登录面板：完成原始云函数事件结构判断', result, isRawEvent)
      return isRawEvent
    },
    // 中文注释：统一规范化微信登录云函数返回结构，并在结构异常时抛出明确错误。
    normalizeWechatLoginResult(response) {
      console.log('登录面板：开始规范化微信登录云函数返回结构', response)
      const result = response && response.result ? response.result : (response || {})

      if (result && typeof result.success === 'boolean') {
        console.log('登录面板：识别到标准微信登录云函数返回结构', result)
        return result
      }

      if (this.isRawWechatLoginEvent(result)) {
        console.error('登录面板：识别到原始云函数事件结构，说明 wechatLogin 云函数未正确更新', result)
        throw new Error('wechatLogin 云函数未更新，请重新上传并部署 wechatLogin 云函数')
      }

      if (result && result.data && (result.data._id || result.data.id)) {
        console.log('登录面板：识别到兼容用户资料结构，补齐 success 字段后继续使用', result)
        return {
          success: true,
          ...result,
        }
      }

      console.error('登录面板：未识别到可用的微信登录云函数返回结构', result)
      throw new Error('wechatLogin 云函数返回结构异常，请重新上传并部署云函数')
    },
    // 中文注释：统一显示加载框，并通过计数器保证多次调用时不会出现状态错乱。
    showPageLoading(title) {
      console.log('登录面板：准备显示页面加载框', {
        title,
        currentLoadingVisibleCount: this.loadingVisibleCount,
      })
      this.loadingVisibleCount += 1
      console.log('登录面板：页面加载框计数已增加', this.loadingVisibleCount)

      if (this.loadingVisibleCount === 1) {
        uni.showLoading({
          title,
          mask: true,
        })
        console.log('登录面板：页面加载框已显示')
        return
      }

      console.log('登录面板：当前已有加载框显示，本次仅更新引用计数')
    },
    // 中文注释：统一关闭加载框，只有计数归零时才真正调用 hideLoading，避免配对警告。
    hidePageLoading() {
      console.log('登录面板：准备关闭页面加载框', {
        currentLoadingVisibleCount: this.loadingVisibleCount,
      })

      if (this.loadingVisibleCount <= 0) {
        console.log('登录面板：当前没有处于显示状态的加载框，本次跳过 hideLoading')
        return
      }

      this.loadingVisibleCount -= 1
      console.log('登录面板：页面加载框计数已减少', this.loadingVisibleCount)

      if (this.loadingVisibleCount > 0) {
        console.log('登录面板：仍存在其它加载流程，本次不关闭全局加载框')
        return
      }

      uni.hideLoading()
      console.log('登录面板：页面加载框已关闭')
    },
    // 中文注释：统一同步本地会话和资料缓存，避免不同登录分支重复写状态。
    syncLocalSession(result) {
      console.log('登录面板：开始同步本地用户会话', result)
      const normalizedProfile = this.normalizeUserProfile(result.data)
      this.setUserId(normalizedProfile.id)
      this.setOpenId(result.openid || result.data.openid || '')
      this.setLoginStatus(true)
      this.setManualLogout(false)
      this.setUserProfile(normalizedProfile)
      console.log('登录面板：本地用户会话同步完成', normalizedProfile)
      return normalizedProfile
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

      this.avatarPreviewUrl = tempPath
      this.isAvatarUploading = true
      console.log('登录面板：已先使用本地临时头像做预览，并标记头像上传中', {
        avatarPreviewUrl: this.avatarPreviewUrl,
        isAvatarUploading: this.isAvatarUploading,
      })

      const suffixMatch = /\.[^\\.]+$/.exec(tempPath)
      const suffix = suffixMatch ? suffixMatch[0] : '.png'
      console.log('登录面板：已解析头像文件后缀', suffix)

      wx.cloud.uploadFile({
        cloudPath: `userimg/${Date.now()}${suffix}`,
        filePath: tempPath,
        success: (res) => {
          console.log('登录面板：头像上传成功，开始保存 fileID', res)
          this.avatarUrl = res.fileID || ''
          this.isAvatarUploading = false
          console.log('登录面板：头像 fileID 保存完成', this.avatarUrl)
        },
        fail: (error) => {
          console.error('登录面板：头像上传失败', error)
          this.isAvatarUploading = false
          this.avatarPreviewUrl = ''
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
      this.showPageLoading('校验微信身份中')

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

        const result = this.normalizeWechatLoginResult(response)
        console.log('登录面板：快捷登录云函数返回结果', result)

        if (!result.success) {
          throw new Error(result.message || '微信登录失败')
        }

        if (this.hasBoundUserProfile(result)) {
          console.log('登录面板：当前微信账号已存在资料，准备直接完成登录')
          const normalizedProfile = this.syncLocalSession(result)
          this.$emit('login-success', normalizedProfile)
          return
        }

        if (!result.needsProfile) {
          console.error('登录面板：快捷登录未拿到资料且未返回 needsProfile 标记，判定为异常结构', result)
          throw new Error('wechatLogin 云函数返回结果异常，请重新部署后重试')
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
        this.hidePageLoading()
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

      const result = this.normalizeWechatLoginResult(response)
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

      if (this.isAvatarUploading) {
        console.log('登录面板：检测到头像仍在上传中，暂不允许提交')
        uni.showToast({
          title: '头像上传中，请稍候',
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
      this.showPageLoading('微信登录中')

      try {
        const code = await this.runWeChatLogin()
        console.log('登录面板：已成功获取微信登录 code，准备请求云函数')
        const result = await this.loginByWeChat(code)
        const normalizedProfile = this.syncLocalSession(result)
        this.showDialog = false
        console.log('登录面板：首次建档成功，准备通知父页面切换到个人中心')
        this.$emit('login-success', normalizedProfile)
      } catch (error) {
        console.error('登录面板：微信登录提交流程失败', error)
        uni.showToast({
          title: error.message || '微信登录失败',
          icon: 'none',
        })
      } finally {
        this.isSubmitting = false
        console.log('登录面板：提交流程结束，准备关闭加载状态')
        this.hidePageLoading()
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
