<template>
  <view style="display: flex; flex-direction: column;">
    <custom v-if="url" class="custon" :title="title" :url="url" :scale="scale"></custom>
  </view>
</template>

<script>
import { COLLECTIONS, COLLECTION_FALLBACKS, runCollectionWithFallback } from '@/utils/cloud'

export default {
  data() {
    return {
      url: '',
      title: '',
      scale: '',
    }
  },
  onLoad(option) {
    uni.showLoading({
      title: 'AR 模型加载中',
      mask: true,
    })

    if (option && option.id) {
      this.loadArData(option.id)
      return
    }

    uni.hideLoading()
  },
  methods: {
    async loadArData(id) {
      try {
        const db = wx.cloud.database()
        const res = await runCollectionWithFallback(
          [COLLECTIONS.ARTIFACT_MODELS, ...COLLECTION_FALLBACKS.ARTIFACT_MODELS],
          (collectionName) => db.collection(collectionName).doc(id).get()
        )
        const data = res.data || {}

        this.url = data.modelUrl || ''
        this.title = data.titleAR || ''
        this.scale = data.scaleAR || ''
      } catch (error) {
        console.error('加载 AR 模型数据失败:', error)
        uni.showToast({
          title: 'AR 模型加载失败',
          icon: 'none',
        })
      } finally {
        uni.hideLoading()
      }
    },
  },
}
</script>

<style>
page {
}
</style>
