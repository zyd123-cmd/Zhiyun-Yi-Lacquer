<template>
  <view class="model-page">
    <view class="model-shell">
      <xr-start
        v-if="url"
        id="main-frame"
        class="model-frame"
        disable-scroll
        :url="url"
        :width="renderWidth"
        :height="renderHeight"
        :style="frameStyle"
        :scale="scale3d"
        :position="position3d"
        @loaded="handleModelLoaded"
      />
    </view>

    <ai-assistant />
  </view>
</template>

<script>
import AiAssistant from '@/components/ai-assistant/ai-assistant.vue'
import { COLLECTIONS, COLLECTION_FALLBACKS, runCollectionWithFallback } from '@/utils/cloud'

export default {
  components: {
    AiAssistant,
  },
  computed: {
    frameStyle() {
      return `width:${this.width}px;height:${this.height}px;`
    },
  },
  data() {
    return {
      url: '',
      scale3d: '',
      position3d: '',
      width: 300,
      height: 300,
      renderWidth: 300,
      renderHeight: 300,
      isModelLoading: true,
      hasShownLoading: false,
      loadingTimer: null,
    }
  },
  onLoad(option) {
    this.showNativeLoading()

    const windowInfo = uni.getWindowInfo()
    this.width = windowInfo.windowWidth
    this.height = windowInfo.windowHeight
    this.renderWidth = this.width * windowInfo.pixelRatio
    this.renderHeight = this.height * windowInfo.pixelRatio

    if (option && option.id) {
      this.loadModelData(option.id)
      return
    }

    this.isModelLoading = false
    this.hideNativeLoading()
  },
  onUnload() {
    this.clearLoadingTimer()
    this.hideNativeLoading()
  },
  methods: {
    showNativeLoading() {
      if (this.hasShownLoading) {
        return
      }

      this.hasShownLoading = true
      uni.showLoading({
        title: '模型加载中...',
        mask: true,
      })
    },
    hideNativeLoading() {
      if (!this.hasShownLoading) {
        return
      }

      this.hasShownLoading = false
      uni.hideLoading()
    },
    clearLoadingTimer() {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer)
        this.loadingTimer = null
      }
    },
    startLoadingGuard() {
      this.clearLoadingTimer()
      this.loadingTimer = setTimeout(() => {
        this.isModelLoading = false
        this.hideNativeLoading()
      }, 15000)
    },
    handleModelLoaded() {
      this.clearLoadingTimer()
      this.isModelLoading = false
      this.hideNativeLoading()
    },
    async loadModelData(id) {
      this.isModelLoading = true
      this.showNativeLoading()
      this.startLoadingGuard()

      try {
        const db = wx.cloud.database()
        const res = await runCollectionWithFallback(
          [COLLECTIONS.ARTIFACT_MODELS, ...COLLECTION_FALLBACKS.ARTIFACT_MODELS],
          (collectionName) => db.collection(collectionName).doc(id).get()
        )
        const data = res.data || {}

        this.url = data.modelUrl || ''
        this.scale3d = data.scale3d || ''
        this.position3d = data.position3d || ''
      } catch (error) {
        this.clearLoadingTimer()
        this.isModelLoading = false
        this.hideNativeLoading()
        console.error('加载 3D 模型数据失败:', error)
        uni.showToast({
          title: '模型加载失败',
          icon: 'none',
        })
      }
    },
  },
}
</script>

<style>
page {
  background-color: #303030;
  background-repeat: no-repeat;
  background-size: 100%;
  background-image: url("https://mmbiz.qpic.cn/mmbiz_jpg/DWsjgNA1bNhdC11VLBgx2BWNTPV9IpOibepzbDy76xTme7ByunTCCPnafo2Y4I6hWz1PMlQxaSib6pmXu8C0IO5A/640?wx_fmt=jpeg&from=appmsg");
}

.model-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.model-shell {
  display: flex;
  flex-direction: column;
}
</style>
