<template>
  <view v-if="isLoaded">
    <ai-assistant />
    <view class="hero-image">
      <image class="hero-image__img" mode="widthFix" :src="heroImage" />
    </view>
    <view class="navigator-container">
      <navigator
        v-for="item in items"
        :key="item._id"
        class="navigator-item"
        :url="getArUrl(item)"
      >
        <view class="navigator-content">
          <image class="navigator-image" :src="item.image" />
          <text class="navigator-text">{{ item.name }}</text>
        </view>
      </navigator>
    </view>
  </view>
</template>

<script>
import AiAssistant from '@/components/ai-assistant/ai-assistant.vue'
import { COLLECTIONS, COLLECTION_FALLBACKS, runCollectionWithFallback } from '@/utils/cloud'

export default {
  components: {
    AiAssistant,
  },
  data() {
    return {
      heroImage:
        'cloud://cloud1-5gprp4v6c761393f.636c-cloud1-5gprp4v6c761393f-1327529386/swiper/1.jpeg',
      items: [],
      isLoaded: false,
    }
  },
  onLoad() {
    this.loadModels()
  },
  methods: {
    async loadModels() {
      uni.showLoading({
        title: '模型加载中',
      })

      try {
        const db = wx.cloud.database()
        const res = await runCollectionWithFallback(
          [COLLECTIONS.ARTIFACT_MODELS, ...COLLECTION_FALLBACKS.ARTIFACT_MODELS],
          (collectionName) =>
            db
              .collection(collectionName)
              .orderBy('order', 'asc')
              .get()
        )

        this.items = res.data || []
        this.isLoaded = true
      } catch (error) {
        console.error('加载模型列表失败:', error)
        uni.showToast({
          title: '模型加载失败',
          icon: 'none',
        })
      } finally {
        uni.hideLoading()
      }
    },
    getArUrl(item) {
      const pagePath = item.arpagesrc || '/subpkg/arview/arview0/arview0'
      return `${pagePath}?id=${item._id}`
    },
  },
}
</script>

<style>
.navigator-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 10rpx;
  background-color: #dfd0bb;
}

.hero-image {
  width: 100%;
}

.hero-image__img {
  width: 100%;
}

.navigator-item {
  box-sizing: border-box;
  flex: 0 0 calc(50% - 20rpx);
  height: 300rpx;
  margin: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.navigator-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: 10rpx;
}

.navigator-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10rpx;
}

.navigator-text {
  margin-top: 10rpx;
  color: #333;
  font-size: 28rpx;
  font-weight: bold;
  text-align: center;
}
</style>
