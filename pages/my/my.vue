<template>
  <view >
	  <!-- ai组件 -->
<!-- 	 <aifunction></aifunction> -->
    <!-- 等登录成功组件 -->
    <my-userinfo   v-if="userInfo_tank"></my-userinfo>
    <!-- 登录失败组件 -->
    <my-login v-else></my-login>    
  </view>
</template>

<script>
  import {
    mapMutations,
    mapState
  } from 'vuex'
  export default {
    computed: {
      // 调用 mapState 方法，把 m_cart 模块中的 cart 数组映射到当前页面中，作为计算属性来使用
      // ...mapState('模块的名称', ['要映射的数据名称1', '要映射的数据名称2'])
      ...mapState('m_user', ['userid','loginTank']),

    },
    
    data() {
      return {
        userInfo_tank: false,//控制页面两个组件的的
        isLoaded: false, // 控制页面是否显示
      };
    },
    onLoad() {
      this.closeTankF();
      console.log("logintank是",this.loginTank);
    },
    methods: {
      // 把 m_user 模块中的  updateuserInfo_tank 方法映射到当前页面使用
      ...mapMutations('m_user', ['updateTank']),
      //查看数据库中是否有用户数据 
      getuser() {
        return new Promise((resolve, reject) => {
          wx.cloud.callFunction({
            name: 'getuser',
            data: {
              id: this.userid,
            },
            success: res => {
              console.log('my页面的getuser云函数获取的用户信息是', res);
              resolve(res); // 成功时，解析结果              
            },
            fail: err => {
              console.log('my页面的getuser获取用户的信息失败', err);
              console.log('my页面的getuser失败啦');
              // 创建一个空的结果对象
              const emptyRes = {
                result: {
                  data: []
                }
              };
              resolve(emptyRes); // 失败时，也解析结果，但结果为空
            }
          });
        });
      },
      //根据getuser是否有用户数据来控制是登录页面还是用户页面
      async closeTankF() {
        console.log("my页面的的closeTank被使用了哦");
        if (!this.userInfo_tank) {
          try {
            const res = await this.getuser(); // 等待getuser方法完成
            if (!res || res.result.data.length === 0) {
              console.log('my页面没找到用户哦222');
              this.userInfo_tank = false;
            } else {
              console.log("找到 用户了");
              this.userInfo_tank = true;
              this.updateTank(true);
              console.log(this.Tank);
            }
          } catch (err) {
            console.log('my页面没找到用户哦');
            console.log(err);
          }
        } else {
          // 其他逻辑
          console.log("my页面closetank默认是true已经设置为false了");
          this.userInfo_tank = false;
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