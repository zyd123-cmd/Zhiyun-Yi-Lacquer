<template>
  <view class="mainview">
	  <!-- ai组件 -->
	 <aifunction></aifunction>
    <!-- 使用自定义的搜索组件 -->
    <my-search :radius="15" :bgcolor="'#e60527'" @click="gotoSearch"></my-search>
    <!-- 内容 -->
    <navigator class="content-item" v-for="(item,index) in sumcontent" :key="index" :url="item.pagesrc">
      <image class="content-image" :src="item.imagesrc" mode="aspectFill">
      </image>
      <text class="content-text">{{item.title}}</text>
    </navigator>

  </view>
</template>

<script>
  export default {
    data() {
      return {
        // 是否正在请求数据
        isloading: false,
        sumcontent: [],
      }
    },

    onLoad() {
      // 调用getcontent方法，而不是在这里定义它
      this.getcontent();
    },
    // 触底的事件
    onReachBottom() {
      if (this.isloading) {
        this.getcontent();
      console.log('触底事件触发，获取新数据');
      }
      else{
        console.log('正在请求数据，请勿重复请求');
      }
    },
    methods: {
      gotoSearch() {
        uni.navigateTo({
          url: '/subcontentpkg/search/search'
        })
      },
      getcontent(){
        uni.showLoading({
          title: "加载中",
          mask: false,
        })
        wx.cloud.callFunction({
          name: "getmaincontent",
          data: {
            listlength: this.sumcontent.length,
          }
        }).then(res => {
          if (res.result.data.length > 0) {
            this.sumcontent = this.sumcontent.concat(res.result.data); // 将新获取的数据添加到list的末尾
            this.isloading = true;
            uni.hideLoading();
            console.log("getmaincontent加载完毕", this.sumcontent);
          } else {
            uni.hideLoading();
            uni.showToast({
              title: "到底啦！",
              duration: 500,
            })
           this.isloading = true;
            console.log("getfrienduser所有数据加载完成");
          }
          console.log('获取的动态信息是', res);
        });
      }, 


    }
  }
</script>

<style>
  /* 内容样式 */
  .content {
    padding: 20rpx;
    border: 2px solid ghostwhite;
    /* 添加黑色边框 */

  }

  .content-item {
    margin-bottom: 2rpx;
  }

  .content-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 20rpx;
    margin-right: 10rpx;
    /* 添加图片和文字之间的间距 */
    /* 新增以下样式确保图片不会被挤压变形 */
    min-width: 200rpx;
    min-height: 200rpx;
    flex-shrink: 0;
    /* 防止图片在flex容器缩放时被挤压 */
  }

  .content-item {
    display: flex;
    /* 使用 Flexbox 布局 */
    align-items: flex-start;
    /* 将align-items设置为flex-start，防止文字挤压图片 */
    border: 1px solid ghostwhite;
    /* 添加灰色边框 */
    padding: 10rpx;
    /* 添加一些内边距 */
    border-radius: 5rpx;
    /* 如果需要，添加圆角 */
    /* 可以考虑设置flex-wrap: wrap; 来处理文字过多的情况 */
    flex-wrap: wrap;
  }

  /* 确保.content-text在flex容器中可以灵活布局 */
  .content-text {
    font-weight: 500;
    /* 加粗文字 */
    font-size: 30rpx;
    margin-top: 0rpx;
    margin-left: 0rpx;
    /* 调整左边距 */
    flex: 1;
    /* 允许text扩展以填满可用空间 */
  }
</style>