<template>
  <view v-if="isReady" class="home-page">
    <app-search-bar :radius="15" background-color="#e60527" @click="goToSearch" />

    <swiper
      v-if="swiperItems.length"
      class="banner"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="1000"
      :circular="true"
    >
      <swiper-item v-for="item in swiperItems" :key="item._id">
        <navigator class="banner-link" :url="resolveNavigatorUrl(item.pagesrc)">
          <image :src="item.imagesrc" class="swiper-item-image" mode="aspectFill" />
        </navigator>
      </swiper-item>
    </swiper>

    <view class="nav-list">
      <navigator
        v-for="item in navList"
        :key="item.text"
        class="nav-item"
        :url="resolveNavigatorUrl(item.pagesrc)"
      >
        <image class="nav-item-image" :src="item.imagesrc" mode="aspectFit" />
        <text class="nav-item-text">{{ item.text }}</text>
      </navigator>
    </view>

    <view class="scrollable-tabs">
      <scroll-view scroll-x class="scroll-view">
        <view
          v-for="(tab, index) in tabs"
          :key="tab.type"
          class="tab"
          :class="{ active: index === activeTab }"
          @click="activeTab = index"
        >
          <view class="tab-icon-text">
            <text class="tabtext">{{ tab.label }}</text>
            <image
              v-show="index === activeTab"
              src="/static/导航图/滑动条.png"
              class="tab-icon"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="content">
      <navigator
        v-for="article in currentArticles"
        :key="article._id"
        class="content-item"
        :url="getArticleUrl(article)"
      >
        <image class="content-image" :src="getCoverImage(article)" mode="aspectFill" />
        <text class="content-text">{{ article.title }}</text>
      </navigator>

      <navigator class="moree" url="/subcontentpkg/sumcontent/sumcontent">
        <text class="more">查看更多</text>
      </navigator>
    </view>
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
      isReady: false,
      activeTab: 0,
      swiperItems: [],
      navList: [
        {
          pagesrc: '/subpkg/3djs/3djs',
          imagesrc: '/static/导航图/3D展示.png',
          text: '3D展示',
        },
        {
          pagesrc: '/subpkg/arsum/arsum',
          imagesrc: '/static/导航图/AR识别.png',
          text: 'AR识别',
        },
        {
          pagesrc: '/subcontentpkg/sumcontent/sumcontent',
          imagesrc: '/static/导航图/图像.png',
          text: '文章内容',
        },
        {
          pagesrc: '/subcontentpkg/officle/officle',
          imagesrc: '/static/导航图/官方动态 .png',
          text: '官方动态',
        },
      ],
      tabs: [
        { label: '热点话题', type: 'index1' },
        { label: '最新资讯', type: 'index2' },
        { label: '精品推荐', type: 'index3' },
        { label: '活动公告', type: 'index4' },
      ],
      articleGroups: {
        index1: [],
        index2: [],
        index3: [],
        index4: [],
      },
    }
  },
  computed: {
    currentArticles() {
      const currentTab = this.tabs[this.activeTab]
      return this.articleGroups[currentTab.type] || []
    },
  },
  onLoad() {
    this.loadHomeData()
  },
  methods: {
    goToSearch() {
      uni.navigateTo({
        url: '/subcontentpkg/search/search',
      })
    },
    resolveNavigatorUrl(url) {
      return url || '/pages/index/index'
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
    async loadSwiper() {
      const db = wx.cloud.database()
      const res = await db
        .collection(COLLECTIONS.SWIPER)
        .field({
          _id: true,
          imagesrc: true,
          pagesrc: true,
        })
        .orderBy('_id', 'asc')
        .get()

      this.swiperItems = res.data || []
    },
    async loadArticlesByType(type) {
      try {
        const res = await callCloudFunctionWithFallback(
          [CLOUD_FUNCTIONS.GET_ARTICLE_LIST],
          {
            offset: 0,
            pageSize: 3,
            type,
          },
          {
            fallbackWhenEmpty: true,
          }
        )

        this.$set(this.articleGroups, type, extractResultData(res) || [])
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
                type: true,
              })
              .where({ type })
              .orderBy('_id', 'asc')
              .limit(3)
              .get()
        )

        this.$set(this.articleGroups, type, res.data || [])
        console.warn('文章分类云函数不可用，已回退数据库直连:', cloudError)
      }
    },
    async loadHomeData() {
      uni.showLoading({
        title: '加载中',
        mask: true,
      })

      try {
        await Promise.all([
          this.loadSwiper(),
          ...this.tabs.map((tab) => this.loadArticlesByType(tab.type)),
        ])
        this.isReady = true
      } catch (error) {
        console.error('首页数据加载失败:', error)
        uni.showToast({
          title: '首页加载失败',
          icon: 'none',
        })
      } finally {
        uni.hideLoading()
      }
    },
  },
}
</script>

<style scoped>
.banner {
  width: 100%;
  height: 400rpx;
}

.banner-link {
  width: 100%;
  height: 400rpx;
}

.swiper-item-image {
  width: 100%;
  height: 100%;
  display: block;
}

.nav-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  background-color: ghostwhite;
  border-radius: 30px;
  margin-top: 10rpx;
  margin-bottom: 10rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15rpx;
}

.nav-item-image {
  width: 100rpx;
  height: 100rpx;
}

.nav-item-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 20rpx;
}

.scrollable-tabs {
  width: 100%;
  overflow: hidden;
}

.scroll-view {
  white-space: nowrap;
  display: flex;
  flex-direction: row;
}

.tab {
  display: inline-block;
  padding: 20rpx 40rpx;
  margin-right: 10rpx;
  transition: color 0.3s;
}

.tabtext {
  font-weight: bold;
}

.tab.active {
  color: #e60527;
}

.tab-icon-text {
  display: grid;
  justify-content: space-around;
  align-items: center;
}

.tab-icon {
  width: 100%;
  height: 10rpx;
}

.content {
  padding: 20rpx;
  border: 2px solid ghostwhite;
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

.content-image {
  width: 200rpx;
  height: 200rpx;
  min-width: 200rpx;
  min-height: 200rpx;
  margin-right: 10rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.content-text {
  margin-top: 0;
  margin-left: 0;
  font-size: 30rpx;
  font-weight: 500;
  flex: 1;
}

.moree {
  display: flex;
  align-items: center;
  justify-content: center;
}

.more {
  color: gray;
  font-size: 12px;
}
</style>
