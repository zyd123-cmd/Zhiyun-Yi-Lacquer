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
    ...mapState('m_user', ['userId']),
  },
  data() {
    return {
      showProfile: false,
    }
  },
  onLoad() {
    this.loadLoginState()
  },
  onShow() {
    this.loadLoginState()
  },
  methods: {
    ...mapMutations('m_user', ['setLoginStatus']),
    async loadLoginState() {
      if (!this.userId) {
        this.showProfile = false
        this.setLoginStatus(false)
        return
      }

      try {
        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.GET_USER_PROFILE,
          data: {
            id: this.userId,
          },
        })

        const hasProfile = Boolean(res && res.result && res.result.data && res.result.data._id)
        this.showProfile = hasProfile
        this.setLoginStatus(hasProfile)
      } catch (error) {
        console.error('加载登录状态失败:', error)
        this.showProfile = false
        this.setLoginStatus(false)
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
