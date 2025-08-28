<template>
  <view class="my-userinfo-container">
    <!-- 头像昵称区域 -->
    <view class="top-box">
      <image :src="usermessage.avatarUrl" class="avatar"></image>
      <view class="nickname">{{usermessage.nickName}}</view>
    </view>
    <!-- 面板的列表区域 -->
    <view class="panel-list">
      <!-- 第一个面板 -->
      <view class="panel"> 
      <!-- panel 的主体区域 -->
        <view class="panel-body">
          <!-- panel 的 item 项 -->
       
<view class="panel-item" style="display: flex; align-items: center; justify-content: center;">
  <view style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <text style="font-size: 30rpx;  font-weight: 300; letter-spacing: 5rpx; color: #5a5a5a;">感谢您使用智美彝漆。</text>
  </view>
  <view style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 10rpx;">
    <text style="font-size: 30rpx; font-weight: 300; letter-spacing: 5rpx; color: #5a5a5a;">更多精彩功能匠心研发中。</text>
  </view>
</view>




        </view>
      </view>
      <!-- 第二个面板 -->
      <view class="panel">
        <!-- 面板的标题 -->
        <view class="panel-title">
          <text style="font-size: 30rpx;">精品推荐 </text>

        </view>
        <!-- 面板的主体 -->
        <view class="panel-body">
          <!-- 面板主体中的 item 项 -->
          <navigator class="panel-item" url="/subcontentpkg/sumcontent/sumcontent">
            <image src="/static/myicon/演示.png" class="icon"></image>
            <text style="font-size: 30rpx;">图像</text>
          </navigator>
          <navigator class="panel-item" url="/subpkg/3djs/3djs">
            <image src="/static/myicon/产品模型.png" class="icon"></image>
            <text style="font-size: 30rpx;">模型</text>
          </navigator>
          <navigator class="panel-item" url="/subpkg/arsum/arsum">
            <image src="/static/myicon/AR扫一扫.png" class="icon"></image>
            <text style="font-size: 30rpx;">AR</text>
            </navigator>
            <view class="panel-item" @click="gotohomepage"  >
            <image src="/static/myicon/更多.png" class="icon"></image>
            <text style="font-size: 30rpx;">更多</text>
          </view>
        </view>
      </view>
      <!-- 第三个面板 -->
      <!-- 第三个面板 -->
      <view class="panel" >
        <view class="panel-list-item" @click="updatemessage">
          <text>更改信息</text>
          <uni-icons type="arrowright" size="15"></uni-icons>
        </view>
        <navigator  class="panel-list-item" url="/subcontentpkg/collection/collection">
          
          <text>我的收藏</text>
          <uni-icons type="arrowright" size="15"></uni-icons>
      
        </navigator>
       
        <view @click="logout" class="panel-list-item">
          <text>退出登录</text>
          <uni-icons type="arrowright" size="15"></uni-icons>
        </view>
      </view>
    </view>
    <!-- 更改昵称面办 -->
    <view v-if="userInfo_tank">
      <view class="userInfo_tank_bg"></view>
      <view class="userInfo_tank" :class="{'transfromjoin': userInfo_tank, 'transfromout': !userInfo_tank}">
        <view class="tank_title">
          <text>申请获取您的昵称</text>
        </view>
        <view class="tank_content">
          <text>昵称：</text>
          <input form-type="submit" @blur="getNickName" placeholder="请输入昵称" type="nickname" />
        </view>
        <view class="confirm_button">
          <view>
            <button @click="closeTank">取消</button>
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
  export default {
    name: "my-userinfo",
    computed: {
      // 调用 mapState 方法，把 m_cart 模块中的 cart 数组映射到当前页面中，作为计算属性来使用
      // ...mapState('模块的名称', ['要映射的数据名称1', '要映射的数据名称2'])
      ...mapState('m_user', ['userid']),
      ...mapState('m_cart', ['cart', 'storycart']),
    },
    data() {
      return {
        usermessage: {
          id: '',
          avatarUrl: '',
          nickName: '',
        },
        userInfo_tank: false,
      };
    },
    methods: {
      // 把 m_user 模块中的  updateuserInfo_tank 方法映射到当前页面使用
      ...mapMutations('m_user', ['updateUserid', 'updateTank']),
      gotohomepage(){
        uni.reLaunch({
          url:'/pages/index/index'
        });
      },
      // 关闭更改弹窗
      closeTank() {
        this.userInfo_tank = false;
      },
      // 获得更改的昵称
      getNickName(e) {
        console.log("名字是", e);
        this.usermessage.nickName = e.detail.value;
      },
      // 提交更改的昵称
      async saveuser() {
        try {
          const res = await wx.cloud.callFunction({
            name: 'updatename',
            data: {
              id: this.usermessage.id,
              nickName: this.usermessage.nickName,
            }
          });
          console.log('云函数调用成功了哦，返回的数据是', res);
          return res; // 返回调用结果，以便后续操作
        } catch (err) {
          console.error('注册失败', err);
          throw err; // 将错误向外抛出，以便可以被 .catch() 捕获
        }
      },
      submit() {
        // 显示加载中弹窗
        uni.showLoading({
          title: '修改中',
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
      // 退出登录
      async logout() {
        try {
          // 显示模态对话框，询问用户是否退出登录
          const {
            confirm
          } = await uni.showModal({
            title: '提示',
            content: '确认退出登录吗？'
          });
          if (confirm) {
            // 用户确认退出登录，执行清空操作
            this.updateUserid('');
            this.updateTank(false);
            uni.reLaunch({
              url: '/pages/my/my'
            });
          }
        } catch (error) {
          // 处理可能的错误
          console.error('退出登录出错:', error);
        }
      },
      // 更改信息
      updatemessage() {
        wx.showActionSheet({
          itemList: ['更换昵称', '更换头像'],
          success: (res) => {
            console.log(res.tapIndex);
            if (res.tapIndex === 0) {
              this.userInfo_tank = true;
              console.log("更换昵称", this.userInfo_tank);
              this.updatename();
            } else {
              console.log("更换头像");
              this.changeback();
            }
          }
        })
      },
      // 更改昵称
      updatename() {

      },
      //更换头像
      changeback() {
        uni.chooseImage({
          count: 1,
          success: (res) => {
            console.log('res.tempFilePaths是', res.tempFilePaths);
            this.onChooseAvatar(res.tempFilePaths[0]);
          }
        })
      },
      //上传头像
      onChooseAvatar(e) {
        uni.showLoading({
          title: '上传中',
          mask: true // 阻止背景点击
        });
        console.log('选择图片后返回的数据是', e);
        const tempPath = e;
        console.log('tempPath是', tempPath);
        const suffix = /\.[^\.]+$/.exec(tempPath)[0];
        console.log('suffix是', suffix);
        // 直接在小程序端上传文件到云存储
        wx.cloud.uploadFile({
          cloudPath: 'back/' + new Date().getTime() + suffix, //在云端的文件名称
          filePath: tempPath, // 临时文件路径
          success: res => {
            // 存储文件 ID
            this.usermessage.avatarUrl = res.fileID;

            console.log("存储的背景图的地址", this.usermessage.avatarUrl);
            this.pushbackimage();
            uni.hideLoading();
            // 可以继续进行后续操作
          },
          fail: err => {
            console.error('头像上传失败', err);
            // 处理上传失败的情况
          }
        });
      },
      //上传头像到数据库
      pushbackimage() {
        wx.cloud.callFunction({
          name: "pushbackimage",
          data: {
            id: this.userid,
            avatarUrl: this.usermessage.avatarUrl,
          }
        }).then(() => {
          console.log("成功上传背景图到数据库中");
        })
      },
      getuser() {
        wx.cloud.callFunction({
          name: 'getuser',
          data: {
            id: this.userid
          },
          success: res => {
            console.log('云函数获取的用户信息是', res);
            this.usermessage.avatarUrl = res.result.data.avatarUrl;
            this.usermessage.nickName = res.result.data.nickName;
            this.usermessage.id = res.result.data._id;
            // 注册成功后的其他逻辑处理
          },
          fail: err => {
            console.log('获取用户的信息失败', err);

            // 注册失败后的其他逻辑处理
          }
        })
      },
    },
    // 使用 mounted 钩子来模拟 onLoad 的行为
    mounted() {
      if (this.userid) {
        this.getuser();
      }
    },

  }
</script>

<style lang="scss">
  // 头部样式
  .my-userinfo-container {
    height: 100%;
    // 为整个组件的结构添加浅灰色的背景
    background-color: #f4f4f4;

    .top-box {
      height: 400rpx;
      background-color: #c00000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .avatar {
        display: block;
        width: 90px;
        height: 90px;
        border-radius: 45px;
        border: 2px solid white;
        box-shadow: 0 1px 5px black;
      }

      .nickname {
        color: white;
        font-weight: bold;
        font-size: 16px;
        margin-top: 10px;
      }
    }
  }

  //对一个面办样式
  .panel-list {
    padding: 0 10px;
    position: relative;
    top: -10px;

    .panel {
      background-color: white;
      border-radius: 3px;
      margin-bottom: 8px;


      .panel-body {
        display: flex;
        justify-content: space-around;

        .panel-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          font-size: 13px;
          padding: 10px 0;
        }
      }
    }
  }

  // 第二个面办样式
  .panel-list {
    padding: 0 10px;
    position: relative;
    top: -10px;

    .panel {
      background-color: white;
      border-radius: 3px;
      margin-bottom: 8px;

      .panel-title {
        line-height: 45px;
        padding-left: 10px;
        font-size: 15px;
        border-bottom: 1px solid #f4f4f4;
      }

      .panel-body {
        display: flex;
        justify-content: space-around;

        .panel-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          font-size: 13px;
          padding: 10px 0;

          .icon {
            width: 35px;
            height: 35px;

          }
        }
      }
    }
  }

  //第三个面办美化
  .panel-list-item {
    height: 90px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    padding: 0 10px;
  }

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