<template>
  <view class="mainview">
    <ai-assistant />
    <app-search-bar :radius="15" background-color="#e60527" @click="goToSearch" />

    <navigator
      v-for="article in favoriteArticles"
      :key="article.id"
      class="content-item"
      :url="getArticleUrl(article)"
    >
      <image class="content-image" :src="getCoverImage(article)" mode="aspectFill" />
      <text class="content-text">{{ article.title }}</text>
    </navigator>

    <view v-if="!favoriteArticles.length" class="empty-state">还没有收藏的文章</view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import AiAssistant from '@/components/ai-assistant/ai-assistant.vue'
import AppSearchBar from '@/components/app-search-bar/app-search-bar.vue'

export default {
  components: {
    AiAssistant,
    AppSearchBar,
  },
  computed: {
    ...mapState('m_article', ['favoriteArticles']),
  },
  methods: {
    goToSearch() {
      uni.navigateTo({
        url: '/subcontentpkg/search/search',
      })
    },
    getArticleUrl(article) {
      return `/subcontentpkg/hottopic/article0/article0?id=${article.id}`
    },
    getCoverImage(article) {
      if (Array.isArray(article.imagesrc) && article.imagesrc.length > 0) {
        return article.imagesrc[0]
      }

      return article.imagesrc || '/static/导航图/图像.png'
    },
  },
}
</script>

<style>
.content {
  padding: 20rpx;
  border: 2px solid ghostwhite;
}

.content-image {
  width: 200rpx;
  height: 200rpx;
  min-width: 200rpx;
  min-height: 200rpx;
  margin-right: 10rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.content-item {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 2rpx;
  padding: 10rpx;
  border: 1px solid ghostwhite;
  border-radius: 5rpx;
}

.content-text {
  margin-top: 0rpx;
  margin-left: 0rpx;
  font-size: 30rpx;
  font-weight: 500;
  flex: 1;
}

.empty-state {
  padding: 80rpx 0;
  text-align: center;
  color: #888;
}
</style>
