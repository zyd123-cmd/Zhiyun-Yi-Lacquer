<template>
  <view class="user-profile">
    <view class="user-profile__header">
      <image :src="displayAvatarUrl" class="user-profile__avatar" />
      <view class="user-profile__nickname">{{ displayNickName }}</view>
    </view>

    <view class="panel-list">
      <view class="panel">
        <view class="panel-body panel-body--column">
          <text class="panel-tip">感谢您使用智韵彝漆</text>
          <text class="panel-tip">更多精彩功能正在持续完善中</text>
        </view>
      </view>

      <view class="panel">
        <view class="panel-title">
          <text class="panel-title__text">精品推荐</text>
        </view>
        <view class="panel-body">
          <navigator class="panel-item" url="/subcontentpkg/sumcontent/sumcontent">
            <image src="/static/myicon/演示.png" class="icon" />
            <text class="panel-item__text">图像</text>
          </navigator>
          <navigator class="panel-item" url="/subpkg/3djs/3djs">
            <image src="/static/myicon/产品模型.png" class="icon" />
            <text class="panel-item__text">模型</text>
          </navigator>
          <navigator class="panel-item" url="/subpkg/arsum/arsum">
            <image src="/static/myicon/AR扫一扫.png" class="icon" />
            <text class="panel-item__text">AR</text>
          </navigator>
          <view class="panel-item" @click="goHome">
            <image src="/static/myicon/更多.png" class="icon" />
            <text class="panel-item__text">更多</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="panel-list-item" @click="showProfileActions">
          <text class="panel-list-item__text">修改信息</text>
          <uni-icons type="arrowright" size="15" />
        </view>
        <navigator class="panel-list-item" url="/subcontentpkg/collection/collection">
          <text class="panel-list-item__text">我的收藏</text>
          <uni-icons type="arrowright" size="15" />
        </navigator>
        <view class="panel-list-item" @click="logout">
          <text class="panel-list-item__text">退出登录</text>
          <uni-icons type="arrowright" size="15" />
        </view>
      </view>
    </view>

    <view v-if="showNicknameDialog">
      <view class="dialog-mask" />
      <view class="dialog-panel" :class="{ 'is-visible': showNicknameDialog, 'is-hidden': !showNicknameDialog }">
        <view class="dialog-title">
          <text class="dialog-title__text">修改昵称</text>
        </view>
        <view class="dialog-row">
          <text class="dialog-row__label">昵称：</text>
          <input
            class="dialog-row__input"
            form-type="submit"
            type="nickname"
            placeholder="请输入昵称"
            :value="profile.nickName"
            @blur="onNicknameBlur"
          />
        </view>
        <view class="dialog-actions">
          <view class="dialog-actions__item">
            <button class="dialog-actions__button" @click="closeNicknameDialog">取消</button>
          </view>
          <view class="dialog-actions__item">
            <button class="dialog-actions__button" type="primary" @click="submitNickname">保存</button>
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
  name: 'UserProfilePanel',
  computed: {
    ...mapState('m_user', ['userId']),
    // 中文注释：优先展示云端头像，没有时回退到默认头像。
    displayAvatarUrl() {
      console.log('个人资料面板：开始计算展示头像', this.profile.avatarUrl)
      return this.profile.avatarUrl || '/static/myicon/user.png'
    },
    // 中文注释：优先展示云端昵称，没有时回退到默认文案。
    displayNickName() {
      console.log('个人资料面板：开始计算展示昵称', this.profile.nickName)
      return this.profile.nickName || '微信用户'
    },
  },
  data() {
    return {
      profile: {
        id: '',
        avatarUrl: '',
        nickName: '',
      },
      showNicknameDialog: false,
    }
  },
  mounted() {
    console.log('个人资料面板：组件挂载完成，准备加载用户资料')
    this.loadUserProfile()
  },
  methods: {
    ...mapMutations('m_user', ['clearUserSession']),
    // 中文注释：兼容新版 success/data 结构和旧版 document.get 原始返回结构。
    extractProfileData(result) {
      console.log('个人资料面板：开始兼容解析用户资料结果', result)

      if (result && result.success && result.data && result.data._id) {
        console.log('个人资料面板：识别到新版云函数返回结构')
        return result.data
      }

      if (result && result.data && result.data._id) {
        console.log('个人资料面板：识别到旧版 document.get 返回结构')
        return result.data
      }

      if (result && result._id) {
        console.log('个人资料面板：识别到直接返回用户对象的结构')
        return result
      }

      console.log('个人资料面板：未识别到可用的用户资料结构')
      return null
    },
    // 中文注释：兼容 success 包装结构与旧版数据库 update 原始返回结构。
    isMutationSuccessful(result) {
      console.log('个人资料面板：开始判断资料更新结果是否成功', result)

      if (result && typeof result.success === 'boolean') {
        console.log('个人资料面板：已通过 success 字段判断更新结果', result.success)
        return result.success
      }

      if (result && typeof result.errMsg === 'string' && result.errMsg.indexOf(':ok') !== -1) {
        console.log('个人资料面板：已通过 errMsg 判断旧版更新结果成功')
        return true
      }

      if (result && result.stats) {
        console.log('个人资料面板：已通过 stats 判断旧版更新结果成功')
        return true
      }

      console.log('个人资料面板：未识别到成功的资料更新结果')
      return false
    },
    // 中文注释：跳回首页，方便用户继续浏览内容。
    goHome() {
      console.log('个人资料面板：用户点击更多，准备跳转首页')
      uni.reLaunch({
        url: '/pages/index/index',
      })
    },
    // 中文注释：关闭昵称编辑弹窗。
    closeNicknameDialog() {
      console.log('个人资料面板：准备关闭昵称编辑弹窗')
      this.showNicknameDialog = false
      console.log('个人资料面板：昵称编辑弹窗已关闭')
    },
    // 中文注释：记录用户输入的新昵称。
    onNicknameBlur(event) {
      console.log('个人资料面板：收到昵称输入事件', event)
      this.profile.nickName = event && event.detail ? String(event.detail.value || '').trim() : ''
      console.log('个人资料面板：昵称草稿已更新', this.profile.nickName)
    },
    // 中文注释：提交昵称更新请求，并在成功后刷新本地展示。
    async submitNickname() {
      console.log('个人资料面板：开始提交昵称更新请求')

      if (!this.profile.nickName) {
        console.log('个人资料面板：昵称为空，阻止提交')
        uni.showToast({
          title: '请输入昵称',
          icon: 'none',
        })
        return
      }

      uni.showLoading({
        title: '修改中',
        mask: true,
      })
      console.log('个人资料面板：已展示昵称修改加载状态')

      try {
        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.UPDATE_USER_NICKNAME,
          data: {
            id: this.profile.id || this.userId,
            nickName: this.profile.nickName,
          },
        })

        const result = res && res.result ? res.result : {}
        console.log('个人资料面板：昵称更新云函数返回结果', result)

        if (!this.isMutationSuccessful(result)) {
          throw new Error(result.message || '昵称更新失败')
        }

        this.showNicknameDialog = false
        console.log('个人资料面板：昵称更新成功，准备重新加载用户资料')
        await this.loadUserProfile()
      } catch (error) {
        console.error('个人资料面板：昵称更新失败', error)
        uni.showToast({
          title: error.message || '昵称更新失败',
          icon: 'none',
        })
      } finally {
        console.log('个人资料面板：昵称更新流程结束，准备关闭加载状态')
        uni.hideLoading()
      }
    },
    // 中文注释：退出时只清空应用内会话，并标记为手动退出，避免立刻被静默登录拉起。
    async logout() {
      console.log('个人资料面板：开始执行退出登录流程')

      try {
        const { confirm } = await uni.showModal({
          title: '提示',
          content: '确认退出当前登录状态吗？',
        })
        console.log('个人资料面板：退出确认框返回结果', confirm)

        if (!confirm) {
          console.log('个人资料面板：用户取消退出登录')
          return
        }

        this.clearUserSession()
        console.log('个人资料面板：本地会话已清空，准备返回我的页面')
        uni.reLaunch({
          url: '/pages/my/my',
        })
      } catch (error) {
        console.error('个人资料面板：退出登录失败', error)
      }
    },
    // 中文注释：展示用户资料相关操作项。
    showProfileActions() {
      console.log('个人资料面板：准备展示资料操作面板')
      wx.showActionSheet({
        itemList: ['更换昵称', '更换头像'],
        success: ({ tapIndex }) => {
          console.log('个人资料面板：资料操作面板返回结果', tapIndex)

          if (tapIndex === 0) {
            this.showNicknameDialog = true
            console.log('个人资料面板：已打开昵称编辑弹窗')
            return
          }

          this.chooseAvatarImage()
        },
      })
    },
    // 中文注释：选择新的头像图片。
    chooseAvatarImage() {
      console.log('个人资料面板：开始选择新的头像图片')
      uni.chooseImage({
        count: 1,
        success: (res) => {
          console.log('个人资料面板：头像图片选择成功', res)
          this.uploadAvatar(res.tempFilePaths[0])
        },
        fail: (error) => {
          console.error('个人资料面板：头像图片选择失败', error)
        },
      })
    },
    // 中文注释：上传新头像并调用云函数更新当前微信身份绑定的资料。
    uploadAvatar(tempPath) {
      console.log('个人资料面板：开始上传新的头像图片', tempPath)
      uni.showLoading({
        title: '上传中',
        mask: true,
      })
      console.log('个人资料面板：已展示头像上传加载状态')

      const suffixMatch = /\.[^\\.]+$/.exec(tempPath)
      const suffix = suffixMatch ? suffixMatch[0] : '.png'
      console.log('个人资料面板：头像文件后缀解析完成', suffix)

      wx.cloud.uploadFile({
        cloudPath: `userimg/${Date.now()}${suffix}`,
        filePath: tempPath,
        success: async (res) => {
          console.log('个人资料面板：头像上传成功，开始调用云函数更新资料', res)
          this.profile.avatarUrl = res.fileID || ''

          try {
            const updateRes = await wx.cloud.callFunction({
              name: CLOUD_FUNCTIONS.UPDATE_USER_AVATAR,
              data: {
                id: this.profile.id || this.userId,
                avatarUrl: this.profile.avatarUrl,
              },
            })

            const result = updateRes && updateRes.result ? updateRes.result : {}
            console.log('个人资料面板：头像更新云函数返回结果', result)

            if (!this.isMutationSuccessful(result)) {
              throw new Error(result.message || '头像更新失败')
            }

            console.log('个人资料面板：头像更新成功，准备刷新用户资料')
            await this.loadUserProfile()
          } catch (error) {
            console.error('个人资料面板：头像更新失败', error)
            uni.showToast({
              title: error.message || '头像更新失败',
              icon: 'none',
            })
          } finally {
            console.log('个人资料面板：头像上传更新流程结束，准备关闭加载状态')
            uni.hideLoading()
          }
        },
        fail: (error) => {
          console.error('个人资料面板：头像上传失败', error)
          uni.hideLoading()
        },
      })
    },
    // 中文注释：读取当前微信身份绑定的资料，并同步到页面展示。
    async loadUserProfile() {
      console.log('个人资料面板：开始加载当前微信账号的用户资料')

      try {
        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.GET_USER_PROFILE,
          data: {
            id: this.profile.id || this.userId,
          },
        })

        const result = res && res.result ? res.result : {}
        console.log('个人资料面板：获取用户资料云函数返回结果', result)
        const profileData = this.extractProfileData(result)

        if (!profileData) {
          throw new Error(result.message || '未获取到用户资料')
        }

        this.profile.avatarUrl = profileData.avatarUrl || ''
        this.profile.nickName = profileData.nickName || ''
        this.profile.id = profileData._id || ''
        console.log('个人资料面板：页面资料同步完成', this.profile)
      } catch (error) {
        console.error('个人资料面板：获取用户资料失败', error)
        uni.showToast({
          title: error.message || '获取用户资料失败',
          icon: 'none',
        })
      }
    },
  },
}
</script>

