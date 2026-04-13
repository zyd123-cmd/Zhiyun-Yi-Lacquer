<template>
  <view class="mainview">
    <app-search-bar :radius="15" background-color="#e60527" @click="goToSearch" />

    <navigator
      v-for="article in officialArticles"
      :key="article._id"
      class="content-item"
      :url="getArticleUrl(article)"
    >
      <image class="content-image" :src="getCoverImage(article)" mode="aspectFill" lazy-load />
      <text class="content-text">{{ article.title }}</text>
    </navigator>

    <view v-if="!officialArticles.length && !isLoading" class="empty-state">暂无官方动态</view>
  </view>
</template>

<script>
import AppSearchBar from '@/components/app-search-bar/app-search-bar.vue'
import {
  fetchArticleList,
  getArticleCoverImage,
  getArticleDetailUrl,
  mergeArticleList,
} from '@/utils/article-service'

const OFFICIAL_ARTICLE_FALLBACK_IMAGE = '/static/logo.png'

export default {
  components: {
    AppSearchBar,
  },
  data() {
    return {
      officialArticles: [],
      isLoading: false,
      hasMore: true,
      pageSize: 10,
      nextCursor: '',
    }
  },
  onLoad() {
    console.log('官方动态页：页面加载完成，准备加载首屏官方动态')
    this.loadOfficialArticles()
  },
  onReachBottom() {
    console.log('官方动态页：检测到底部触发事件，准备尝试加载更多官方动态')

    if (this.isLoading || !this.hasMore) {
      console.log('官方动态页：当前不满足继续翻页条件，终止本次加载', {
        isLoading: this.isLoading,
        hasMore: this.hasMore,
      })
      return
    }

    this.loadOfficialArticles()
  },
  methods: {
    // 中文注释：统一跳转到搜索页，避免官方动态页维护独立的搜索入口逻辑。
    goToSearch() {
      console.log('官方动态页：准备跳转到搜索页面')
      uni.navigateTo({
        url: '/subcontentpkg/search/search',
      })
    },
    // 中文注释：统一生成文章详情跳转地址，复用文章服务层的路由拼接逻辑。
    getArticleUrl(article) {
      return getArticleDetailUrl(article)
    },
    // 中文注释：统一解析官方动态封面图，并在缺图时回退到默认图。
    getCoverImage(article) {
      return getArticleCoverImage(article, OFFICIAL_ARTICLE_FALLBACK_IMAGE)
    },
    // 中文注释：统一按游标分页加载官方动态，减少首屏一次性读取过多文章带来的卡顿。
    async loadOfficialArticles() {
      console.log('官方动态页：开始加载官方动态列表', {
        currentLength: this.officialArticles.length,
        pageSize: this.pageSize,
        nextCursor: this.nextCursor,
      })

      if (this.isLoading) {
        console.log('官方动态页：当前已有官方动态加载任务在执行，终止本次重复请求')
        return
      }

      this.isLoading = true
      const shouldShowLoading = this.officialArticles.length === 0

      if (shouldShowLoading) {
        uni.showLoading({
          title: '加载中',
          mask: false,
        })
      }

      try {
        const pageData = await fetchArticleList({
          type: 'index4',
          pageSize: this.pageSize,
          cursor: this.nextCursor,
        })
        const nextArticleList = Array.isArray(pageData.list) ? pageData.list : []
        this.officialArticles = mergeArticleList(this.officialArticles, nextArticleList)
        this.nextCursor = pageData.nextCursor || ''
        this.hasMore = Boolean(pageData.hasMore)

        console.log('官方动态页：官方动态列表加载完成', {
          appendedCount: nextArticleList.length,
          totalCount: this.officialArticles.length,
          nextCursor: this.nextCursor,
          hasMore: this.hasMore,
        })

        if (!nextArticleList.length && this.officialArticles.length > 0) {
          uni.showToast({
            title: '已经到底了',
            icon: 'none',
          })
        }
      } catch (error) {
        console.error('官方动态页：官方动态加载失败', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
      } finally {
        if (shouldShowLoading) {
          uni.hideLoading()
        }

        this.isLoading = false
        console.log('官方动态页：官方动态分页加载流程结束')
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
