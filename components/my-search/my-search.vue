<template>
<view class="my-search-container" :style="{'background-color': bgcolor}" @click="searchBoxHandler">
  <view class="my-search-box" :style="{'border-radius': radius + 'px'}">
     <image class="nav-item-image" src="/static/导航图/搜索.png" ></image>
    <text class="placeholder">搜索</text>
  </view>
</view>
</template>

<script>
  export default {
  props: {
    // 背景颜色
    bgcolor: {
      type: String,
      default: '#C00000'
    },
    // 圆角尺寸
    radius: {
      type: Number,
      // 单位是 px
      default: 18
    }
  },  
    name:"my-serach",
    data() {
      return {
    
      };
    },
methods: {
    searchBoxHandler() {
          // 触发外界通过 @click 绑定的 click 事件处理函数
          this.$emit('click')
        },
    }

  }
</script>

<style lang="scss">
.my-search-container {
  // background-color: #e60527;
  height: 50px;
  padding: 0 10px;
  display: flex;
  align-items: center;
}

.my-search-box {
  height: 36px;
  background-color: #ffffff;
  // border-radius: 15px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .placeholder {
    font-size: 15px;
    margin-left: 5px;
    color: #cdcdcd;
  }
  .nav-item-image{
    width: 40rpx;
    height: 40rpx;
  }
}
</style>