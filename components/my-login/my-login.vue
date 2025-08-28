<template>
  <view>
    <!-- 主页面  -->
    <view class="login-container">
      <!-- 提示登录的图标 -->
      <uni-icons type="contact-filled" size="100" color="#AFAFAF"></uni-icons>
      <!-- 登录按钮 -->
      <button type="primary" class="btn-login" @click="closeTank">一键登录</button>
      <!-- 登录提示 -->
      <view class="tips-text">登录后尽享更多权益</view>
    </view>
    <!-- 登录弹窗 true显示 -->
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
    mapState,
    mapMutations
  } from 'vuex'
  // 其他代码
  export default {
    computed: {
      // 调用 mapState 方法，把 m_cart 模块中的 cart 数组映射到当前页面中，作为计算属性来使用
      // ...mapState('模块的名称', ['要映射的数据名称1', '要映射的数据名称2'])
      ...mapState('m_user', ['userid','loginTank']),
    },
    
    data() {
      return {
        userInfo_tank: false,
        avatarUrl: '',
        nickName: '',
        Tank: true,
      };
    },
    methods: {
      // 2. 调用 mapMutations 辅助方法，把 m_user 模块中的 updateUserInfo 映射到当前组件中使用
      ...mapMutations('m_user', ['updateUserid', 'updateTank', 'updateloginTank']),
      // 判断登录
      closeTank() {
          // 将 userInfo_tank 设置为它的相反值
          this.userInfo_tank = !this.userInfo_tank;
          if (!this.userInfo_tank) {
            // 显示提示框
            uni.showToast({
              title: '您取消了登录',
              icon: 'none',
              duration: 500 // 持续时间，单位毫秒
            });
          }
      },
      onChooseAvatar(e) {
        console.log('选择图片后返回的数据是', e);
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
            console.log("头像的fileid是", this.avatarUrl);
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
      async saveuser() {
        try {
          const res = await wx.cloud.callFunction({
            name: 'pushuser',
            data: {
              avatarUrl: this.avatarUrl,
              nickName: this.nickName,
              backimage: "",
            }
          });
          console.log('云函数调用成功了哦，返回的数据是', res);
          
          this.updateUserid(res.result.data._id);

          this.updateTank(true);
          return res; // 返回调用结果，以便后续操作
        } catch (err) {
          console.error('注册失败', err);
          throw err; // 将错误向外抛出，以便可以被 .catch() 捕获
        }
      },

      submit() {
        // 显示加载中弹窗
        uni.showLoading({
          title: '登录中',
          mask: true // 阻止背景点击
        });
        this.saveuser().then(() => {
          // 只有当 saveuser 成功完成后才执行这里的代码
          this.userInfo_tank = false;
          uni.reLaunch({
            url: '/pages/my/my'
          });
        }).catch(err => {
          // 处理 saveuser 中发生的错误
          console.error('提交过程中发生错误:', err);
          this.userInfo_tank = false; // 可以根据需要决定是否需要在这里处理错误状态
        });
      },
    }
  }
</script>

<style lang="scss">
  //主页面样式
  .login-container {
    // 登录盒子的样式
    height: 750rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f8f8f8;
    position: relative;
    overflow: hidden;

    // 绘制登录盒子底部的半椭圆造型
    &::after {
      content: ' ';
      display: block;
      position: absolute;
      width: 100%;
      height: 40px;
      left: 0;
      bottom: 0;
      background-color: white;
      border-radius: 100%;
      transform: translateY(50%);
    }

    // 登录按钮的样式
    .btn-login {
      width: 90%;
      border-radius: 100px;
      margin: 15px 0;
      background-color: #c00000;
    }

    // 按钮下方提示消息的样式
    .tips-text {
      font-size: 12px;
      color: gray;
    }
  }

  //弹窗样式
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