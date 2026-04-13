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
      <swiper-item v-for="(item, index) in swiperItems" :key="item._id || index">
        <navigator class="banner-link" :url="resolveNavigatorUrl(item.pagesrc)">
          <image
            :src="getBannerImage(item)"
            class="swiper-item-image"
            mode="aspectFill"
            @error="handleBannerImageError(index)"
          />
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
          @click="handleTabClick(index)"
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
        v-for="(article, index) in currentArticles"
        :key="article._id || index"
        class="content-item"
        :url="getArticleUrl(article)"
      >
        <image
          class="content-image"
          :src="getCoverImage(article)"
          mode="aspectFill"
          lazy-load
          @error="handleArticleImageError(currentTabType, index)"
        />
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
  fetchArticleList,
  fetchSwiperItems,
  getArticleCoverImage,
  getArticleDetailUrl,
} from '@/utils/article-service'
import { resolveCloudFileSourceList } from '@/utils/cloud'

const HOME_PAGE_CACHE_KEY = 'homePageCacheV3'
const HOME_PAGE_CACHE_EXPIRE_MS = 5 * 60 * 1000
const HOME_BANNER_FALLBACK_IMAGE = '/static/logo.png'
const HOME_ARTICLE_FALLBACK_IMAGE = '/static/logo.png'

