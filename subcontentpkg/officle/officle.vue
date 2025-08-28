<template>
	
  <view class="mainview">
	  <!-- ai组件 -->
	<!--  <aifunction></aifunction> -->
    <!-- 使用自定义的搜索组件 -->
    <my-search :radius="15" :bgcolor="'#e60527'" @click="gotoSearch"></my-search>
    <!-- 内容 -->
    <navigator class="content-item" v-for="(item,index) in announcement" :key="index" :url="item.pagesrc">
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
        announcement: [{
            imagesrc: "/static/导航图/3D展示.png",
            title: "彝族漆器3D模型在线展示功能上线。",
            pagesrc: "/subpkg/3djs/3djs"
          },
          {
            imagesrc: "/static/导航图/AR识别.png",
            title: "彝族漆器3D模型AR平面识别功能上线，为获最佳体验，请在开放、光线充足的场所操作。",
            pagesrc: "/subpkg/arsum/arsum"
          },
        ]
      }
    },


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