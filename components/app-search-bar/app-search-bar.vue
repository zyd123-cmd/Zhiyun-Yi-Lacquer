<template>
  <view class="search-bar" :style="containerStyle" @click="handleClick">
    <view class="search-bar__box" :style="boxStyle">
      <image class="search-bar__icon" src="/static/导航图/搜索.png" />
      <text class="search-bar__placeholder">搜索</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AppSearchBar',
  props: {
    backgroundColor: {
      type: String,
      default: '#C00000',
    },
    radius: {
      type: Number,
      default: 18,
    },
  },
  computed: {
    containerStyle() {
      return {
        backgroundColor: this.backgroundColor,
      }
    },
    boxStyle() {
      return {
        borderRadius: `${this.radius}px`,
      }
    },
  },
  methods: {
    handleClick() {
      this.$emit('click')
    },
  },
}
</script>

<style lang="scss">
.search-bar {
  height: 50px;
  padding: 0 10px;
  display: flex;
  align-items: center;
}

.search-bar__box {
  height: 36px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.search-bar__placeholder {
  margin-left: 5px;
  font-size: 15px;
  color: #cdcdcd;
}

.search-bar__icon {
  width: 40rpx;
  height: 40rpx;
}
</style>
