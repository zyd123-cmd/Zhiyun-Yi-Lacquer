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
      <image class="content-image" :src="getCoverImage(article)" mode="aspectFill" lazy-load />
      <text class="content-text">{{ article.title }}</text>
    </navigator>

    <view v-if="!articles.length && !isLoading" class="empty-state">暂无文章内容</view>
  </view>
</template>

<script>
import AiAssistant from '@/components/ai-assistant/ai-assistant.vue'
import AppSearchBar from '@/components/app-search-bar/app-search-bar.vue'
import {
  fetchArticleList,
  getArticleCoverImage,
  getArticleDetailUrl,
  mergeArticleList,
} from '@/utils/article-service'

const ARTICLE_FALLBACK_IMAGE = '/static/logo.png'

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
      nextCursor: '',
      articles: [],
    }
  },
  onLoad() {
    console.log('文章列表页：页面加载完成，准备加载首屏文章')
    this.loadMoreArticles()
  },
  onReachBottom() {
    console.log('文章列表页：检测到底部触发事件，准备尝试加载下一页文章')

    if (this.isLoading || !this.hasMore) {
      console.log('文章列表页：当前不满足继续翻页条件，终止本次加载', {
        isLoading: this.isLoading,
        hasMore: this.hasMore,
      })
      return
    }

    this.loadMoreArticles()
  },
  methods: {
    // 中文注释：统一跳转到搜索页，避免文章列表页维护独立的搜索入口逻辑。
    goToSearch() {
      console.log('文章列表页：准备跳转到搜索页面')
      uni.navigateTo({
        url: '/subcontentpkg/search/search',
      })
    },
    // 中文注释：统一生成文章详情跳转地址，复用文章服务层的地址拼接能力。
    getArticleUrl(article) {
      return getArticleDetailUrl(article)
    },
    // 中文注释：统一解析文章封面图，并在缺图时回退到本地默认图。
    getCoverImage(article) {
      return getArticleCoverImage(article, ARTICLE_FALLBACK_IMAGE)
    },
    // 中文注释：统一按游标分页加载文章列表，避免继续使用 skip 导致越翻越慢。
    async loadMoreArticles() {
      console.log('文章列表页：开始加载下一页文章', {
        currentLength: this.articles.length,
        pageSize: this.pageSize,
        nextCursor: this.nextCursor,
      })

      if (this.isLoading) {
        console.log('文章列表页：当前已有文章加载任务在执行，终止本次重复请求')
        return
      }

      this.isLoading = true
      const shouldShowLoading = this.articles.length === 0

      if (shouldShowLoading) {
        uni.showLoading({
          title: '加载中',
          mask: false,
        })
      }

      try {
        const pageData = await fetchArticleList({
          pageSize: this.pageSize,
          cursor: this.nextCursor,
          offset: this.articles.length,
        })
        const nextArticleList = Array.isArray(pageData.list) ? pageData.list : []
        this.articles = mergeArticleList(this.articles, nextArticleList)
        this.nextCursor = pageData.nextCursor || ''
        this.hasMore = Boolean(pageData.hasMore)

        console.log('文章列表页：下一页文章加载完成', {
          appendedCount: nextArticleList.length,
          totalCount: this.articles.length,
          nextCursor: this.nextCursor,
          hasMore: this.hasMore,
        })

        if (!nextArticleList.length && this.articles.length > 0) {
          uni.showToast({
            title: '已经到底了',
            icon: 'none',
          })
        }
      } catch (error) {
        console.error('文章列表页：文章列表加载失败', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
      } finally {
        if (shouldShowLoading) {
          uni.hideLoading()
        }

        this.isLoading = false
        console.log('文章列表页：文章列表分页加载流程结束')
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
