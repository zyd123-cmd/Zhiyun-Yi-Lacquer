<template>
  <view v-if="isReady" class="article-container">
    <ai-assistant />

    <view class="article-header">
      <text class="article-title">{{ article.title }}</text>
      <text class="article-source">{{ article.author }}</text>
    </view>

    <view class="article-content">
      <view v-for="(item, index) in articleBlocks" :key="index">
        <text v-if="item.type === 'text'" class="article-content-text">{{ item.content }}</text>
        <view v-else class="article-imageview">
          <image
            :src="item.imageSrc"
            class="article-image"
            mode="widthFix"
            lazy-load
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

    <view class="comment-section">
      <view class="comment-section__header">
        <text class="comment-section__title">评论 {{ commentTotalCount }}</text>
        <text class="comment-section__tip">登录后可以发表评论、回复评论和点赞评论</text>
      </view>

      <view class="comment-editor">
        <view v-if="activeReplyCommentId" class="comment-editor__replying">
          <text class="comment-editor__replying-text">正在回复 {{ activeReplyNickName }}</text>
          <text class="comment-editor__replying-cancel" @click="cancelReply">取消回复</text>
        </view>

        <textarea
          class="comment-editor__textarea"
          :value="commentInput"
          :focus="isCommentInputFocused"
          :maxlength="300"
          :placeholder="commentPlaceholder"
          auto-height
          @input="handleCommentInput"
          @blur="handleCommentInputBlur"
        />

        <view class="comment-editor__footer">
          <text class="comment-editor__count">{{ commentInputLength }}/300</text>
          <button
            class="comment-editor__submit"
            type="primary"
            size="mini"
            :loading="commentSubmitting"
            :disabled="commentSubmitting"
            @click="submitComment"
          >
            {{ commentActionButtonText }}
          </button>
        </view>
      </view>

      <view v-if="commentLoading" class="comment-state-card">
        <text class="comment-state-card__text">评论加载中，请稍候...</text>
      </view>

      <view v-else-if="commentTotalCount === 0" class="comment-state-card">
        <text class="comment-state-card__text">还没有评论，来抢沙发吧</text>
      </view>

      <view v-else class="comment-list">
        <view v-for="comment in commentTreeData" :key="comment._id" class="comment-item">
          <view class="comment-item__main">
            <image :src="getCommentAvatar(comment)" class="comment-item__avatar" lazy-load />

            <view class="comment-item__body">
              <view class="comment-item__meta">
                <text class="comment-item__nickname">{{ comment.nickName }}</text>
                <text class="comment-item__time">{{ comment.createdAtText }}</text>
              </view>

              <text
                class="comment-item__content"
                :class="{ 'comment-item__content--deleted': comment.isDeleted }"
              >
                {{ comment.content }}
              </text>

              <view class="comment-item__actions">
                <view v-if="!comment.isDeleted" class="comment-action" @click="startReply(comment)">
                  <uni-icons type="redo" size="24rpx" color="#888888" />
                  <text class="comment-action__text">回复</text>
                </view>

                <view v-if="!comment.isDeleted" class="comment-action" @click="toggleCommentLike(comment)">
                  <uni-icons
                    type="hand-up-filled"
                    size="24rpx"
                    :color="getCommentLikeColor(comment)"
                  />
                  <text class="comment-action__text">点赞 {{ comment.likeCount }}</text>
                </view>

                <view v-if="comment.canDelete" class="comment-action comment-action--danger" @click="deleteComment(comment)">
                  <uni-icons type="trash" size="24rpx" color="#c00000" />
                  <text class="comment-action__text comment-action__text--danger">删除</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="comment.replies.length > 0" class="comment-reply-list">
            <view v-for="reply in comment.replies" :key="reply._id" class="comment-reply-item">
              <image :src="getCommentAvatar(reply)" class="comment-reply-item__avatar" lazy-load />

              <view class="comment-reply-item__body">
                <view class="comment-reply-item__meta">
                  <text class="comment-reply-item__nickname">{{ reply.nickName }}</text>
                  <text class="comment-reply-item__time">{{ reply.createdAtText }}</text>
                </view>

                <text
                  class="comment-reply-item__content"
                  :class="{ 'comment-item__content--deleted': reply.isDeleted }"
                >
                  <text v-if="reply.replyToNickName" class="comment-reply-item__reply-tag">
                    回复 {{ reply.replyToNickName }}：
                  </text>
                  {{ reply.content }}
                </text>

                <view class="comment-item__actions">
                  <view v-if="!reply.isDeleted" class="comment-action" @click="startReply(reply)">
                    <uni-icons type="redo" size="22rpx" color="#888888" />
                    <text class="comment-action__text">继续回复</text>
                  </view>

                  <view v-if="!reply.isDeleted" class="comment-action" @click="toggleCommentLike(reply)">
                    <uni-icons
                      type="hand-up-filled"
                      size="22rpx"
                      :color="getCommentLikeColor(reply)"
                    />
                    <text class="comment-action__text">点赞 {{ reply.likeCount }}</text>
                  </view>

                  <view v-if="reply.canDelete" class="comment-action comment-action--danger" @click="deleteComment(reply)">
                    <uni-icons type="trash" size="22rpx" color="#c00000" />
                    <text class="comment-action__text comment-action__text--danger">删除</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
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
  resolveCloudFileSourceList,
} from '@/utils/cloud'

