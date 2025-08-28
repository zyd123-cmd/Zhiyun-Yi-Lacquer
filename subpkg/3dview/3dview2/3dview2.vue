<template>
  <view style="display: flex; flex-direction: column;">
	  <!-- ai组件 -->
	 <aifunction></aifunction>
    <xr-start id="main-frame" disable-scroll 
        :url="url" 
        :width="renderWidth" 
        :height="renderHeight"
        :style="'width:'+width+'px;height:'+height+'px;'"
        :scale="'10 10 10'"
        :position="'0 0 0'"
        
    >
    <!--  :position  x模型距离选 y模型上下旋转  z -->
    </xr-start>

  </view>
</template>

<script>
  export default {
    data() {
      return {
        url: "cloud://zhiyunyiqi-6gubyp7bd3a2e4ff.7a68-zhiyunyiqi-6gubyp7bd3a2e4ff-1327529386/3D建模/木钵/木钵.glb",
        width: 300,
        height: 300,
        renderWidth: 300,
        renderHeight: 300,
    
      };
    },

    onLoad(option) {
      uni.showLoading({
        title: '模型加载中...'
      });
      this.width = uni.getWindowInfo().windowWidth;
      this.height = uni.getWindowInfo().windowHeight;
      const dpi = uni.getWindowInfo().pixelRatio;
      this.renderWidth = this.width * dpi;
      this.renderHeight = this.height * dpi;
    },

    methods: {
      handleReady() {
        uni.hideLoading();
      },
      handleGLTFLoaded() {
        console.log('模型加载完成');
      },
    },
  };
</script>

<style>
  page {
    background-color: #303030;
    background-repeat: no-repeat;
    background-size: 100%;
    background-image: url("https://mmbiz.qpic.cn/mmbiz_jpg/DWsjgNA1bNhdC11VLBgx2BWNTPV9IpOibepzbDy76xTme7ByunTCCPnafo2Y4I6hWz1PMlQxaSib6pmXu8C0IO5A/640?wx_fmt=jpeg&from=appmsg");
  }
</style>