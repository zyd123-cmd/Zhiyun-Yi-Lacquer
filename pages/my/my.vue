<template>
  <view>
    <user-profile-panel v-if="showProfile" />
    <user-login-panel v-else />
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
    ...mapState('m_user', ['manualLogout', 'userId']),
  },
  data() {
    return {
      showProfile: false,
      isCheckingLogin: false,
    }
  },
  onLoad() {
    console.log('我的页面：页面加载完成，准备恢复微信登录态')
    this.loadLoginState()
  },
  onShow() {
    console.log('我的页面：页面重新显示，准备刷新微信登录态')
    this.loadLoginState()
  },
  methods: {
    ...mapMutations('m_user', [
      'setLoginStatus',
      'setManualLogout',
      'setOpenId',
      'setUserId',
    ]),
    // 中文注释：封装 wx.login，确保登录页每次都走微信官方登录接口。
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
    // 中文注释：进入页面时按当前微信身份静默恢复登录态。
    async loadLoginState() {
      console.log('我的页面：开始执行登录态恢复逻辑')

      if (this.isCheckingLogin) {
        console.log('我的页面：当前已有登录态恢复任务在执行，直接跳过')
        return
      }

      if (this.manualLogout) {
        console.log('我的页面：检测到用户手动退出过，本次不做静默登录')
        this.showProfile = false
        this.setLoginStatus(false)
        return
      }

      this.isCheckingLogin = true
      console.log('我的页面：已锁定登录态恢复流程，准备向云端校验当前微信身份')

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

        const result = res && res.result ? res.result : {}
        console.log('我的页面：微信登录云函数返回结果', result)

        const hasProfile = Boolean(result.success && result.data && result.data._id)

        if (!hasProfile) {
          console.log('我的页面：当前微信账号尚未建档，展示登录面板，并保留旧 userId 供首次绑定兼容')
          this.showProfile = false
          this.setOpenId(result.openid || '')
          this.setLoginStatus(false)
          return
        }

        console.log('我的页面：当前微信账号已建档，开始同步本地用户状态')
        this.setUserId(result.data._id)
        this.setOpenId(result.openid || result.data.openid || '')
        this.setLoginStatus(true)
        this.setManualLogout(false)
        this.showProfile = true
        console.log('我的页面：微信登录态恢复完成，已展示个人中心')
      } catch (error) {
        console.error('我的页面：登录态恢复失败', error)
        this.showProfile = false
        this.setLoginStatus(false)
      } finally {
        this.isCheckingLogin = false
        console.log('我的页面：登录态恢复流程结束，已释放执行锁')
      }
    },
  },
}
</script>

<style lang="scss">
page,
.my-container {
  height: 100%;
}
</style>
