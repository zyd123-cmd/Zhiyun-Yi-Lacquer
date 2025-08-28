<template>
  <view v-if="isload" >
	  <!-- ai组件 -->
	 <aifunction></aifunction>
    <view style="width: 100%;">
      <image style="width: 100%;" mode="widthFix" :src="titleimage" > </image>
    </view>
    <view class="navigator-container">
      <navigator class="navigator-item" v-for="(item, index) in items" :key="index" :url="item.pagesrc">
        <view class="navigator-content">
          <image class="navigator-image" :src="item.image"></image>
          <text class="navigator-text">{{ item.name }}</text>
        </view>
      </navigator>
    </view>
  </view>
</template>

<script>
  export default {

    data() {
      return {
        titleimage: "cloud://zhiyunyiqi-6gubyp7bd3a2e4ff.7a68-zhiyunyiqi-6gubyp7bd3a2e4ff-1327529386/首页轮播图/轮播图0.jpg",
        // 假设有一个items数组，每个对象包含navigator的url、图片地址和文本
        items: [],
        isload:false,
      }
    },
    onLoad() {
      this.getdata();
    },
    methods: {

      getdata() {
        uni.showLoading({
          title: '模型加载中...'
        });
        wx.cloud.callFunction({
          name: "get3d",
        }).then(res => {
          console.log(res.result.data);
          this.items = res.result.data;
          uni.hideLoading();
          this.isload=true;
        })
      },
    },
  }
</script>

<style>
  .navigator-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 10rpx;
    /* 添加一些内边距 */
  }

  .navigator-item {
    flex: 0 1 calc(50% - 20rpx);
    /* 每个navigator占一半宽度减去一些间距 */
    margin: 10rpx;
    /* 增加外边距 */
    height: 300rpx;
    /* 设置固定高度 */
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    /* 添加阴影效果 */
    transition: transform 0.3s ease;
    /* 添加过渡效果 */
  }

  .navigator-item:hover {
    transform: translateY(-5rpx);
    /* 鼠标悬停时向下移动 */
  }

  .navigator-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    /* 添加半透明背景 */
    border-radius: 10rpx;
    /* 添加圆角 */
  
  }

  .navigator-image {
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
    /* 添加圆角 */
    object-fit: cover;
    /* 保持图片比例并填充容器 */
  }

  .navigator-text {
    margin-top: 10rpx;
    text-align: center;
    font-size: 28rpx;
    /* 调整字体大小 */
    color: #333;
    /* 调整字体颜色 */
    font-weight: bold;
    /* 加粗字体 */
  }
</style>