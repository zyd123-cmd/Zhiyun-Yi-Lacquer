<template>
  <view class="mainview">
    <app-search-bar :radius="15" background-color="#e60527" @click="goToSearch" />

    <navigator
      v-for="article in officialArticles"
      :key="article._id"
      class="content-item"
      :url="getArticleUrl(article)"
    >
      <image class="content-image" :src="getCoverImage(article)" mode="aspectFill" />
      <text class="content-text">{{ article.title }}</text>
    </navigator>
  </view>
</template>

<script>
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
    AppSearchBar,
  },
  data() {
    return {
      officialArticles: [],
    }
  },
  onLoad() {
    this.loadOfficialArticles()
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

      return article.imagesrc || '/static/导航图/图像.png'
    },
    async loadOfficialArticles() {
      try {
        try {
          const res = await callCloudFunctionWithFallback(
            [CLOUD_FUNCTIONS.GET_ARTICLE_LIST],
            {
              offset: 0,
              pageSize: 100,
              type: 'index4',
            },
            {
              fallbackWhenEmpty: true,
            }
          )

          this.officialArticles = extractResultData(res) || []
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
                  imagesrc: true,
                  pagesrc: true,
                })
                .where({
                  type: 'index4',
                })
                .orderBy('_id', 'asc')
                .get()
          )

          this.officialArticles = res.data || []
          console.warn('官方动态云函数不可用，已回退数据库直连:', cloudError)
        }
      } catch (error) {
        console.error('官方动态加载失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none',
        })
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
</style>
