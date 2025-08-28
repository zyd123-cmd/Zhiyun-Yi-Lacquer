<template>
  <view>
    <button @click="closeTank">登录</button>
    <!-- 头像昵称基本信息弹框 -->
    <view v-if="userInfo_tank">
      <view class="userInfo_tank_bg" @click="closeTank"></view>
      <view class="userInfo_tank" :class="{'transfromjoin': userInfo_tank, 'transfromout': !userInfo_tank}">
        <view class="tank_title">
          <text>申请获取您的头像、昵称</text>
        </view>
        <view class="tank_content">
          <text>头像：</text>
          <button class="avatar_button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image class="avatar_url" :src="avatarUrl"></image>
            <view class="pos_photo">
              <text class="iconfont icon-paizhao"></text>
            </view>
          </button>
        </view>
        <view class="tank_content">
          <text>昵称：</text>
          <input form-type="submit" @blur="getNickName" placeholder="请输入昵称" type="nickname" />
        </view>

        <view class="confirm_button">
          <view>
            <button @click="closeTank">拒绝</button>
          </view>
          <view>
            <button @click="submit" type="primary">允许</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import {
    mapMutations
  } from 'vuex'
  export default {
    data() {
      return {
        avatarUrl: '',
        nickName: '',
        userid: '',
        userInfo_tank: false // 显示弹窗
      };
    },
    methods: {
      // 2. 调用 mapMutations 辅助方法，把 m_user 模块中的 updateUserInfo 映射到当前组件中使用
      ...mapMutations('m_user', ['updateUserid']),

      closeTank() {
        this.userInfo_tank = true;
      },
      onChooseAvatar(e) {
        console.log('选择图片后返回的数据是',e);
        const tempPath = e.detail.avatarUrl;
        console.log('tempPath是', tempPath);
        const suffix = /\.[^\.]+$/.exec(tempPath)[0];
        console.log('suffix是', suffix);
        // 直接在小程序端上传文件到云存储
        wx.cloud.uploadFile({
          cloudPath: 'userimg/' + new Date().getTime() + suffix, //在云端的文件名称
          filePath: tempPath, // 临时文件路径
          success: res => {       
            // 存储文件 ID
            this.avatarUrl = res.fileID;
            console.log("头像的fileid是",this.avatarUrl);
            // 可以继续进行后续操作
          },
          fail: err => {
            console.error('头像上传失败', err);
            // 处理上传失败的情况
          }
        });
      },
     
      getNickName(e) {
        console.log("名字是", e);
        this.nickName = e.detail.value;
      },
      saveuser() {
        wx.cloud.callFunction({
          name: 'pushuser', // 云函数的名称
          data: {
            avatarUrl: this.avatarUrl,
            nickName: this.nickName
          },
          success: res => {
            console.log('我要上传的图片的云存储网址是',this.avatarUrl );
            console.log('云函数调用成功了哦，返回的数据是', res);
            this.userid = res.result.data._id;
            this.updateUserid(res.result.data._id);
            // 注册成功后的其他逻辑处理
          },
          fail: err => {
            console.log('注册失败', err);

            // 注册失败后的其他逻辑处理
          }

        });
      },
      submit() {
        this.saveuser();
        // 注意：这里应该使用Promise来处理异步操作，不要直接在success和fail中处理UI逻辑
    }
    }
  }
</script>

<style>
  /* 授权弹窗 */
  .userInfo_tank_bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
    background: #000;
    z-index: 666;
  }

  .userInfo_tank {
    position: fixed;
    bottom: 0;
    background-color: white;
    width: 100%;
    border-radius: 30rpx 30rpx 0 0;
    padding: 30rpx;
    box-sizing: border-box;
    z-index: 999999;
  }

  .transfromjoin {
    transition: all 0.3s;
    margin-bottom: 0;
  }

  .transfromout {
    transition: all 0.3s;
    margin-bottom: -700rpx;
  }

  .avatar_url {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  .tank_content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    height: 100rpx;
  }

  .tank_content text {
    color: #787376;
  }

  .tank_content input {
    width: 80%;
    text-align: right;
  }

  .tank_title {
    border-bottom: 1px solid #eee;
    padding-bottom: 30rpx;
    font-weight: 700;
  }

  .confirm_button {
    display: flex;
    margin: 50rpx 0;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
  }

  .confirm_button view {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50%;
  }

  .pos_photo {
    position: absolute;
    bottom: 0;
    right: -10rpx;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    width: 40rpx;
    height: 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .pos_photo text {
    font-size: 25rpx !important;
    color: #fff;
  }

  .avatar {
    position: relative;
  }

  .confirm_button view button {
    width: 90%;
  }

  .default_button {
    width: none !important;
    margin: 0 !important;
    padding: 10rpx 20rpx !important;
    width: 260rpx !important;
    font-weight: 600 !important;
    font-size: 32rpx !important;
  }

  .avatar_button {
    padding: 0 !important;
    margin: 0 !important;
    width: 80rpx !important;
    height: 80rpx !important;
    border-radius: 50% !important;
    font-size: 32rpx !important;
    overflow: visible !important;
  }
</style>