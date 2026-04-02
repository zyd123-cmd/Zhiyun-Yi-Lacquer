<template>
  <view class="user-profile">
    <view class="user-profile__header">
      <image :src="profile.avatarUrl" class="user-profile__avatar" />
      <view class="user-profile__nickname">{{ profile.nickName }}</view>
    </view>

    <view class="panel-list">
      <view class="panel">
        <view class="panel-body panel-body--column">
          <text class="panel-tip">感谢您使用智韵彝漆。</text>
          <text class="panel-tip">更多精彩功能匠心研发中。</text>
        </view>
      </view>

      <view class="panel">
        <view class="panel-title">
          <text>精品推荐</text>
        </view>
        <view class="panel-body">
          <navigator class="panel-item" url="/subcontentpkg/sumcontent/sumcontent">
            <image src="/static/myicon/演示.png" class="icon" />
            <text>图像</text>
          </navigator>
          <navigator class="panel-item" url="/subpkg/3djs/3djs">
            <image src="/static/myicon/产品模型.png" class="icon" />
            <text>模型</text>
          </navigator>
          <navigator class="panel-item" url="/subpkg/arsum/arsum">
            <image src="/static/myicon/AR扫一扫.png" class="icon" />
            <text>AR</text>
          </navigator>
          <view class="panel-item" @click="goHome">
            <image src="/static/myicon/更多.png" class="icon" />
            <text>更多</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="panel-list-item" @click="showProfileActions">
          <text>更改信息</text>
          <uni-icons type="arrowright" size="15" />
        </view>
        <navigator class="panel-list-item" url="/subcontentpkg/collection/collection">
          <text>我的收藏</text>
          <uni-icons type="arrowright" size="15" />
        </navigator>
        <view class="panel-list-item" @click="logout">
          <text>退出登录</text>
          <uni-icons type="arrowright" size="15" />
        </view>
      </view>
    </view>

    <view v-if="showNicknameDialog">
      <view class="dialog-mask" />
      <view class="dialog-panel" :class="{ 'is-visible': showNicknameDialog, 'is-hidden': !showNicknameDialog }">
        <view class="dialog-title">
          <text>修改昵称</text>
        </view>
        <view class="dialog-row">
          <text>昵称：</text>
          <input form-type="submit" type="nickname" placeholder="请输入昵称" @blur="onNicknameBlur" />
        </view>
        <view class="dialog-actions">
          <view><button @click="closeNicknameDialog">取消</button></view>
          <view><button type="primary" @click="submitNickname">保存</button></view>
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
  methods: {
    ...mapMutations('m_user', ['setUserId', 'setLoginStatus']),
    goHome() {
      uni.reLaunch({
        url: '/pages/index/index',
      })
    },
    closeNicknameDialog() {
      this.showNicknameDialog = false
    },
    onNicknameBlur(event) {
      this.profile.nickName = event.detail.value
    },
    async submitNickname() {
      uni.showLoading({
        title: '修改中',
        mask: true,
      })

      try {
        await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.UPDATE_USER_NICKNAME,
          data: {
            id: this.profile.id,
            nickName: this.profile.nickName,
          },
        })

        this.showNicknameDialog = false
        uni.reLaunch({
          url: '/pages/my/my',
        })
      } catch (error) {
        console.error('更新昵称失败:', error)
      } finally {
        uni.hideLoading()
      }
    },
    async logout() {
      try {
        const { confirm } = await uni.showModal({
          title: '提示',
          content: '确认退出登录吗？',
        })

        if (!confirm) {
          return
        }

        this.setUserId('')
        this.setLoginStatus(false)
        uni.reLaunch({
          url: '/pages/my/my',
        })
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },
    showProfileActions() {
      wx.showActionSheet({
        itemList: ['更换昵称', '更换头像'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            this.showNicknameDialog = true
            return
          }

          this.chooseAvatarImage()
        },
      })
    },
    chooseAvatarImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.uploadAvatar(res.tempFilePaths[0])
        },
      })
    },
    uploadAvatar(tempPath) {
      uni.showLoading({
        title: '上传中',
        mask: true,
      })

      const suffixMatch = /\.[^\\.]+$/.exec(tempPath)
      const suffix = suffixMatch ? suffixMatch[0] : '.png'

      wx.cloud.uploadFile({
        cloudPath: `userimg/${Date.now()}${suffix}`,
        filePath: tempPath,
        success: async (res) => {
          this.profile.avatarUrl = res.fileID

          try {
            await wx.cloud.callFunction({
              name: CLOUD_FUNCTIONS.UPDATE_USER_AVATAR,
              data: {
                id: this.userId,
                avatarUrl: this.profile.avatarUrl,
              },
            })
          } catch (error) {
            console.error('更新头像失败:', error)
          } finally {
            uni.hideLoading()
          }
        },
        fail: (error) => {
          console.error('头像上传失败', error)
          uni.hideLoading()
        },
      })
    },
    async loadUserProfile() {
      try {
        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.GET_USER_PROFILE,
          data: {
            id: this.userId,
          },
        })

        this.profile.avatarUrl = res.result.data.avatarUrl
        this.profile.nickName = res.result.data.nickName
        this.profile.id = res.result.data._id
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
  },
  mounted() {
    if (this.userId) {
      this.loadUserProfile()
    }
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

.panel-item text {
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

.dialog-row {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.dialog-row text {
  color: #787376;
}

.dialog-row input {
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

.dialog-actions view {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-actions view button {
  width: 90%;
}
</style>
