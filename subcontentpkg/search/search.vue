<template>
  <view class="mainview">
    <view class="search-box">
      <uni-search-bar
        :radius="100"
        cancelButton="none"
        @input="handleInput"
        @confirm="handleConfirm"
      />
    </view>

    <view v-if="searchResults.length" class="sugg-list">
      <view
        v-for="item in searchResults"
        :key="item._id"
        class="sugg-item"
        @click="goToDetail(item)"
      >
        <view class="goods-name">{{ item.title }}</view>
        <uni-icons type="arrowright" size="16" />
      </view>
    </view>

    <view v-else class="history-box">
      <view class="history-title">
        <text>搜索历史</text>
        <uni-icons type="trash" size="17" @click="clearHistory" />
      </view>

      <view class="history-list">
        <view v-for="(item, index) in reversedHistory" :key="index" @click="useHistory(item)">
          <uni-tag :text="item" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { COLLECTIONS, COLLECTION_FALLBACKS, runCollectionWithFallback } from '@/utils/cloud'

const SEARCH_HISTORY_STORAGE_KEY = 'articleSearchHistory'

export default {
  data() {
    return {
      timer: null,
      keyword: '',
      searchResults: [],
      historyList: [],
    }
  },
  computed: {
    reversedHistory() {
      return [...this.historyList].reverse()
    },
  },
  onLoad() {
    this.historyList = JSON.parse(uni.getStorageSync(SEARCH_HISTORY_STORAGE_KEY) || '[]')
  },
  methods: {
    extractKeyword(payload) {
      if (typeof payload === 'string') {
        return payload
      }

      if (!payload) {
        return ''
      }

      return payload.value || (payload.detail && payload.detail.value) || ''
    },
    handleInput(payload) {
      clearTimeout(this.timer)
      const value = this.extractKeyword(payload)

      this.timer = setTimeout(() => {
        this.keyword = value.trim()
        this.searchArticles()
      }, 300)
    },
    handleConfirm(payload) {
      this.keyword = this.extractKeyword(payload).trim()
      this.searchArticles()
    },
    async searchArticles() {
      if (!this.keyword) {
        this.searchResults = []
        return
      }

      this.saveSearchHistory(this.keyword)

      try {
        const db = wx.cloud.database()
        const res = await runCollectionWithFallback(
          [COLLECTIONS.ARTICLES, ...COLLECTION_FALLBACKS.ARTICLES],
          (collectionName) =>
            db
              .collection(collectionName)
              .where({
                title: db.RegExp({
                  regexp: this.keyword,
                  options: 'i',
                }),
              })
              .field({
                _id: true,
                title: true,
              })
              .limit(20)
              .get(),
          {}
        )

        this.searchResults = res.data || []
      } catch (error) {
        console.error('文章搜索失败:', error)
        uni.showToast({
          title: '搜索失败',
          icon: 'none',
        })
      }
    },
    saveSearchHistory(keyword) {
      const historySet = new Set(this.historyList)
      historySet.delete(keyword)
      historySet.add(keyword)
      this.historyList = Array.from(historySet)
      uni.setStorageSync(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(this.historyList))
    },
    useHistory(keyword) {
      this.keyword = keyword
      this.searchArticles()
    },
    clearHistory() {
      this.historyList = []
      uni.setStorageSync(SEARCH_HISTORY_STORAGE_KEY, '[]')
    },
    goToDetail(item) {
      if (!item || !item._id) {
        return
      }

      uni.navigateTo({
        url: `/subcontentpkg/hottopic/article0/article0?id=${item._id}`,
      })
    },
  },
}
</script>

<style>
.search-box {
  position: sticky;
  top: 0;
  z-index: 999;
}

.sugg-list {
  padding: 0 5px;
}

.sugg-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  font-size: 12px;
  border-bottom: 1px solid #efefef;
}

.goods-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 3px;
}

.history-box {
  padding: 0 5px;
}

.history-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  font-size: 13px;
  border-bottom: 1px solid #efefef;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 10rpx;
}

.uni-tag {
  margin-top: 5px;
  margin-right: 5px;
}
</style>