export default {
  components: {
    AppSearchBar,
  },
  data() {
    return {
      isReady: false,
      isRefreshing: false,
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
    // 中文注释：当前栏目类型属于高频渲染数据，这里保持纯计算避免额外日志开销。
    currentTabType() {
      const currentTab = this.tabs[this.activeTab]
      return currentTab ? currentTab.type : ''
    },
    // 中文注释：当前栏目文章列表同样属于高频渲染数据，这里直接返回结果减少重复开销。
    currentArticles() {
      return this.articleGroups[this.currentTabType] || []
    },
  },
  onLoad() {
    console.log('首页：页面加载完成，准备先恢复缓存再刷新最新数据')
    this.restoreHomeCache()
    this.loadHomeData()
  },
  methods: {
    // 中文注释：统一创建空的首页文章分组结构，保证每个栏目都存在稳定的响应式字段。
    createEmptyArticleGroups() {
      console.log('首页：开始创建空的首页文章分组结构')
      const articleGroups = this.tabs.reduce((groupMap, tab) => {
        groupMap[tab.type] = []
        return groupMap
      }, {})
      console.log('首页：空的首页文章分组结构创建完成', articleGroups)
      return articleGroups
    },
    // 中文注释：统一处理栏目切换，只更新必要状态，减少切换时的额外逻辑。
    handleTabClick(index) {
      console.log('首页：收到栏目点击事件，准备切换栏目', index)
      this.activeTab = index
      console.log('首页：栏目切换完成', this.currentTabType)
    },
    // 中文注释：统一跳转到搜索页面，避免搜索入口逻辑散落在模板里。
    goToSearch() {
      console.log('首页：收到搜索入口点击事件，准备跳转到搜索页面')
      uni.navigateTo({
        url: '/subcontentpkg/search/search',
      })
    },
    // 中文注释：统一兜底导航地址，避免配置为空时出现无效跳转。
    resolveNavigatorUrl(url) {
      return url || '/pages/index/index'
    },
    // 中文注释：统一生成文章详情跳转地址，直接复用文章服务层的地址拼接逻辑。
    getArticleUrl(article) {
      return getArticleDetailUrl(article)
    },
    // 中文注释：统一获取轮播图展示地址，模板层只负责展示，不再重复做兜底。
    getBannerImage(item) {
      return (item && item.displayImage) || (item && item.imagesrc) || HOME_BANNER_FALLBACK_IMAGE
    },
    // 中文注释：统一获取文章封面地址，并兼容封面图尚未解析完成时的兜底逻辑。
    getCoverImage(article) {
      return (
        (article && article.coverImage) ||
        getArticleCoverImage(article, HOME_ARTICLE_FALLBACK_IMAGE) ||
        HOME_ARTICLE_FALLBACK_IMAGE
      )
    },
    // 中文注释：轮播图加载失败时统一回退到本地兜底图，保证首页首屏视觉稳定。
    handleBannerImageError(swiperIndex) {
      console.log('首页：检测到轮播图加载失败，准备回退到本地兜底图', swiperIndex)

      if (!this.swiperItems[swiperIndex]) {
        console.log('首页：当前轮播图索引不存在，终止兜底处理', swiperIndex)
        return
      }

      const nextSwiperItems = [...this.swiperItems]
      nextSwiperItems[swiperIndex] = {
        ...nextSwiperItems[swiperIndex],
        displayImage: HOME_BANNER_FALLBACK_IMAGE,
      }
      this.swiperItems = nextSwiperItems
      console.log('首页：轮播图兜底图片设置完成', swiperIndex)
    },
    // 中文注释：文章封面图加载失败时统一回退到本地兜底图，避免列表出现空白封面。
    handleArticleImageError(articleType, articleIndex) {
      console.log('首页：检测到文章封面图加载失败，准备回退到本地兜底图', {
        articleType,
        articleIndex,
      })
      const currentGroup = this.articleGroups[articleType] || []

      if (!currentGroup[articleIndex]) {
        console.log('首页：当前文章索引不存在，终止兜底处理', {
          articleType,
          articleIndex,
        })
        return
      }

      const nextGroup = [...currentGroup]
      nextGroup[articleIndex] = {
        ...nextGroup[articleIndex],
        coverImage: HOME_ARTICLE_FALLBACK_IMAGE,
      }
      this.$set(this.articleGroups, articleType, nextGroup)
      console.log('首页：文章封面兜底图片设置完成', {
        articleType,
        articleIndex,
      })
    },
    // 中文注释：统一读取首页缓存，让首页在网络返回前先展示上一份可用内容。
    readHomeCache() {
      console.log('首页：开始读取首页缓存数据')

      try {
        const cacheText = uni.getStorageSync(HOME_PAGE_CACHE_KEY)

        if (!cacheText) {
          console.log('首页：当前不存在首页缓存数据')
          return null
        }

        const cacheData = JSON.parse(cacheText)

        if (!cacheData || !cacheData.timestamp || !cacheData.payload) {
          console.log('首页：首页缓存结构无效，直接忽略本次缓存')
          return null
        }

        if (Date.now() - Number(cacheData.timestamp) > HOME_PAGE_CACHE_EXPIRE_MS) {
          console.log('首页：首页缓存已过期，直接忽略本次缓存', cacheData.timestamp)
          return null
        }

        console.log('首页：首页缓存读取成功', cacheData.timestamp)
        return cacheData.payload
      } catch (error) {
        console.error('首页：首页缓存读取失败', error)
        return null
      }
    },
    // 中文注释：统一写入首页缓存，让用户二次进入首页时能更快看到内容。
    writeHomeCache(payload) {
      console.log('首页：开始写入首页缓存数据', payload)

      try {
        uni.setStorageSync(
          HOME_PAGE_CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            payload,
          })
        )
        console.log('首页：首页缓存写入完成')
      } catch (error) {
        console.error('首页：首页缓存写入失败', error)
      }
    },
    // 中文注释：统一批量解析轮播图图片地址，减少模板层和图片组件的额外处理成本。
    async normalizeSwiperItems(swiperItems = []) {
      console.log('首页：开始标准化轮播图列表并解析图片地址', swiperItems)
      const imageSourceList = swiperItems.map((item) => (item && item.imagesrc) || '')
      const resolvedImageList = await resolveCloudFileSourceList(imageSourceList)
      const normalizedSwiperItems = swiperItems.map((item, index) => ({
        ...(item || {}),
        displayImage: resolvedImageList[index] || HOME_BANNER_FALLBACK_IMAGE,
      }))
      console.log('首页：轮播图列表标准化完成', normalizedSwiperItems)
      return normalizedSwiperItems
    },
    // 中文注释：统一批量解析首页文章封面图，提前把云文件地址转成可展示地址。
    async normalizeArticleGroups(rawArticleGroups = {}) {
      console.log('首页：开始标准化首页文章分组并解析封面图', rawArticleGroups)
      const normalizedArticleGroups = this.createEmptyArticleGroups()
      const flatArticleList = []

      this.tabs.forEach((tab) => {
        const currentList = Array.isArray(rawArticleGroups[tab.type]) ? rawArticleGroups[tab.type] : []
        currentList.forEach((article) => {
          flatArticleList.push({
            tabType: tab.type,
            article,
          })
        })
      })

      const rawCoverImageList = flatArticleList.map(({ article }) =>
        getArticleCoverImage(article, '')
      )
      const resolvedCoverImageList = await resolveCloudFileSourceList(rawCoverImageList)

      flatArticleList.forEach((item, index) => {
        normalizedArticleGroups[item.tabType].push({
          ...(item.article || {}),
          coverImage: resolvedCoverImageList[index] || HOME_ARTICLE_FALLBACK_IMAGE,
        })
      })

      console.log('首页：首页文章分组标准化完成', normalizedArticleGroups)
      return normalizedArticleGroups
    },
    // 中文注释：统一把首页数据应用到页面状态，避免多处重复维护相同的标准化和赋值逻辑。
    async applyHomePayload(payload, sourceLabel = 'network') {
      console.log('首页：开始把首页数据应用到页面状态', {
        sourceLabel,
        payload,
      })
      const normalizedSwiperItems = await this.normalizeSwiperItems(
        Array.isArray(payload && payload.swiperItems) ? payload.swiperItems : []
      )
      const normalizedArticleGroups = await this.normalizeArticleGroups(
        payload && payload.articleGroups ? payload.articleGroups : this.createEmptyArticleGroups()
      )
      this.swiperItems = normalizedSwiperItems
      this.articleGroups = normalizedArticleGroups
      this.isReady = true
      console.log('首页：首页数据应用完成', {
        sourceLabel,
        swiperCount: this.swiperItems.length,
        currentTabType: this.currentTabType,
      })
    },
    // 中文注释：统一恢复首页缓存，让首屏先快速显示缓存内容再异步刷新。
    restoreHomeCache() {
      console.log('首页：开始尝试恢复首页缓存')
      const cachedPayload = this.readHomeCache()

      if (!cachedPayload) {
        console.log('首页：当前没有可用的首页缓存，无需恢复')
        return
      }

      this.applyHomePayload(cachedPayload, 'cache')
      console.log('首页：首页缓存恢复流程已触发')
    },
    // 中文注释：统一加载轮播图数据，复用服务层缓存减少首页重复请求。
    async loadSwiper() {
      console.log('首页：开始通过服务层加载轮播图数据')
      const swiperItems = await fetchSwiperItems()
      console.log('首页：轮播图数据加载完成', swiperItems)
      return swiperItems
    },
    // 中文注释：统一按栏目加载首页文章，只拉取首屏真正需要展示的 3 篇文章。
    async loadHomeArticles() {
      console.log('首页：开始按栏目加载首页文章数据')
      const groupedArticleMap = this.createEmptyArticleGroups()
      const articlePageList = await Promise.all(
        this.tabs.map(async (tab) => {
          console.log('首页：开始加载当前栏目首页文章', tab.type)
          const pageData = await fetchArticleList({
            type: tab.type,
            pageSize: 3,
          })
          console.log('首页：当前栏目首页文章加载完成', {
            type: tab.type,
            count: pageData.list.length,
          })
          return {
            type: tab.type,
            list: pageData.list,
          }
        })
      )

      articlePageList.forEach((item) => {
        groupedArticleMap[item.type] = Array.isArray(item.list) ? item.list : []
      })

      console.log('首页：首页文章分组数据加载完成', groupedArticleMap)
      return groupedArticleMap
    },
    // 中文注释：统一刷新首页数据，在已有缓存的情况下避免过重的全屏 loading 干扰体验。
    async loadHomeData() {
      console.log('首页：开始加载最新首页数据')

      if (this.isRefreshing) {
        console.log('首页：当前已有首页刷新任务在执行，直接跳过本次请求')
        return
      }

      this.isRefreshing = true
      const shouldShowLoading = !this.isReady

      if (shouldShowLoading) {
        uni.showLoading({
          title: '加载中',
          mask: false,
        })
      }

      try {
        const [swiperItems, articleGroups] = await Promise.all([
          this.loadSwiper(),
          this.loadHomeArticles(),
        ])
        const payload = {
          swiperItems,
          articleGroups,
        }
        await this.applyHomePayload(payload, 'network')
        this.writeHomeCache(payload)
      } catch (error) {
        console.error('首页：首页数据加载失败', error)
        uni.showToast({
          title: '首页加载失败',
          icon: 'none',
        })
      } finally {
        if (shouldShowLoading) {
          uni.hideLoading()
        }

        this.isRefreshing = false
        console.log('首页：首页数据刷新流程结束')
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
