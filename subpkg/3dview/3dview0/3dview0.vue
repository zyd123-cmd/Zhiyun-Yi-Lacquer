<template>
	<view style="display: flex; flex-direction: column;">
	  <!-- ai组件 -->
	  <aifunction></aifunction>
	  <xr-start
	    v-if="url"
	    id="main-frame"
	    disable-scroll
	    :url="url"
	    :width="renderWidth"
	    :height="renderHeight"
	    :style="'width:'+width+'px;height:'+height+'px;'"
	    :scale="scale3d"
	    :position="position3d"
	  >
	    <!--  :position  x模型距离选 y模型上下旋转  z -->
	  </xr-start>
	</view>
</template>

<script>
  export default {
    data() {
      return {
        // 默认 3D 模型 URL，后续会被数据库中的 modelUrl 覆盖
        url: "",
        // 默认 3D 模型缩放和位置，后续会被数据库中的 scale3d / position3d 覆盖
        // 这里不再给固定默认值，全部依赖数据库字段
        scale3d: '',
        position3d: '',

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
      // 根据传入的 id 从 3dview 集合加载模型配置
      if (option && option.id) {
        this.loadModelData(option.id);
      } else {
        // 没有传 id 时，直接关闭加载提示，使用默认配置
        uni.hideLoading();
      }
    },

    methods: {
      loadModelData(id) {
        const db = wx.cloud.database();
        db.collection('3dview').doc(id).get().then(res => {
          const data = res.data || {};
          if (data.modelUrl) {
            this.url = data.modelUrl;
          }
          if (data.scale3d) {
            this.scale3d = data.scale3d;
          }
          if (data.position3d) {
            this.position3d = data.position3d;
          }
        }).catch(err => {
          console.error('加载3D模型数据失败', err);
          uni.hideLoading();
          uni.showToast({
            title: '模型加载失败',
            icon: 'none',
            duration: 1500,
          });
        });
      },
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