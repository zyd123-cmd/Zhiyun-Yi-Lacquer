<template>
  <view v-if="isReady" class="article-container">
    <ai-assistant />

    <view class="article-header">
      <text class="article-title">{{ article.title }}</text>
      <text class="article-source">{{ article.author }}</text>
    </view>

    <view class="article-content">
      <view v-for="(item, index) in alternatedContent" :key="index">
        <text v-if="item.type === 'text'" class="article-content-text">{{ item.content }}</text>
        <view v-else class="article-imageview">
          <image
            :src="item.imageSrc"
            class="article-image"
            mode="widthFix"
            @click="openImageActions(item.imageSrc)"
          />
        </view>
      </view>
    </view>

    <view class="article-actions">
      <view class="fav-btn-container">
        <uni-fav :checked="isFavorite" bg-color-checked="#dd524d" @click="toggleFavorite" />
      </view>

      <view class="handup-container" @click="toggleLike">
        <uni-icons type="hand-up-filled" size="30rpx" :color="likeIconColor" />
        <text class="handup-text">点赞 {{ likeCount }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import AiAssistant from '@/components/ai-assistant/ai-assistant.vue'
import {
  COLLECTIONS,
  COLLECTION_FALLBACKS,
  CLOUD_FUNCTIONS,
  CLOUD_FUNCTION_FALLBACKS,
  callCloudFunctionWithFallback,
  extractResultData,
  runCollectionWithFallback,
} from '@/utils/cloud'

export default {
  components: {
    AiAssistant,
  },
  data() {
    return {
      articleId: '',
      article: {},
      contentList: [],
      imageList: [],
      isFavorite: false,
      isLiked: false,
      likeCount: 0,
      isReady: false,
    }
  },
  computed: {
    ...mapState('m_article', ['favoriteArticles', 'likedArticles']),
    ...mapState('m_user', ['isLoggedIn']),
    alternatedContent() {
      const mixedContent = []
      const maxLength = Math.max(this.contentList.length, this.imageList.length)

      for (let index = 0; index < maxLength; index += 1) {
        if (index < this.contentList.length) {
          mixedContent.push({
            type: 'text',
            content: this.contentList[index],
          })
        }

        if (index < this.imageList.length) {
          mixedContent.push({
            type: 'image',
            imageSrc: this.imageList[index],
          })
        }
      }

      return mixedContent
    },
    likeIconColor() {
      return this.isLiked ? '#dd524d' : '#666666'
    },
  },
  watch: {
    favoriteArticles: {
      handler() {
        this.syncFavoriteState()
      },
      deep: true,
    },
    likedArticles: {
      handler() {
        this.syncLikeState()
      },
      deep: true,
    },
  },
  onLoad(options) {
    this.articleId = options && options.id ? options.id : ''

    if (this.articleId) {
      this.loadArticle()
    }
  },
  methods: {
    ...mapMutations('m_article', ['toggleFavoriteArticle', 'toggleLikedArticle']),
    getArticleCollectionNames() {
      return [COLLECTIONS.ARTICLES, ...COLLECTION_FALLBACKS.ARTICLES]
    },
    getFavoritePayload() {
      return {
        id: this.article._id,
        imagesrc: this.article.imagesrc,
        title: this.article.title,
        pagesrc: this.article.pagesrc || `/subcontentpkg/hottopic/article0/article0?id=${this.article._id}`,
      }
    },
    syncFavoriteState() {
      if (!this.article || !this.article._id) {
        this.isFavorite = false
        return
      }

      this.isFavorite = this.favoriteArticles.some((item) => item.id === this.article._id)
    },
    syncLikeState() {
      if (!this.article || !this.article._id) {
        this.isLiked = false
        return
      }

      this.isLiked = this.likedArticles.some((item) => item.id === this.article._id)
    },
    previewImage(currentImage) {
      uni.previewImage({
        urls: this.imageList,
        current: currentImage,
      })
    },
    openImageActions(currentImage) {
      wx.showActionSheet({
        itemList: ['查看图片'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            this.previewImage(currentImage)
          }
        },
      })
    },
    async loadArticleFromDatabase() {
      const db = wx.cloud.database()
      const res = await runCollectionWithFallback(
        this.getArticleCollectionNames(),
        (collectionName) => db.collection(collectionName).doc(this.articleId).get(),
        {
          fallbackWhenEmpty: true,
        }
      )

      return res.data || {}
    },
    applyArticleData(articleData) {
      const normalizedArticle =
        articleData && articleData._id
          ? articleData
          : {
              ...articleData,
              _id: this.articleId,
            }

      this.article = normalizedArticle
      this.contentList = Array.isArray(normalizedArticle.content) ? normalizedArticle.content : []
      this.imageList = Array.isArray(normalizedArticle.imagesrc) ? normalizedArticle.imagesrc : []
      this.likeCount = Number(normalizedArticle.handup || 0)
      this.syncFavoriteState()
      this.syncLikeState()
      this.isReady = true
    },
    async loadArticle() {
      uni.showLoading({
        title: '加载中',
        mask: true,
      })

      try {
        let articleData = null

        try {
          const res = await callCloudFunctionWithFallback(
            [CLOUD_FUNCTIONS.GET_ARTICLE_DETAIL, ...CLOUD_FUNCTION_FALLBACKS.GET_ARTICLE_DETAIL],
            {
              id: this.articleId,
            },
            {
              fallbackWhenEmpty: true,
            }
          )

          articleData = extractResultData(res) || {}
        } catch (error) {
          console.warn('文章详情云函数不可用，已回退数据库直连:', error)
          articleData = await this.loadArticleFromDatabase()
        }

        this.applyArticleData(articleData || {})
      } catch (error) {
        console.error('文章详情加载失败:', error)
        uni.showToast({
          title: '内容加载失败',
          icon: 'none',
        })
      } finally {
        uni.hideLoading()
      }
    },
    async ensureLoggedIn() {
      if (this.isLoggedIn) {
        return true
      }

      const { confirm } = await uni.showModal({
        title: '提示',
        content: '请先登录后再继续操作',
      })

      if (confirm) {
        uni.reLaunch({
          url: '/pages/my/my',
        })
      }

      return false
    },
    async toggleFavorite() {
      if (!(await this.ensureLoggedIn())) {
        return
      }

      this.toggleFavoriteArticle(this.getFavoritePayload())
      this.syncFavoriteState()
    },
    async persistLikeChange(delta) {
      const functionNames = [
        CLOUD_FUNCTIONS.UPDATE_ARTICLE_LIKES,
        ...CLOUD_FUNCTION_FALLBACKS.UPDATE_ARTICLE_LIKES,
      ]

      try {
        await callCloudFunctionWithFallback(functionNames, {
          id: this.article._id,
          delta,
          handupcolor: delta > 0 ? '#dd524d' : '#666666',
        })
        return
      } catch (error) {
        console.warn('点赞云函数不可用，尝试直连数据库更新:', error)
      }

      const db = wx.cloud.database()
      const command = db.command

      await runCollectionWithFallback(this.getArticleCollectionNames(), (collectionName) =>
        db.collection(collectionName).doc(this.article._id).update({
          data: {
            handup: command.inc(delta),
          },
        })
      )
    },
    async toggleLike() {
      if (!(await this.ensureLoggedIn())) {
        return
      }

      const delta = this.isLiked ? -1 : 1
      this.toggleLikedArticle({ id: this.article._id })
      this.syncLikeState()
      this.likeCount = Math.max(0, this.likeCount + delta)

      try {
        await this.persistLikeChange(delta)
      } catch (error) {
        console.error('更新点赞状态失败:', error)
        this.toggleLikedArticle({ id: this.article._id })
        this.syncLikeState()
        this.likeCount = Math.max(0, this.likeCount - delta)
        uni.showToast({
          title: '点赞失败',
          icon: 'none',
        })
      }
    },
  },
}
</script>

<style>
.article-container {
  padding: 20rpx;
}

.article-header {
  margin-bottom: 20rpx;
  text-align: center;
  display: grid;
}

.article-title {
  font-size: 36rpx;
  font-weight: bold;
}

.article-source {
  font-size: 24rpx;
  color: #666;
}

.article-content {
  font-size: 28rpx;
  line-height: 1.6;
}

.article-content-text {
  display: block;
  margin-top: 20rpx;
  color: #333;
}

.article-imageview {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-image {
  width: 100%;
  border-radius: 16rpx;
}

.article-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 30rpx 20rpx 20rpx 0;
}

.fav-btn-container {
  margin-right: 20rpx;
}

.handup-container {
  display: flex;
  align-items: center;
}

.handup-text {
  margin-left: 10rpx;
  font-size: 24rpx;
  color: #666666;
}
</style>
