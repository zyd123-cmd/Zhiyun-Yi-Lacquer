<template>
  <view class="my-page">
    <view v-if="pageStatus === 'loading'" class="my-page__loading">
      <view class="my-page__loading-card">
        <view class="my-page__loading-spinner" />
        <text class="my-page__loading-text">正在同步微信登录状态</text>
      </view>
    </view>

    <user-profile-panel
      v-else-if="pageStatus === 'profile'"
      :initial-profile="pageProfile"
      @logout-success="handleLogoutSuccess"
      @profile-updated="handleProfileUpdated"
    />

    <user-login-panel v-else @login-success="handleLoginSuccess" />
  </view>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { CLOUD_FUNCTIONS } from '@/utils/cloud'
import UserLoginPanel from '@/components/user-login-panel/user-login-panel.vue'
import UserProfilePanel from '@/components/user-profile-panel/user-profile-panel.vue'

export default {
  components: {
    UserLoginPanel,
    UserProfilePanel,
  },
  computed: {
    ...mapState('m_user', ['manualLogout', 'userId', 'userProfile']),
  },
  data() {
    return {
      pageStatus: 'loading',
      pageProfile: this.createEmptyProfile(),
      isCheckingLogin: false,
      hasInitialized: false,
    }
  },
  onLoad() {
    console.log('我的页面：页面加载完成，开始准备页面初始状态')
    this.pageStatus = 'loading'
    console.log('我的页面：页面初始状态已切换到 loading')
  },
  onShow() {
    console.log('我的页面：页面显示，准备刷新微信登录态')
    this.loadLoginState({
      silent: this.hasInitialized && this.pageStatus === 'profile',
    })
  },
  methods: {
    ...mapMutations('m_user', [
      'setLoginStatus',
      'setManualLogout',
      'setOpenId',
      'setUserId',
      'setUserProfile',
      'clearUserProfile',
    ]),
    // 中文注释：统一空资料结构，避免页面在切换时出现 undefined。
    createEmptyProfile() {
      console.log('我的页面：开始创建空资料对象')
      return {
        id: '',
        avatarUrl: '',
        nickName: '',
      }
    },
    // 中文注释：统一标准化用户资料，兼容 id 和 _id 两种字段。
    normalizeProfile(profile) {
      console.log('我的页面：开始标准化用户资料', profile)

      if (!profile || typeof profile !== 'object') {
        console.log('我的页面：资料为空，返回空资料对象')
        return this.createEmptyProfile()
      }

      const normalizedProfile = {
        id: profile.id || profile._id || '',
        avatarUrl: profile.avatarUrl || '',
        nickName: profile.nickName || '',
      }

      console.log('我的页面：用户资料标准化完成', normalizedProfile)
      return normalizedProfile
    },
    // 中文注释：统一判断当前返回结果是否已经带有可用的项目用户资料。
    hasBoundUserProfile(result) {
      const hasProfile = Boolean(
        result &&
        result.data &&
        (result.data._id || result.data.id)
      )
      console.log('我的页面：完成登录结果用户资料判断', result, hasProfile)
      return hasProfile
    },
    // 中文注释：识别开发者工具仍在运行旧版本地云函数时返回的原始 event 结构，避免误判为未建档。
    isRawWechatLoginEvent(result) {
      const isRawEvent = Boolean(
        result &&
        !Object.prototype.hasOwnProperty.call(result, 'success') &&
        (result.tcbContext || result.userInfo || Object.prototype.hasOwnProperty.call(result, 'code'))
      )
      console.log('我的页面：完成原始云函数事件结构判断', result, isRawEvent)
      return isRawEvent
    },
    // 中文注释：统一规范化微信登录云函数返回结构，并在结构异常时给出明确错误。
    normalizeWechatLoginResult(response) {
      console.log('我的页面：开始规范化微信登录云函数返回结构', response)
      const result = response && response.result ? response.result : (response || {})

      if (result && typeof result.success === 'boolean') {
        console.log('我的页面：识别到标准微信登录云函数返回结构', result)
        return result
      }

      if (this.isRawWechatLoginEvent(result)) {
        console.error('我的页面：识别到原始云函数事件结构，说明 wechatLogin 云函数未正确更新', result)
        throw new Error('wechatLogin 云函数未更新，请重新上传并部署 wechatLogin 云函数')
      }

      if (result && result.data && (result.data._id || result.data.id)) {
        console.log('我的页面：识别到兼容用户资料结构，补齐 success 字段后继续使用', result)
        return {
          success: true,
          ...result,
        }
      }

      console.error('我的页面：未识别到可用的微信登录云函数返回结构', result)
      throw new Error('wechatLogin 云函数返回结构异常，请重新上传并部署云函数')
    },
    // 中文注释：统一切换到登录页状态，保证不会再闪出错误资料。
    switchToLoginPage() {
      console.log('我的页面：开始切换到登录页状态')
      this.pageProfile = this.createEmptyProfile()
      this.pageStatus = 'login'
      this.clearUserProfile()
      console.log('我的页面：已切换到登录页状态')
    },
    // 中文注释：统一切换到个人中心状态，只有资料完整后才允许显示。
    switchToProfilePage(profile) {
      const normalizedProfile = this.normalizeProfile(profile)
      console.log('我的页面：开始切换到个人中心状态', normalizedProfile)
      this.pageProfile = normalizedProfile
      this.pageStatus = 'profile'
      this.setUserProfile(normalizedProfile)
      console.log('我的页面：已切换到个人中心状态')
    },
    // 中文注释：统一同步登录态，避免不同入口各自维护一份逻辑。
    syncSessionFromResult(result) {
      console.log('我的页面：开始同步云端返回的登录态', result)
      const normalizedProfile = this.normalizeProfile(result.data)
      this.setUserId(normalizedProfile.id)
      this.setOpenId(result.openid || result.data.openid || '')
      this.setLoginStatus(true)
      this.setManualLogout(false)
      this.setUserProfile(normalizedProfile)
      console.log('我的页面：云端登录态同步完成', normalizedProfile)
      return normalizedProfile
    },
    // 中文注释：登录面板登录成功后直接切换页面，避免再自我 reLaunch 触发二次登录。
    handleLoginSuccess(profile) {
      console.log('我的页面：收到登录面板的登录成功事件', profile)
      this.switchToProfilePage(profile)
      this.hasInitialized = true
      console.log('我的页面：登录成功事件处理完成')
    },
    // 中文注释：个人资料更新后同步页面状态，保证父子组件数据一致。
    handleProfileUpdated(profile) {
      console.log('我的页面：收到个人资料更新事件', profile)

      const normalizedProfile = this.normalizeProfile(profile)
      const currentProfileString = JSON.stringify(this.normalizeProfile(this.pageProfile))
      const nextProfileString = JSON.stringify(normalizedProfile)
      console.log('我的页面：开始比较当前资料与最新资料是否一致', {
        currentProfileString,
        nextProfileString,
      })

      if (currentProfileString === nextProfileString) {
        console.log('我的页面：当前资料与最新资料一致，无需重复更新页面状态')
        return
      }

      this.pageProfile = normalizedProfile
      console.log('我的页面：个人资料更新事件处理完成', this.pageProfile)
    },
    // 中文注释：退出登录后直接切回登录页，避免页面重载带来的闪屏。
    handleLogoutSuccess() {
      console.log('我的页面：收到退出登录事件，准备切回登录页')
      this.switchToLoginPage()
      this.hasInitialized = true
      console.log('我的页面：退出登录事件处理完成')
    },
    // 中文注释：封装 wx.login，确保每次校验都走微信官方登录接口。
    runWeChatLogin() {
      console.log('我的页面：开始调用 wx.login 获取微信登录 code')

      return new Promise((resolve, reject) => {
        wx.login({
          success: (res) => {
            console.log('我的页面：wx.login 调用成功', res)

            if (!res.code) {
              reject(new Error('wx.login 未返回有效 code'))
              return
            }

            resolve(res.code)
          },
          fail: (error) => {
            console.error('我的页面：wx.login 调用失败', error)
            reject(error)
          },
        })
      })
    },
    // 中文注释：静默恢复登录态时，只在必要场景展示 loading，避免页面来回闪烁。
    async loadLoginState(options = {}) {
      const silent = Boolean(options.silent)
      console.log('我的页面：开始执行登录态恢复逻辑', { silent })

      if (this.isCheckingLogin) {
        console.log('我的页面：当前已有登录态恢复任务在执行，直接跳过')
        return
      }

      if (this.manualLogout) {
        console.log('我的页面：检测到用户手动退出过，本次不做静默登录')
        this.pageStatus = 'login'
        this.pageProfile = this.createEmptyProfile()
        this.setLoginStatus(false)
        this.hasInitialized = true
        return
      }

      this.isCheckingLogin = true
      console.log('我的页面：已锁定登录态恢复流程')

      if (!silent) {
        this.pageStatus = 'loading'
        console.log('我的页面：本次需要展示 loading 页面，等待微信登录态校验完成')
      }

      try {
        const code = await this.runWeChatLogin()
        console.log('我的页面：已拿到微信登录 code，准备调用云函数换取项目用户态')

        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.WECHAT_LOGIN,
          data: {
            code,
            createIfNotExists: false,
          },
        })

        const result = this.normalizeWechatLoginResult(res)
        console.log('我的页面：微信登录云函数返回结果', result)

        if (!result.success) {
          throw new Error(result.message || '微信登录失败')
        }

        const hasProfile = this.hasBoundUserProfile(result)

        if (!hasProfile) {
          if (!result.needsProfile) {
            console.error('我的页面：静默登录未拿到资料且未返回 needsProfile 标记，判定为异常结构', result)
            throw new Error('wechatLogin 云函数返回结果异常，请重新部署后重试')
          }

          console.log('我的页面：当前微信账号尚未建档，准备显示登录页')
          this.setOpenId(result.openid || '')
          this.setLoginStatus(false)
          this.switchToLoginPage()
          this.hasInitialized = true
          return
        }

        console.log('我的页面：当前微信账号已建档，开始同步本地用户状态')
        const normalizedProfile = this.syncSessionFromResult(result)
        this.switchToProfilePage(normalizedProfile)
        this.hasInitialized = true
        console.log('我的页面：微信登录态恢复完成，已展示个人中心')
      } catch (error) {
        console.error('我的页面：登录态恢复失败', error)

        if (this.pageStatus !== 'profile') {
          this.switchToLoginPage()
        }

        this.setLoginStatus(false)
        this.hasInitialized = true
      } finally {
        this.isCheckingLogin = false
        console.log('我的页面：登录态恢复流程结束，已释放执行锁')
      }
    },
  },
}
</script>

<style lang="scss">
.my-page {
  min-height: 100%;
}

.my-page__loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fff8f5 0%, #f6f2ef 100%);
}

.my-page__loading-card {
  width: 100%;
  max-width: 560rpx;
  padding: 56rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  border-radius: 28rpx;
  background-color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18rpx 40rpx rgba(192, 0, 0, 0.08);
}

.my-page__loading-spinner {
  width: 72rpx;
  height: 72rpx;
  border: 8rpx solid rgba(192, 0, 0, 0.12);
  border-top-color: #c00000;
  border-radius: 50%;
  animation: my-page-spin 0.9s linear infinite;
}

.my-page__loading-text {
  font-size: 28rpx;
  color: #5c4a42;
  letter-spacing: 2rpx;
}

@keyframes my-page-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