const ARTICLE_DETAIL_CACHE_PREFIX = 'articleDetailCacheV2:'
const ARTICLE_COMMENT_CACHE_PREFIX = 'articleCommentCacheV2:'
const ARTICLE_CACHE_EXPIRE_MS = 5 * 60 * 1000
const ARTICLE_IMAGE_FALLBACK = '/static/logo.png'

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
      articleBlocks: [],
      isFavorite: false,
      isLiked: false,
      likeCount: 0,
      isReady: false,
      commentList: [],
      commentTreeData: [],
      commentInput: '',
      activeReplyCommentId: '',
      activeReplyNickName: '',
      commentLoading: false,
      commentSubmitting: false,
      isCommentInputFocused: false,
      commentLikeLoadingMap: {},
      lastCommentInputLogAt: 0,
    }
  },
  computed: {
    ...mapState('m_article', ['favoriteArticles', 'likedArticles']),
    ...mapState('m_user', ['isLoggedIn', 'userId']),
    // 中文注释：统一把正文段落和图片交替组合，保证文章展示顺序和数据库内容一致。
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
    // 中文注释：统一控制文章点赞图标颜色，点赞后立即给用户明确反馈。
    likeIconColor() {
      return this.isLiked ? '#dd524d' : '#666666'
    },
    // 中文注释：统一计算评论总数，根评论与回复都计入总评论数。
    commentTotalCount() {
      return this.commentList.length
    },
    // 中文注释：统一计算评论输入长度，用于限制评论长度并实时提示用户。
    commentInputLength() {
      return this.commentInput.length
    },
    // 中文注释：统一控制评论提交按钮文案，回复评论时给用户更清晰的动作提示。
    commentActionButtonText() {
      return this.activeReplyCommentId ? '回复评论' : '发表评论'
    },
    // 中文注释：统一控制评论输入框占位文案，帮助用户明确当前输入是在发评论还是回复评论。
    commentPlaceholder() {
      return this.activeReplyCommentId
        ? `回复 ${this.activeReplyNickName || '这条评论'}`
        : '说点什么，让更多人看到你的想法'
    },
    // 中文注释：统一把平铺评论整理成“根评论 + 回复列表”的结构，方便页面直接渲染。
    commentTree() {
      const commentNodeMap = {}
      const rootCommentList = []

      this.commentList.forEach((comment) => {
        commentNodeMap[comment._id] = {
          ...comment,
          replies: [],
        }
      })

      Object.keys(commentNodeMap).forEach((commentId) => {
        const currentComment = commentNodeMap[commentId]
        const rootCommentId = currentComment.rootCommentId || currentComment.parentCommentId

        if (!currentComment.parentCommentId) {
          rootCommentList.push(currentComment)
          return
        }

        if (rootCommentId && commentNodeMap[rootCommentId]) {
          commentNodeMap[rootCommentId].replies.push(currentComment)
          return
        }

        rootCommentList.push(currentComment)
      })

      rootCommentList.sort(
        (currentComment, nextComment) => nextComment.createdAt - currentComment.createdAt
      )

      rootCommentList.forEach((rootComment) => {
        rootComment.replies.sort(
          (currentReply, nextReply) => currentReply.createdAt - nextReply.createdAt
        )
      })

      return rootCommentList
    },
  },
  watch: {
    contentList() {
      this.rebuildArticleBlocks()
    },
    imageList() {
      this.rebuildArticleBlocks()
    },
    commentList() {
      this.rebuildCommentTree()

      if (this.articleId) {
        this.writePageCache(this.getCommentCacheKey(), this.commentList)
      }
    },
    favoriteArticles: {
      handler() {
        this.syncFavoriteState()
      },
    },
    likedArticles: {
      handler() {
        this.syncLikeState()
      },
    },
  },
  onLoad(options) {
    console.log('文章详情页面：页面加载完成，开始解析文章 id', options || {})
    this.articleId = options && options.id ? options.id : ''
    console.log('文章详情页面：文章 id 解析完成', this.articleId)

    if (this.articleId) {
      console.log('文章详情页面：已拿到文章 id，准备同时加载文章详情和评论列表')
      this.restoreArticleCache()
      this.restoreCommentCache()
      this.loadArticle()
      this.loadComments()
    } else {
      console.log('文章详情页面：未拿到文章 id，当前无法加载文章详情')
    }
  },
  methods: {
    ...mapMutations('m_article', ['toggleFavoriteArticle', 'toggleLikedArticle']),
    // 中文注释：统一返回文章集合候选名，便于在不同历史集合结构之间自动兼容。
    getArticleCollectionNames() {
      console.log('文章详情页面：开始获取文章集合候选列表')
      const collectionNameList = [COLLECTIONS.ARTICLES, ...COLLECTION_FALLBACKS.ARTICLES]
      console.log('文章详情页面：文章集合候选列表获取完成', collectionNameList)
      return collectionNameList
    },
    // 中文注释：统一生成文章详情缓存键，避免不同文章的缓存互相覆盖。
    getArticleCacheKey() {
      const cacheKey = `${ARTICLE_DETAIL_CACHE_PREFIX}${this.articleId}`
      console.log('文章详情页面：开始生成文章详情缓存键', cacheKey)
      return cacheKey
    },
    // 中文注释：统一生成文章评论缓存键，避免不同文章的评论缓存互相覆盖。
    getCommentCacheKey() {
      const cacheKey = `${ARTICLE_COMMENT_CACHE_PREFIX}${this.articleId}`
      console.log('文章详情页面：开始生成文章评论缓存键', cacheKey)
      return cacheKey
    },
    // 中文注释：统一读取详情页本地缓存，并自动处理过期缓存。
    readPageCache(cacheKey) {
      console.log('文章详情页面：开始读取页面缓存', cacheKey)

      try {
        const cacheText = uni.getStorageSync(cacheKey)

        if (!cacheText) {
          console.log('文章详情页面：当前缓存不存在，直接返回空值', cacheKey)
          return null
        }

        const cacheData = JSON.parse(cacheText)

        if (!cacheData || !cacheData.timestamp) {
          console.log('文章详情页面：当前缓存结构无效，直接忽略缓存', cacheKey)
          return null
        }

        if (Date.now() - Number(cacheData.timestamp) > ARTICLE_CACHE_EXPIRE_MS) {
          console.log('文章详情页面：当前缓存已过期，直接忽略缓存', {
            cacheKey,
            timestamp: cacheData.timestamp,
          })
          return null
        }

        console.log('文章详情页面：页面缓存读取成功', cacheKey)
        return cacheData.payload
      } catch (error) {
        console.error('文章详情页面：页面缓存读取失败', error)
        return null
      }
    },
    // 中文注释：统一写入详情页本地缓存，用于返回文章页时优先秒开旧数据。
    writePageCache(cacheKey, payload) {
      console.log('文章详情页面：开始写入页面缓存', {
        cacheKey,
        payload,
      })

      try {
        uni.setStorageSync(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            payload,
          })
        )
        console.log('文章详情页面：页面缓存写入完成', cacheKey)
      } catch (error) {
        console.error('文章详情页面：页面缓存写入失败', error)
      }
    },
    // 中文注释：优先恢复文章详情缓存，让用户再次进入文章页时先看到已有内容。
    restoreArticleCache() {
      console.log('文章详情页面：开始尝试恢复文章详情缓存')
      const cachedArticle = this.readPageCache(this.getArticleCacheKey())

      if (!cachedArticle || !cachedArticle._id) {
        console.log('文章详情页面：当前没有可用的文章详情缓存，无需恢复')
        return
      }

      this.applyArticleData(cachedArticle)
      console.log('文章详情页面：文章详情缓存恢复流程已触发')
    },
    // 中文注释：优先恢复评论缓存，让评论区尽快显示，后台再静默刷新最新评论。
    restoreCommentCache() {
      console.log('文章详情页面：开始尝试恢复文章评论缓存')
      const cachedCommentList = this.readPageCache(this.getCommentCacheKey())

      if (!Array.isArray(cachedCommentList) || !cachedCommentList.length) {
        console.log('文章详情页面：当前没有可用的文章评论缓存，无需恢复')
        return
      }

      this.applyCommentList(cachedCommentList.map((comment) => this.normalizeComment(comment)))
      console.log('文章详情页面：文章评论缓存恢复完成', this.commentList.length)
    },
    // 中文注释：统一生成收藏所需的文章信息，避免收藏逻辑到处拼接结构。
    getFavoritePayload() {
      console.log('文章详情页面：开始组装收藏文章所需数据')
      const favoritePayload = {
        id: this.article._id,
        imagesrc: this.article.imagesrc,
        title: this.article.title,
        pagesrc: this.article.pagesrc || `/subcontentpkg/hottopic/article0/article0?id=${this.article._id}`,
      }
      console.log('文章详情页面：收藏文章所需数据组装完成', favoritePayload)
      return favoritePayload
    },
    // 中文注释：统一把评论对象规范成前端展示需要的结构，保证接口返回与本地更新都能复用同一套结构。
    normalizeComment(comment) {
      const createdAt = Number((comment && comment.createdAt) || 0)
      const commentUserId = (comment && comment.userId) || ''
      const isDeleted = Boolean(comment && comment.isDeleted)
      const isOwner =
        Boolean(comment && comment.isOwner) ||
        Boolean(this.userId && commentUserId && this.userId === commentUserId)
      const canDelete =
        !isDeleted &&
        (
          Boolean(comment && comment.canDelete) ||
          isOwner
        )
      return {
        _id: (comment && comment._id) || '',
        articleId: (comment && comment.articleId) || this.articleId,
        userId: commentUserId,
        nickName: (comment && comment.nickName) || '微信用户',
        avatarUrl: (comment && comment.avatarUrl) || '',
        content: (comment && comment.content) || '',
        parentCommentId: (comment && comment.parentCommentId) || '',
        rootCommentId: (comment && comment.rootCommentId) || '',
        replyToCommentId: (comment && comment.replyToCommentId) || '',
        replyToUserId: (comment && comment.replyToUserId) || '',
        replyToNickName: (comment && comment.replyToNickName) || '',
        likeCount: Number((comment && comment.likeCount) || 0),
        replyCount: Number((comment && comment.replyCount) || 0),
        createdAt,
        updatedAt: Number((comment && comment.updatedAt) || 0),
        createdAtText: this.formatCommentTime(createdAt),
        isLiked: Boolean(comment && comment.isLiked),
        isOwner,
        canDelete,
        isDeleted,
        status: (comment && comment.status) || 'active',
      }
    },
    // 中文注释：统一格式化评论时间，方便在评论区稳定显示。
    formatCommentTime(timestamp) {
      if (!timestamp) {
        return '刚刚'
      }

      const date = new Date(Number(timestamp))
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    },
    // 中文注释：统一计算评论头像地址，评论用户没有头像时回退到默认头像。
    getCommentAvatar(comment) {
      return (comment && comment.avatarUrl) || '/static/myicon/user.png'
    },
    // 中文注释：统一控制评论点赞图标颜色，评论被点赞后直接高亮。
    getCommentLikeColor(comment) {
      return comment && comment.isLiked ? '#dd524d' : '#999999'
    },
    // 中文注释：同步文章收藏状态，保证 Vuex 变化后详情页图标状态立即跟上。
    syncFavoriteState() {
      console.log('文章详情页面：开始同步文章收藏状态')

      if (!this.article || !this.article._id) {
        console.log('文章详情页面：当前尚未拿到文章详情，收藏状态直接重置为未收藏')
        this.isFavorite = false
        return
      }

      this.isFavorite = this.favoriteArticles.some((item) => item.id === this.article._id)
      console.log('文章详情页面：文章收藏状态同步完成', this.isFavorite)
    },
    // 中文注释：同步文章点赞状态，保证本地点赞记录变化后详情页按钮及时刷新。
    syncLikeState() {
      console.log('文章详情页面：开始同步文章点赞状态')

      if (!this.article || !this.article._id) {
        console.log('文章详情页面：当前尚未拿到文章详情，点赞状态直接重置为未点赞')
        this.isLiked = false
        return
      }

      this.isLiked = this.likedArticles.some((item) => item.id === this.article._id)
      console.log('文章详情页面：文章点赞状态同步完成', this.isLiked)
    },
    // 中文注释：预览文章图片，方便用户查看大图。
    previewImage(currentImage) {
      console.log('文章详情页面：开始预览文章图片', currentImage)
      uni.previewImage({
        urls: this.imageList,
        current: currentImage,
      })
    },
    // 中文注释：统一弹出图片操作菜单，后续如果要扩展保存图片等能力也便于继续追加。
    openImageActions(currentImage) {
      console.log('文章详情页面：开始打开图片操作菜单', currentImage)
      wx.showActionSheet({
        itemList: ['查看图片'],
        success: ({ tapIndex }) => {
          console.log('文章详情页面：图片操作菜单点击完成', tapIndex)

          if (tapIndex === 0) {
            this.previewImage(currentImage)
          }
        },
      })
    },
    // 中文注释：数据库直连读取文章详情，作为云函数异常时的兜底方案。
    async loadArticleFromDatabase() {
      console.log('文章详情页面：开始从数据库直连读取文章详情')
      const db = wx.cloud.database()
      const res = await runCollectionWithFallback(
        this.getArticleCollectionNames(),
        (collectionName) => db.collection(collectionName).doc(this.articleId).get(),
        {
          fallbackWhenEmpty: true,
        }
      )
      console.log('文章详情页面：数据库直连读取文章详情完成', res && res.data ? res.data._id : '')
      return res.data || {}
    },
    // 中文注释：统一把文章详情应用到页面状态，避免不同加载入口重复维护一套赋值逻辑。
    applyArticleData(articleData) {
      console.log('文章详情页面：开始把文章详情应用到页面状态', articleData || {})
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
        this.rebuildArticleBlocks()
        this.likeCount = Number(normalizedArticle.handup || 0)
      this.syncFavoriteState()
      this.syncLikeState()
      this.isReady = true
      console.log('文章详情页面：文章详情应用完成', {
        articleId: this.article._id,
        likeCount: this.likeCount,
        contentCount: this.contentList.length,
        imageCount: this.imageList.length,
      })
    },
    // 中文注释：加载文章详情，优先走云函数，失败后自动回退到数据库直连。
    async loadArticle() {
      console.log('文章详情页面：开始加载文章详情')
      uni.showLoading({
        title: '加载中',
        mask: true,
      })

      try {
        let articleData = null

        try {
          console.log('文章详情页面：开始通过云函数加载文章详情')
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
          console.log('文章详情页面：通过云函数加载文章详情完成', articleData && articleData._id)
        } catch (error) {
          console.warn('文章详情页面：文章详情云函数不可用，准备回退数据库直连', error)
          articleData = await this.loadArticleFromDatabase()
        }

        this.writePageCache(this.getArticleCacheKey(), articleData || {})
        this.applyArticleData(articleData || {})
      } catch (error) {
        console.error('文章详情页面：文章详情加载失败', error)
        uni.showToast({
          title: '内容加载失败',
          icon: 'none',
        })
      } finally {
        console.log('文章详情页面：文章详情加载流程结束，准备关闭加载框')
        uni.hideLoading()
      }
    },
    // 中文注释：加载当前文章下的评论列表，并把接口返回的扁平列表标准化为前端统一结构。
    async loadComments() {
      console.log('文章详情页面：开始加载文章评论列表')
      this.commentLoading = true
      console.log('文章详情页面：评论加载状态已切换为加载中')

      try {
        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.GET_ARTICLE_COMMENTS,
          data: {
            articleId: this.articleId,
            pageSize: 120,
          },
        })
        const result = res && res.result ? res.result : {}
        console.log('文章详情页面：文章评论云函数返回结果', result)

        if (!result.success) {
          throw new Error(result.message || '获取评论失败')
        }

        const commentList =
          result.data && Array.isArray(result.data.list) ? result.data.list : []
          this.applyCommentList(commentList.map((comment) => this.normalizeComment(comment)))
        this.writePageCache(this.getCommentCacheKey(), commentList)
        console.log('文章详情页面：文章评论列表同步完成', this.commentList.length)
      } catch (error) {
        console.error('文章详情页面：文章评论列表加载失败', error)
        uni.showToast({
          title: error.message || '评论加载失败',
          icon: 'none',
        })
      } finally {
        this.commentLoading = false
        console.log('文章详情页面：评论加载流程结束，评论加载状态已重置')
      }
    },
    // 中文注释：统一校验当前操作是否已登录，未登录时引导用户前往“我的”页面完成登录。
    async ensureLoggedIn() {
      console.log('文章详情页面：开始校验当前用户是否已登录')

      if (this.isLoggedIn) {
        console.log('文章详情页面：当前用户已登录，允许继续执行操作')
        return true
      }

      console.log('文章详情页面：当前用户未登录，准备弹出登录提示框')
      const { confirm } = await uni.showModal({
        title: '提示',
        content: '请先登录后再继续操作',
      })
      console.log('文章详情页面：登录提示框返回结果', confirm)

      if (confirm) {
        console.log('文章详情页面：用户选择前往登录页')
        uni.reLaunch({
          url: '/pages/my/my',
        })
      }

      return false
    },
    // 中文注释：切换文章收藏状态，收藏前先校验登录态。
    async toggleFavorite() {
      console.log('文章详情页面：开始切换文章收藏状态')

      if (!(await this.ensureLoggedIn())) {
        console.log('文章详情页面：收藏操作被登录校验拦截')
        return
      }

      this.toggleFavoriteArticle(this.getFavoritePayload())
      this.syncFavoriteState()
      console.log('文章详情页面：文章收藏状态切换完成', this.isFavorite)
    },
    // 中文注释：通过云函数或数据库直连持久化文章点赞数变化。
    async persistLikeChange(delta) {
      console.log('文章详情页面：开始持久化文章点赞变化', delta)
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
        console.log('文章详情页面：通过云函数持久化文章点赞变化完成')
        return
      } catch (error) {
        console.warn('文章详情页面：文章点赞云函数不可用，准备回退数据库直连', error)
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
      console.log('文章详情页面：通过数据库直连持久化文章点赞变化完成')
    },
    // 中文注释：切换文章点赞状态，先本地乐观更新，再异步持久化到云端。
    async toggleLike() {
      console.log('文章详情页面：开始切换文章点赞状态')

      if (!(await this.ensureLoggedIn())) {
        console.log('文章详情页面：文章点赞操作被登录校验拦截')
        return
      }

      const delta = this.isLiked ? -1 : 1
      this.toggleLikedArticle({ id: this.article._id })
      this.syncLikeState()
      this.likeCount = Math.max(0, this.likeCount + delta)
      this.writePageCache(this.getArticleCacheKey(), {
        ...this.article,
        handup: this.likeCount,
      })
      console.log('文章详情页面：文章点赞本地状态已完成乐观更新', {
        isLiked: this.isLiked,
        likeCount: this.likeCount,
      })

      try {
        await this.persistLikeChange(delta)
      } catch (error) {
        console.error('文章详情页面：文章点赞持久化失败，准备回滚本地状态', error)
        this.toggleLikedArticle({ id: this.article._id })
        this.syncLikeState()
        this.likeCount = Math.max(0, this.likeCount - delta)
        this.writePageCache(this.getArticleCacheKey(), {
          ...this.article,
          handup: this.likeCount,
        })
        uni.showToast({
          title: '点赞失败',
          icon: 'none',
        })
      }
    },
    // 中文注释：实时同步评论输入内容，保证提交时拿到的是最新草稿。
    handleCommentInput(event) {
      console.log('文章详情页面：收到评论输入事件', event || {})
      this.commentInput = event && event.detail ? String(event.detail.value || '') : ''

      if (Date.now() - this.lastCommentInputLogAt > 500) {
        console.log('文章详情页：评论输入内容已同步，当前输入长度', this.commentInput.length)
        this.lastCommentInputLogAt = Date.now()
      }
      console.log('文章详情页面：评论输入内容同步完成', this.commentInput)
    },
    // 中文注释：评论输入框失焦时同步焦点状态，避免回复场景反复抢焦点。
    handleCommentInputBlur() {
      console.log('文章详情页面：评论输入框失焦，准备重置焦点状态')
      this.isCommentInputFocused = false
      console.log('文章详情页面：评论输入框焦点状态已重置')
    },
    // 中文注释：开始回复指定评论，记录目标评论信息并把焦点切到输入框。
    async startReply(comment) {
      console.log('文章详情页面：开始进入回复评论流程', comment || {})

      if (comment && comment.isDeleted) {
        console.log('文章详情页面：当前评论已删除，阻止继续回复')
        uni.showToast({
          title: '已删除评论暂不支持回复',
          icon: 'none',
        })
        return
      }

      if (!(await this.ensureLoggedIn())) {
        console.log('文章详情页面：回复评论操作被登录校验拦截')
        return
      }

      this.activeReplyCommentId = comment && comment._id ? comment._id : ''
      this.activeReplyNickName = comment && comment.nickName ? comment.nickName : '这条评论'
      this.isCommentInputFocused = true
      console.log('文章详情页面：回复评论目标设置完成', {
        activeReplyCommentId: this.activeReplyCommentId,
        activeReplyNickName: this.activeReplyNickName,
      })
    },
    // 中文注释：取消当前回复状态，恢复成普通发表评论模式。
    cancelReply() {
      console.log('文章详情页面：开始取消当前回复状态')
      this.activeReplyCommentId = ''
      this.activeReplyNickName = ''
      this.isCommentInputFocused = false
      console.log('文章详情页面：当前回复状态已取消')
    },
    // 中文注释：统一重置评论输入区状态，评论成功后和取消回复时都复用这套逻辑。
    resetCommentEditor() {
      console.log('文章详情页面：开始重置评论输入区状态')
      this.commentInput = ''
      this.activeReplyCommentId = ''
      this.activeReplyNickName = ''
      this.isCommentInputFocused = false
      console.log('文章详情页面：评论输入区状态重置完成')
    },
    // 中文注释：把新创建的评论写入本地评论列表，并在回复场景下同步更新父评论的回复数。
    appendCommentToList(comment) {
      console.log('文章详情页面：开始把新评论追加到本地评论列表', comment || {})
      const normalizedComment = this.normalizeComment(comment)
      this.commentList = [...this.commentList, normalizedComment]

      if (normalizedComment.parentCommentId) {
        console.log('文章详情页面：当前为回复评论，准备同步增加父评论回复数', normalizedComment.parentCommentId)
        this.commentList = this.commentList.map((currentComment) => {
          if (currentComment._id !== normalizedComment.parentCommentId) {
            return currentComment
          }

          return {
            ...currentComment,
            replyCount: Number(currentComment.replyCount || 0) + 1,
          }
        })
      }

      console.log('文章详情页面：新评论已追加到本地评论列表', this.commentList.length)
    },
    // 中文注释：统一按评论 id 更新本地评论列表中的指定评论，便于点赞和回复数等局部刷新。
    updateCommentInList(commentId, updater) {
      console.log('文章详情页面：开始更新本地评论列表中的指定评论', commentId)

      this.commentList = this.commentList.map((currentComment) => {
        if (currentComment._id !== commentId) {
          return currentComment
        }

        const nextComment =
          typeof updater === 'function'
            ? updater(currentComment)
            : {
                ...currentComment,
                ...updater,
              }

        return this.normalizeComment(nextComment)
      })

      console.log('文章详情页面：本地评论列表指定评论更新完成', commentId)
    },
    // 中文注释：把删除评论后的结果同步到本地评论列表，兼容软删除和硬删除两种场景。
    applyCommentDeleteResult(deleteResult) {
      console.log('文章详情页面：开始把删除评论结果同步到本地评论列表', deleteResult || {})

      if (!deleteResult || !deleteResult.commentId) {
        console.log('文章详情页面：删除评论结果缺少评论 id，本次不做本地同步')
        return
      }

      if (deleteResult.deleteMode === 'hard') {
        console.log('文章详情页面：当前为硬删除，准备直接从本地评论列表移除评论')
        this.commentList = this.commentList.filter((comment) => comment._id !== deleteResult.commentId)

        if (deleteResult.parentCommentId) {
          console.log('文章详情页面：当前删除的是回复评论，准备同步扣减父评论回复数', deleteResult.parentCommentId)
          this.commentList = this.commentList.map((comment) => {
            if (comment._id !== deleteResult.parentCommentId) {
              return comment
            }

            return this.normalizeComment({
              ...comment,
              replyCount: Math.max(0, Number(comment.replyCount || 0) - 1),
            })
          })
        }

        console.log('文章详情页面：硬删除评论的本地同步完成', this.commentList.length)
        return
      }

      console.log('文章详情页面：当前为软删除，准备把评论更新为已删除占位状态')
      this.updateCommentInList(deleteResult.commentId, (comment) => ({
        ...comment,
        content: '该评论已删除',
        likeCount: 0,
        isLiked: false,
        canDelete: false,
        isDeleted: true,
        status: 'deleted',
      }))
      console.log('文章详情页面：软删除评论的本地同步完成', deleteResult.commentId)
    },
    // 中文注释：删除当前用户自己的评论，成功后同步更新本地评论列表。
    async deleteComment(comment) {
      console.log('文章详情页面：开始删除评论流程', comment || {})

      if (!(await this.ensureLoggedIn())) {
        console.log('文章详情页面：删除评论操作被登录校验拦截')
        return
      }

      if (!comment || !comment._id) {
        console.log('文章详情页面：当前评论缺少评论 id，无法删除')
        return
      }

      if (!comment.canDelete) {
        console.log('文章详情页面：当前评论不允许删除，直接结束流程')
        uni.showToast({
          title: '只能删除自己的评论',
          icon: 'none',
        })
        return
      }

      const { confirm } = await uni.showModal({
        title: '提示',
        content: '确认删除这条评论吗？',
      })
      console.log('文章详情页面：删除评论确认框返回结果', confirm)

      if (!confirm) {
        console.log('文章详情页面：用户取消了删除评论操作')
        return
      }

      try {
        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.DELETE_ARTICLE_COMMENT,
          data: {
            commentId: comment._id,
          },
        })
        const result = res && res.result ? res.result : {}
        console.log('文章详情页面：删除评论云函数返回结果', result)

        if (!result.success || !result.data) {
          throw new Error(result.message || '评论删除失败')
        }

        this.applyCommentDeleteResult(result.data)

        if (this.activeReplyCommentId === comment._id) {
          console.log('文章详情页面：当前正在回复的评论已被删除，准备重置回复状态')
          this.cancelReply()
        }

        uni.showToast({
          title: result.message || '评论删除成功',
          icon: 'success',
        })
      } catch (error) {
        console.error('文章详情页面：删除评论失败', error)
        uni.showToast({
          title: error.message || '评论删除失败',
          icon: 'none',
        })
      }
    },
    // 中文注释：提交评论或回复评论，成功后直接把新评论写回本地列表，避免整页重新加载。
    async submitComment() {
      console.log('文章详情页面：开始提交评论', {
        articleId: this.articleId,
        activeReplyCommentId: this.activeReplyCommentId,
        commentInput: this.commentInput,
      })

      if (!(await this.ensureLoggedIn())) {
        console.log('文章详情页面：评论提交操作被登录校验拦截')
        return
      }

      if (this.commentSubmitting) {
        console.log('文章详情页面：当前已有评论提交任务在执行，直接忽略本次提交')
        return
      }

      const trimmedContent = this.commentInput.trim()

      if (!trimmedContent) {
        console.log('文章详情页面：评论内容为空，阻止提交')
        uni.showToast({
          title: '评论内容不能为空',
          icon: 'none',
        })
        return
      }

      this.commentSubmitting = true
      console.log('文章详情页面：评论提交状态已切换为提交中')

      try {
        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.CREATE_ARTICLE_COMMENT,
          data: {
            articleId: this.articleId,
            parentCommentId: this.activeReplyCommentId,
            content: trimmedContent,
          },
        })
        const result = res && res.result ? res.result : {}
        console.log('文章详情页面：创建评论云函数返回结果', result)

        if (!result.success || !result.data || !result.data._id) {
          throw new Error(result.message || '评论提交失败')
        }

        this.appendCommentToList(result.data)
        this.resetCommentEditor()
        console.log('文章详情页面：评论提交成功，准备提示用户')
        uni.showToast({
          title: result.message || '评论成功',
          icon: 'success',
        })
      } catch (error) {
        console.error('文章详情页面：评论提交失败', error)
        uni.showToast({
          title: error.message || '评论提交失败',
          icon: 'none',
        })
      } finally {
        this.commentSubmitting = false
        console.log('文章详情页面：评论提交流程结束，评论提交状态已重置')
      }
    },
    // 中文注释：切换评论点赞状态，先做本地乐观更新，再把结果同步到云端。
    async toggleCommentLike(comment) {
      console.log('文章详情页面：开始切换评论点赞状态', comment || {})

      if (comment && comment.isDeleted) {
        console.log('文章详情页面：当前评论已删除，阻止继续点赞')
        uni.showToast({
          title: '已删除评论不能点赞',
          icon: 'none',
        })
        return
      }

      if (!(await this.ensureLoggedIn())) {
        console.log('文章详情页面：评论点赞操作被登录校验拦截')
        return
      }

      if (!comment || !comment._id) {
        console.log('文章详情页面：当前评论缺少评论 id，无法执行点赞')
        return
      }

      if (this.commentLikeLoadingMap[comment._id]) {
        console.log('文章详情页面：当前评论点赞任务仍在执行，忽略重复点击', comment._id)
        return
      }

      this.$set(this.commentLikeLoadingMap, comment._id, true)
      console.log('文章详情页面：评论点赞任务已加锁', comment._id)

      const previousLikeStatus = Boolean(comment.isLiked)
      const previousLikeCount = Number(comment.likeCount || 0)
      const delta = previousLikeStatus ? -1 : 1

      this.updateCommentInList(comment._id, (currentComment) => ({
        ...currentComment,
        isLiked: !currentComment.isLiked,
        likeCount: Math.max(0, Number(currentComment.likeCount || 0) + delta),
      }))
      console.log('文章详情页面：评论点赞本地状态已完成乐观更新', {
        commentId: comment._id,
        previousLikeStatus,
        previousLikeCount,
      })

      try {
        const res = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.TOGGLE_ARTICLE_COMMENT_LIKE,
          data: {
            commentId: comment._id,
          },
        })
        const result = res && res.result ? res.result : {}
        console.log('文章详情页面：评论点赞云函数返回结果', result)

        if (!result.success || !result.data) {
          throw new Error(result.message || '评论点赞失败')
        }

        this.updateCommentInList(comment._id, (currentComment) => ({
          ...currentComment,
          isLiked: Boolean(result.data.isLiked),
          likeCount: Math.max(0, Number(result.data.likeCount || 0)),
        }))
        console.log('文章详情页面：评论点赞云端结果已同步到本地', comment._id)
      } catch (error) {
        console.error('文章详情页面：评论点赞失败，准备回滚本地状态', error)
        this.updateCommentInList(comment._id, (currentComment) => ({
          ...currentComment,
          isLiked: previousLikeStatus,
          likeCount: Math.max(0, previousLikeCount),
        }))
        uni.showToast({
          title: error.message || '评论点赞失败',
          icon: 'none',
        })
      } finally {
        this.$delete(this.commentLikeLoadingMap, comment._id)
        console.log('文章详情页面：评论点赞任务已解锁', comment._id)
      }
    },
    // 中文注释：统一把正文段落和图片交替结果同步到页面数据，避免评论区状态变化时重复重算正文。
    rebuildArticleBlocks() {
      console.log('文章详情页：开始重建正文内容块缓存')
      this.articleBlocks = this.alternatedContent
      console.log('文章详情页：正文内容块缓存重建完成', this.articleBlocks.length)
    },
    // 中文注释：统一把评论树结构同步到页面数据，避免输入评论时整棵评论树在渲染阶段反复重算。
    rebuildCommentTree() {
      console.log('文章详情页：开始重建评论树缓存')
      this.commentTreeData = this.commentTree
      console.log('文章详情页：评论树缓存重建完成', this.commentTreeData.length)
    },
    // 中文注释：统一设置评论列表并立即刷新评论树缓存，减少评论相关操作后的重复渲染。
    applyCommentList(nextCommentList) {
      console.log('文章详情页：开始同步评论列表和评论树缓存', {
        nextLength: Array.isArray(nextCommentList) ? nextCommentList.length : 0,
      })
      this.commentList = Array.isArray(nextCommentList) ? nextCommentList : []
      this.rebuildCommentTree()
      console.log('文章详情页：评论列表和评论树缓存同步完成', {
        commentCount: this.commentList.length,
        rootCount: this.commentTreeData.length,
      })
    },
  },
}
</script>

