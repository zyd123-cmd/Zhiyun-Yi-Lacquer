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
      <image class="content-image" :src="getCoverImage(article)" mode="aspectFill" lazy-load />
      <text class="content-text">{{ article.title }}</text>
    </navigator>

    <view v-if="!favoriteArticles.length" class="empty-state">还没有收藏的文章</view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import AiAssistant from '@/components/ai-assistant/ai-assistant.vue'
import AppSearchBar from '@/components/app-search-bar/app-search-bar.vue'
import { getArticleCoverImage, getArticleDetailUrl } from '@/utils/article-service'

const FAVORITE_ARTICLE_FALLBACK_IMAGE = '/static/logo.png'

export default {
  components: {
    AiAssistant,
    AppSearchBar,
  },
  computed: {
    ...mapState('m_article', ['favoriteArticles']),
  },
  methods: {
    // 中文注释：统一跳转到搜索页，避免收藏页维护独立的搜索入口逻辑。
    goToSearch() {
      console.log('收藏页：准备跳转到搜索页面')
      uni.navigateTo({
        url: '/subcontentpkg/search/search',
      })
    },
    // 中文注释：统一生成收藏文章的详情页地址，直接复用文章服务层逻辑。
    getArticleUrl(article) {
      return getArticleDetailUrl(article)
    },
    // 中文注释：统一解析收藏文章封面图，并在缺图时回退到默认图。
    getCoverImage(article) {
      return getArticleCoverImage(article, FAVORITE_ARTICLE_FALLBACK_IMAGE)
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
