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

    <view v-if="isSearching" class="state-box">搜索中...</view>

    <view v-else-if="searchResults.length" class="sugg-list">
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

    <view v-else-if="keyword" class="state-box">未找到相关文章</view>

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
import { searchArticleSummaries } from '@/utils/article-service'

const SEARCH_HISTORY_STORAGE_KEY = 'articleSearchHistory'

export default {
  data() {
    return {
      timer: null,
      keyword: '',
      isSearching: false,
      searchResults: [],
      historyList: [],
      searchRequestSerial: 0,
    }
  },
  computed: {
    // 中文注释：搜索历史展示按最近使用顺序倒序排列，便于用户快速回用最近关键词。
    reversedHistory() {
      return [...this.historyList].reverse()
    },
  },
  onLoad() {
    console.log('搜索页：页面加载完成，准备读取本地搜索历史')
    this.historyList = JSON.parse(uni.getStorageSync(SEARCH_HISTORY_STORAGE_KEY) || '[]')
    console.log('搜索页：本地搜索历史读取完成', this.historyList)
  },
  beforeDestroy() {
    console.log('搜索页：页面销毁前准备清理防抖定时器')
    clearTimeout(this.timer)
  },
  methods: {
    // 中文注释：统一从组件事件中提取搜索关键字，兼容输入和确认两种事件结构。
    extractKeyword(payload) {
      if (typeof payload === 'string') {
        return payload
      }

      if (!payload) {
        return ''
      }

      return payload.value || (payload.detail && payload.detail.value) || ''
    },
    // 中文注释：输入时只做防抖搜索，不立即写入历史，避免频繁存储导致输入卡顿。
    handleInput(payload) {
      clearTimeout(this.timer)
      const value = this.extractKeyword(payload)
      console.log('搜索页：收到搜索输入事件，准备执行防抖搜索', value)

      this.timer = setTimeout(() => {
        this.keyword = value.trim()
        this.searchArticles({
          recordHistory: false,
        })
      }, 250)
    },
    // 中文注释：确认搜索时再写入历史，减少无意义的本地存储写入次数。
    handleConfirm(payload) {
      this.keyword = this.extractKeyword(payload).trim()
      console.log('搜索页：收到搜索确认事件，准备执行正式搜索', this.keyword)
      this.searchArticles({
        recordHistory: true,
      })
    },
    // 中文注释：统一执行文章搜索，并通过请求序号丢弃过期响应，避免快速输入时结果闪烁回退。
    async searchArticles(options = {}) {
      const recordHistory = Boolean(options.recordHistory)
      const currentKeyword = (this.keyword || '').trim()
      console.log('搜索页：开始执行文章搜索', {
        currentKeyword,
        recordHistory,
      })

      if (!currentKeyword) {
        this.searchResults = []
        this.isSearching = false
        console.log('搜索页：当前关键字为空，直接清空搜索结果')
        return
      }

      if (recordHistory) {
        this.saveSearchHistory(currentKeyword)
      }

      const requestSerial = this.searchRequestSerial + 1
      this.searchRequestSerial = requestSerial
      this.isSearching = true

      try {
        const resultList = await searchArticleSummaries({
          keyword: currentKeyword,
          limit: 20,
        })

        if (requestSerial !== this.searchRequestSerial) {
          console.log('搜索页：检测到当前搜索结果已经过期，直接丢弃本次返回结果', {
            requestSerial,
            latestSerial: this.searchRequestSerial,
          })
          return
        }

        this.searchResults = resultList
        console.log('搜索页：文章搜索完成', {
          currentKeyword,
          resultLength: resultList.length,
        })
      } catch (error) {
        console.error('搜索页：文章搜索失败', error)
        uni.showToast({
          title: '搜索失败',
          icon: 'none',
        })
      } finally {
        if (requestSerial === this.searchRequestSerial) {
          this.isSearching = false
        }

        console.log('搜索页：文章搜索流程结束', {
          currentKeyword,
          requestSerial,
        })
      }
    },
    // 中文注释：统一维护搜索历史，只保留去重后的最近关键词。
    saveSearchHistory(keyword) {
      console.log('搜索页：开始写入搜索历史', keyword)
      const historySet = new Set(this.historyList)
      historySet.delete(keyword)
      historySet.add(keyword)
      this.historyList = Array.from(historySet)
      uni.setStorageSync(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(this.historyList))
      console.log('搜索页：搜索历史写入完成', this.historyList)
    },
    // 中文注释：点击历史记录时直接复用历史关键词发起搜索。
    useHistory(keyword) {
      console.log('搜索页：收到历史关键词点击事件，准备复用历史关键词', keyword)
      this.keyword = keyword
      this.searchArticles({
        recordHistory: true,
      })
    },
    // 中文注释：统一清空搜索历史，避免模板层直接操作本地存储。
    clearHistory() {
      console.log('搜索页：开始清空搜索历史')
      this.historyList = []
      uni.setStorageSync(SEARCH_HISTORY_STORAGE_KEY, '[]')
      console.log('搜索页：搜索历史清空完成')
    },
    // 中文注释：点击搜索结果时先记录当前关键词，再跳转到文章详情页。
    goToDetail(item) {
      console.log('搜索页：收到搜索结果点击事件，准备跳转文章详情', item)

      if (!item || !item._id) {
        console.log('搜索页：当前搜索结果缺少文章 id，终止跳转流程')
        return
      }

      if (this.keyword) {
        this.saveSearchHistory(this.keyword)
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

.state-box {
  padding: 60rpx 0;
  text-align: center;
  color: #888;
}

.uni-tag {
  margin-top: 5px;
  margin-right: 5px;
}
</style>