<style>
.article-container {
  padding: 20rpx 20rpx 40rpx;
  box-sizing: border-box;
  background: #f7f4f1;
}

.article-header {
  margin-bottom: 20rpx;
  text-align: center;
  display: grid;
}

.article-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2f2723;
}

.article-source {
  font-size: 24rpx;
  color: #666;
}

.article-content {
  padding: 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  font-size: 28rpx;
  line-height: 1.6;
  box-shadow: 0 16rpx 36rpx rgba(87, 53, 35, 0.06);
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

.comment-section {
  margin-top: 24rpx;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 16rpx 36rpx rgba(87, 53, 35, 0.06);
}

.comment-section__header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.comment-section__title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2f2723;
}

.comment-section__tip {
  font-size: 24rpx;
  color: #8b7f76;
}

.comment-editor {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #f8f5f2;
}

.comment-editor__replying {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.comment-editor__replying-text {
  font-size: 24rpx;
  color: #6f5f56;
}

.comment-editor__replying-cancel {
  font-size: 24rpx;
  color: #c00000;
}

.comment-editor__textarea {
  width: 100%;
  min-height: 140rpx;
  font-size: 28rpx;
  color: #2f2723;
}

.comment-editor__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
}

.comment-editor__count {
  font-size: 22rpx;
  color: #9a8c82;
}

