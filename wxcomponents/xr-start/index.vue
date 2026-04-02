<template>
  <uni-shadow-root class="xr-start-index">
    <xr-scene class="xr-scene" render-system="alpha:true" @ready="handleReady">
      <xr-assets>
        <xr-asset-load
          type="gltf"
          asset-id="gltf-model"
          :src="url"
          options="ignoreError:-1"
        ></xr-asset-load>
      </xr-assets>

      <xr-node>
        <xr-gltf
          node-id="gltf-model"
          model="gltf-model"
          :scale="scale"
          :position="position"
          material="color: 0 0 0; metallic: 0.8; roughness: 01; transmission: 0.1;"
          uniforms="u_baseColorFactor:0.2 0.4 0.6 1,u_metallicRoughnessValues: 1 1"
          @gltf-loaded="handleGLTFLoaded"
        ></xr-gltf>
      </xr-node>

      <xr-light type="ambient" color="1 1 1" intensity="2"></xr-light>
      <xr-light
        type="directional"
        rotation="40 70 0"
        color="1 1 1"
        intensity="2"
        cast-shadow
      ></xr-light>
      <xr-light
        type="point"
        color="1 1 1"
        intensity="1"
        position="1 2 3"
        range="10"
        cast-shadow
      ></xr-light>

      <xr-camera
        id="camera"
        clear-color="0 0 0 0"
        position="1 1 2"
        target="gltf-model"
        camera-orbit-control
      ></xr-camera>
    </xr-scene>
  </uni-shadow-root>
</template>

<script>
global.__wxVueOptions = { components: {} }
global.__wxRoute = 'xr-start/index'

Component({
  properties: {
    url: {
      type: String,
      value: '',
    },
    scale: {
      type: String,
      value: ' ',
    },
    position: {
      type: String,
      value: ' ',
    },
  },
  data: {},
  methods: {
    handleReady() {
      console.log('xr scene ready')
    },
    handleGLTFLoaded() {
      console.log('模型加载完成')
      wx.hideLoading()
      this.triggerEvent('loaded')
    },
  },
})

export default global.__wxComponents['xr-start/index']
</script>

<style platform="mp-weixin">
.xr-scene {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
