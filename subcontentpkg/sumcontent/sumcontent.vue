<template>
  <view class="mainview">
    <ai-assistant />
    <app-search-bar :radius="15" background-color="#e60527" @click="goToSearch" />

    <navigator
      v-for="article in articles"
      :key="article._id"
      class="content-item"
      :url="getArticleUrl(article)"
    >
      <image class="content-image" :src="getCoverImage(article)" mode="aspectFill" />
      <text class="content-text">{{ article.title }}</text>
    </navigator>

    <view v-if="!articles.length && !isLoading" class="empty-state">暂无文章内容</view>
  </view>
</template>

<script>
import AiAssistant from '@/components/ai-assistant/ai-assistant.vue'
import AppSearchBar from '@/components/app-search-bar/app-search-bar.vue'
import {
  COLLECTIONS,
  COLLECTION_FALLBACKS,
  CLOUD_FUNCTIONS,
  callCloudFunctionWithFallback,
  extractResultData,
  runCollectionWithFallback,
} from '@/utils/cloud'

export default {
  components: {
    AiAssistant,
    AppSearchBar,
  },
  data() {
    return {
      isLoading: false,
      hasMore: true,
      pageSize: 7,
      articles: [],
    }
  },
  onLoad() {
    this.loadMoreArticles()
  },
  onReachBottom() {
    if (this.isLoading || !this.hasMore) {
      return
    }

    this.loadMoreArticles()
  },
  methods: {
    goToSearch() {
      uni.navigateTo({
        url: '/subcontentpkg/search/search',
      })
    },
    getArticleUrl(article) {
      return `/subcontentpkg/hottopic/article0/article0?id=${article._id}`
    },
    getCoverImage(article) {
      if (Array.isArray(article.imagesrc) && article.imagesrc.length > 0) {
        return article.imagesrc[0]
      }

      return article.imagesrc || '/static/导航图标/图像.png'
    },
    async loadMoreArticles() {
      this.isLoading = true
      uni.showLoading({
        title: '加载中',
        mask: false,
      })

      try {
        let nextArticles = []

        try {
          const res = await callCloudFunctionWithFallback(
            [CLOUD_FUNCTIONS.GET_ARTICLE_LIST],
            {
              offset: this.articles.length,
              pageSize: this.pageSize,
            },
            {
              fallbackWhenEmpty: true,
            }
          )

          nextArticles = extractResultData(res) || []
        } catch (cloudError) {
          const db = wx.cloud.database()
          const res = await runCollectionWithFallback(
            [COLLECTIONS.ARTICLES, ...COLLECTION_FALLBACKS.ARTICLES],
            (collectionName) =>
              db
                .collection(collectionName)
                .field({
                  _id: true,
                  title: true,
                  author: true,
                  imagesrc: true,
                  pagesrc: true,
                  type: true,
                  handup: true,
                })
                .orderBy('_id', 'asc')
                .skip(this.articles.length)
                .limit(this.pageSize)
                .get()
          )

          nextArticles = res.data || []
          console.warn('文章列表云函数不可用，已回退数据库直连:', cloudError)
        }

        this.articles = [...this.articles, ...nextArticles]
        this.hasMore = nextArticles.length === this.pageSize

        if (!nextArticles.length) {
          uni.showToast({
            title: '已经到底了',
            icon: 'none',
          })
        }
      } catch (error) {
        console.error('文章列表加载失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
      } finally {
        this.isLoading = false
        uni.hideLoading()
      }
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
  padding: 60rpx 0;
  text-align: center;
  color: #888;
}
</style>