.comment-editor__submit {
  margin: 0;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #c00000;
}

.comment-state-card {
  margin-top: 24rpx;
  padding: 36rpx 20rpx;
  border-radius: 20rpx;
  background: #faf7f4;
  text-align: center;
}

.comment-state-card__text {
  font-size: 26rpx;
  color: #8b7f76;
}

.comment-list {
  margin-top: 24rpx;
}

.comment-item {
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f1e8e2;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item__main {
  display: flex;
  align-items: flex-start;
}

.comment-item__avatar {
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f1ede8;
}

.comment-item__body {
  flex: 1;
  margin-left: 20rpx;
}

.comment-item__meta,
.comment-reply-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-item__nickname,
.comment-reply-item__nickname {
  font-size: 28rpx;
  font-weight: 600;
  color: #2f2723;
}

.comment-item__time,
.comment-reply-item__time {
  font-size: 22rpx;
  color: #a29388;
}

.comment-item__content,
.comment-reply-item__content {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #433933;
  word-break: break-all;
}

.comment-item__content--deleted {
  color: #a29388;
  font-style: italic;
}

.comment-item__actions {
  display: flex;
  align-items: center;
  gap: 28rpx;
  margin-top: 16rpx;
}

.comment-action {
  display: flex;
  align-items: center;
}

.comment-action__text {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #8b7f76;
}

.comment-action--danger {
  margin-left: auto;
}

.comment-action__text--danger {
  color: #c00000;
}

.comment-reply-list {
  margin-top: 20rpx;
  margin-left: 92rpx;
  padding: 18rpx 18rpx 4rpx;
  border-radius: 18rpx;
  background: #faf7f4;
}

.comment-reply-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.comment-reply-item:last-child {
  margin-bottom: 0;
}

.comment-reply-item__avatar {
  width: 56rpx;
  height: 56rpx;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f1ede8;
}

.comment-reply-item__body {
  flex: 1;
  margin-left: 16rpx;
}

.comment-reply-item__reply-tag {
  color: #c00000;
}
</style>