<style lang="scss">
.user-profile {
  height: 100%;
  background-color: #f4f4f4;
}

.user-profile__header {
  height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #c00000;
}

.user-profile__avatar {
  width: 90px;
  height: 90px;
  display: block;
  border-radius: 45px;
  border: 2px solid #fff;
  box-shadow: 0 1px 5px #000;
}

.user-profile__nickname {
  margin-top: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.panel-list {
  position: relative;
  top: -10px;
  padding: 0 10px;
}

.panel {
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 3px;
}

.panel-title {
  padding-left: 10px;
  line-height: 45px;
  font-size: 15px;
  border-bottom: 1px solid #f4f4f4;
}

.panel-title__text {
  color: #333;
}

.panel-body {
  display: flex;
  justify-content: space-around;
}

.panel-body--column {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 24rpx 0;
}

.panel-tip {
  font-size: 30rpx;
  font-weight: 300;
  letter-spacing: 5rpx;
  color: #5a5a5a;
}

.panel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 10px 0;
  font-size: 13px;
}

.panel-item__text {
  font-size: 30rpx;
}

.icon {
  width: 35px;
  height: 35px;
}

.panel-list-item {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 15px;
}

.panel-list-item__text {
  color: #333;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 666;
  opacity: 0.3;
  background: #000;
}

.dialog-panel {
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

.dialog-panel.is-visible {
  margin-bottom: 0;
}

.dialog-panel.is-hidden {
  margin-bottom: -700rpx;
}

.dialog-title {
  padding-bottom: 30rpx;
  font-weight: 700;
  border-bottom: 1px solid #eee;
}

.dialog-title__text {
  color: #333;
}

.dialog-row {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.dialog-row__label {
  color: #787376;
}

.dialog-row__input {
  width: 80%;
  text-align: right;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 50rpx 0;
  box-sizing: border-box;
}

.dialog-actions__item {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-actions__button {
  width: 90%;
}
</style>
