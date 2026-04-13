<template>
  <view class="yiquan-page">
    <view class="hero">
      <image class="hero__bg" :src="heroProfile.backimageResolved || defaultHeroBackground" mode="aspectFill" />
      <view class="hero__mask" />
      <view class="hero__content">
        <view class="hero__user">
          <image class="hero__avatar" :src="heroProfile.avatarResolved || defaultAvatar" mode="aspectFill" />
          <view class="hero__info">
            <text class="hero__name">{{ heroProfile.nickName || defaultHeroName }}</text>
            <text class="hero__desc">{{ heroDesc }}</text>
          </view>
        </view>
        <button class="hero__button" @click="isLoggedIn ? goToPublish() : goToLogin()">
          {{ isLoggedIn ? '发布动态' : '去登录' }}
        </button>
      </view>
    </view>

    <view class="notice-card">
      <text class="notice-card__title">彝圈说明</text>
      <text class="notice-card__text">动态提交后需要管理员审核通过才会展示，评论支持继续回复，也可以删除自己的评论。</text>
    </view>

    <view v-if="isLoading && !postList.length" class="state-card">
      <text class="state-card__text">彝圈动态加载中，请稍候...</text>
    </view>
    <view v-else-if="!postList.length" class="state-card">
      <text class="state-card__text">还没有通过审核的动态，发布第一条内容试试看。</text>
    </view>

    <view v-else class="feed">
      <view v-for="post in postList" :key="post._id" class="post-card">
        <view class="post-card__header">
          <view class="post-card__user">
            <image class="post-card__avatar" :src="post.avatarUrl || defaultAvatar" mode="aspectFill" />
            <view class="post-card__meta">
              <text class="post-card__name">{{ post.nickName }}</text>
              <text class="post-card__time">{{ post.createdAtText }}</text>
            </view>
          </view>
          <view class="post-card__header-actions">
            <text v-if="post.status !== 'approved'" class="post-card__status">{{ getPostStatusText(post.status) }}</text>
            <text v-if="post.canDelete" class="post-card__delete" @click="deletePost(post)">删除</text>
          </view>
        </view>

        <view v-if="post.status !== 'approved'" class="post-card__review-tip">
          <text>{{ getPostReviewTip(post) }}</text>
        </view>

        <text v-if="post.content" class="post-card__content">{{ post.content }}</text>

        <view v-if="post.imageList.length" class="post-card__grid">
          <image
            v-for="(imageUrl, imageIndex) in post.imageList"
            :key="`${post._id}-${imageIndex}`"
            class="post-card__image"
            :class="{ 'post-card__image--single': post.imageList.length === 1 }"
            :src="imageUrl"
            mode="aspectFill"
            @click="previewPostImage(post, imageIndex)"
          />
        </view>

        <view v-if="post.status === 'approved'" class="post-card__toolbar">
          <text class="post-card__toolbar-text">评论 {{ post.commentCount }}</text>
          <text class="post-card__toolbar-action" @click="toggleCommentPanel(post)">
            {{ post.isCommentPanelVisible ? '收起评论' : '展开评论' }}
          </text>
        </view>

        <view v-if="post.status === 'approved' && post.isCommentPanelVisible" class="comment-panel">
          <view class="comment-editor">
            <view v-if="post.activeReplyCommentId" class="comment-editor__reply">
              <text class="comment-editor__reply-text">正在回复 {{ post.activeReplyNickName }}</text>
              <text class="comment-editor__reply-cancel" @click="cancelReply(post._id)">取消回复</text>
            </view>
            <textarea
              class="comment-editor__textarea"
              :value="post.commentInput"
              :focus="post.isCommentInputFocused"
              maxlength="300"
              :placeholder="post.activeReplyCommentId ? `回复 ${post.activeReplyNickName}` : '写下你的评论...'"
              auto-height
              @input="handleCommentInput(post._id, $event)"
            />
            <view class="comment-editor__footer">
              <text class="comment-editor__count">{{ (post.commentInput || '').length }}/300</text>
              <button class="comment-editor__submit" size="mini" :loading="post.isCommentSubmitting" :disabled="post.isCommentSubmitting" @click="submitComment(post)">
                {{ post.activeReplyCommentId ? '回复评论' : '发表评论' }}
              </button>
            </view>
          </view>

          <view v-if="post.isCommentLoading" class="comment-state">
            <text class="comment-state__text">评论加载中...</text>
          </view>
          <view v-else-if="!post.commentTreeData.length" class="comment-state">
            <text class="comment-state__text">还没有评论，来写第一条评论吧。</text>
          </view>

          <view v-else class="comment-list">
            <view v-for="comment in post.commentTreeData" :key="comment._id" class="comment-item">
              <image class="comment-item__avatar" :src="comment.avatarUrl || defaultAvatar" mode="aspectFill" />
              <view class="comment-item__body">
                <view class="comment-item__meta">
                  <text class="comment-item__name">{{ comment.nickName }}</text>
                  <text class="comment-item__time">{{ comment.createdAtText }}</text>
                </view>
                <text class="comment-item__content" :class="{ 'comment-item__content--deleted': comment.isDeleted }">{{ comment.content }}</text>
                <view class="comment-item__actions">
                  <text v-if="!comment.isDeleted" class="comment-item__action" @click="startReply(post._id, comment)">回复</text>
                  <text v-if="comment.canDelete" class="comment-item__action comment-item__action--danger" @click="deleteComment(post._id, comment)">删除</text>
                </view>

                <view v-if="comment.replies.length" class="reply-list">
                  <view v-for="reply in comment.replies" :key="reply._id" class="reply-item">
                    <image class="reply-item__avatar" :src="reply.avatarUrl || defaultAvatar" mode="aspectFill" />
                    <view class="reply-item__body">
                      <view class="reply-item__meta">
                        <text class="reply-item__name">{{ reply.nickName }}</text>
                        <text class="reply-item__time">{{ reply.createdAtText }}</text>
                      </view>
                      <text class="reply-item__content" :class="{ 'comment-item__content--deleted': reply.isDeleted }">
                        <text v-if="reply.replyToNickName" class="reply-item__tag">回复 {{ reply.replyToNickName }}：</text>
                        {{ reply.content }}
                      </text>
                      <view class="comment-item__actions">
                        <text v-if="!reply.isDeleted" class="comment-item__action" @click="startReply(post._id, reply)">继续回复</text>
                        <text v-if="reply.canDelete" class="comment-item__action comment-item__action--danger" @click="deleteComment(post._id, reply)">删除</text>
                      </view>
                    </view>
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
import { mapState } from 'vuex'
import { CLOUD_FUNCTIONS, resolveCloudFileSource, resolveCloudFileSourceList } from '@/utils/cloud'
import { YIQUAN_DEFAULT_AVATAR, YIQUAN_DEFAULT_BACKGROUND, YIQUAN_FEED_CACHE_KEY, YIQUAN_LATEST_SUBMITTED_POST_KEY, buildYiquanCommentTree, createEmptyYiquanCommentPanelState, normalizeYiquanComment, normalizeYiquanPost } from '@/utils/yiquan'

const YIQUAN_FEED_CACHE_EXPIRE_MS = 5 * 60 * 1000

export default {
  computed: {
    ...mapState('m_user', ['isLoggedIn', 'userId', 'userProfile']),
    heroDesc() {
      return this.isLoggedIn ? '记录你的漆艺日常与灵感片段' : '登录后即可发布动态、评论与回复'
    },
  },
  data() {
    return {
      defaultAvatar: YIQUAN_DEFAULT_AVATAR,
      defaultHeroBackground: YIQUAN_DEFAULT_BACKGROUND,
      defaultHeroName: '彝圈朋友',
      heroProfile: { nickName: '', avatarResolved: YIQUAN_DEFAULT_AVATAR, backimageResolved: YIQUAN_DEFAULT_BACKGROUND },
      postList: [],
      isLoading: false,
      hasLoadedOnce: false,
    }
  },
  onLoad() {
    console.log('彝圈页面：页面加载完成，准备恢复缓存并拉取最新动态')
    this.restoreFeedCache()
    this.loadHeroProfile()
    this.loadPostList()
  },
  async onShow() {
    console.log('彝圈页面：页面重新显示，准备刷新资料和动态列表')
    this.loadHeroProfile()
    await this.consumeLatestSubmittedPost()
    console.log('彝圈页面：刚提交动态桥接缓存处理完成，准备按需静默刷新列表')
    if (this.hasLoadedOnce) {
      this.loadPostList({ silent: true })
    }
  },
  onPullDownRefresh() {
    console.log('彝圈页面：收到下拉刷新指令')
    this.loadHeroProfile()
    this.loadPostList({ silent: true, stopPullDownRefresh: true })
  },
  methods: {
    // 中文注释：统一生成头部资料展示数据。
    async loadHeroProfile() {
      console.log('彝圈页面：开始加载头部资料')
      const baseProfile = this.userProfile || {}
      const [avatarResolved, backimageResolved] = await Promise.all([
        resolveCloudFileSource(baseProfile.avatarUrl || ''),
        resolveCloudFileSource(baseProfile.backimage || ''),
      ])
      this.heroProfile = {
        nickName: baseProfile.nickName || '',
        avatarResolved: avatarResolved || YIQUAN_DEFAULT_AVATAR,
        backimageResolved: backimageResolved || YIQUAN_DEFAULT_BACKGROUND,
      }

      if (!this.isLoggedIn) {
        console.log('彝圈页面：当前未登录，本次仅使用本地资料展示头部')
        return
      }

      try {
        const response = await wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.GET_USER_PROFILE, data: { id: this.userId || '' } })
        const result = response && response.result ? response.result : {}
        console.log('彝圈页面：用户资料云函数返回结果', result)
        if (result.success && result.data) {
          const [nextAvatarResolved, nextBackimageResolved] = await Promise.all([
            resolveCloudFileSource(result.data.avatarUrl || ''),
            resolveCloudFileSource(result.data.backimage || ''),
          ])
          this.heroProfile = {
            nickName: result.data.nickName || '',
            avatarResolved: nextAvatarResolved || YIQUAN_DEFAULT_AVATAR,
            backimageResolved: nextBackimageResolved || YIQUAN_DEFAULT_BACKGROUND,
          }
          console.log('彝圈页面：云端头部资料同步完成', this.heroProfile)
        }
      } catch (error) {
        console.error('彝圈页面：头部资料拉取失败', error)
      }
    },
    // 中文注释：统一读取并恢复本地动态缓存，让彝圈首屏更快展示。
    async restoreFeedCache() {
      console.log('彝圈页面：开始尝试恢复本地动态缓存')
      try {
        const cacheText = uni.getStorageSync(YIQUAN_FEED_CACHE_KEY)
        if (!cacheText) return
        const cacheData = JSON.parse(cacheText)
        if (!cacheData || !cacheData.timestamp || !Array.isArray(cacheData.list)) return
        if (Date.now() - Number(cacheData.timestamp) > YIQUAN_FEED_CACHE_EXPIRE_MS) return
        this.postList = await this.buildPostList(cacheData.list)
        console.log('彝圈页面：本地动态缓存恢复完成', this.postList.length)
      } catch (error) {
        console.error('彝圈页面：本地动态缓存恢复失败', error)
      }
    },
    // 中文注释：统一写入动态缓存，减少重复进入彝圈时的等待时间。
    writeFeedCache(list) {
      console.log('彝圈页面：开始写入本地动态缓存', list)
      uni.setStorageSync(YIQUAN_FEED_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), list: Array.isArray(list) ? list : [] }))
      console.log('彝圈页面：本地动态缓存写入完成')
    },
    // 中文注释：统一读取发布页桥接缓存，把刚提交的待审核动态立即合并到当前列表。
    async consumeLatestSubmittedPost() {
      console.log('彝圈页面：开始检查是否存在刚提交的待审核动态')
      try {
        const latestPostText = uni.getStorageSync(YIQUAN_LATEST_SUBMITTED_POST_KEY)
        if (!latestPostText) {
          console.log('彝圈页面：没有发现刚提交的待审核动态缓存，直接跳过合并')
          return
        }

        console.log('彝圈页面：已读取刚提交的待审核动态缓存，准备清理缓存')
        uni.removeStorageSync(YIQUAN_LATEST_SUBMITTED_POST_KEY)
        console.log('彝圈页面：刚提交的待审核动态缓存清理完成')

        const latestPost = JSON.parse(latestPostText)
        console.log('彝圈页面：刚提交的待审核动态解析完成', latestPost)

        if (!latestPost || !latestPost._id) {
          console.log('彝圈页面：刚提交的待审核动态数据无效，停止合并')
          return
        }

        const rawPostList = [latestPost, ...this.postList.map((post) => post.rawData || post)]
        const mergedRawPostList = this.mergeWithLocalPrivatePostList(rawPostList)
        this.postList = await this.buildPostList(mergedRawPostList)
        this.writeFeedCache(mergedRawPostList)
        this.hasLoadedOnce = true
        console.log('彝圈页面：刚提交的待审核动态已合并到当前列表', latestPost._id)
      } catch (error) {
        console.error('彝圈页面：合并刚提交的待审核动态失败', error)
        uni.removeStorageSync(YIQUAN_LATEST_SUBMITTED_POST_KEY)
        console.log('彝圈页面：异常场景下已清理刚提交动态缓存')
      }
    },
    // 中文注释：统一保留本地可见的本人非公开动态，避免静默刷新时被旧云函数结果覆盖掉。
    mergeWithLocalPrivatePostList(rawPostList) {
      console.log('彝圈页面：开始合并云端动态和本地本人待审核动态', rawPostList)
      const safeRawPostList = Array.isArray(rawPostList) ? rawPostList.filter((post) => post && post._id) : []
      const rawPostIdMap = safeRawPostList.reduce((map, post) => {
        map[post._id] = true
        return map
      }, {})
      const localPrivatePostList = this.postList
        .filter((post) => post && post._id && post.status !== 'approved' && post.canDelete && !rawPostIdMap[post._id])
        .map((post) => post.rawData || post)

      console.log('彝圈页面：本地本人非公开动态筛选完成', localPrivatePostList)
      const mergedPostMap = [...safeRawPostList, ...localPrivatePostList].reduce((map, post) => {
        if (post && post._id && post.status !== 'deleted') {
          map[post._id] = post
        }
        return map
      }, {})
      const mergedPostList = Object.keys(mergedPostMap)
        .map((postId) => mergedPostMap[postId])
        .sort((currentPost, nextPost) => Number(nextPost.createdAt || 0) - Number(currentPost.createdAt || 0))
      console.log('彝圈页面：云端动态和本地本人待审核动态合并完成', mergedPostList)
      return mergedPostList
    },
    // 中文注释：统一校验登录态，避免未登录时继续执行发布、评论和删除动作。
    async ensureLoggedIn(actionText) {
      console.log('彝圈页面：开始校验登录状态', { actionText, isLoggedIn: this.isLoggedIn })
      if (this.isLoggedIn) return true
      uni.showToast({ title: `请先登录后再${actionText}`, icon: 'none' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/my/my' })
      }, 300)
      return false
    },
    // 中文注释：统一构建动态列表视图模型，并保留当前页评论面板状态。
    async buildPostList(rawPostList) {
      console.log('彝圈页面：开始构建动态视图模型列表', rawPostList)
      const currentPostMap = this.postList.reduce((map, item) => {
        map[item._id] = item
        return map
      }, {})
      const postList = await Promise.all((Array.isArray(rawPostList) ? rawPostList : []).map(async (rawPost) => {
        const basePost = normalizeYiquanPost(rawPost, this.userId || '')
        const currentPost = currentPostMap[basePost._id]
        const localState = currentPost || createEmptyYiquanCommentPanelState()
        const [avatarResolved, imageListResolved] = await Promise.all([
          resolveCloudFileSource(basePost.avatarUrl || ''),
          resolveCloudFileSourceList(basePost.imageList || []),
        ])
        return {
          ...basePost,
          isCommentPanelVisible: Boolean(localState.isCommentPanelVisible),
          isCommentLoading: Boolean(localState.isCommentLoading),
          isCommentLoaded: Boolean(localState.isCommentLoaded),
          isCommentSubmitting: Boolean(localState.isCommentSubmitting),
          commentInput: localState.commentInput || '',
          commentList: Array.isArray(localState.commentList) ? localState.commentList : [],
          commentTreeData: Array.isArray(localState.commentTreeData) ? localState.commentTreeData : [],
          activeReplyCommentId: localState.activeReplyCommentId || '',
          activeReplyNickName: localState.activeReplyNickName || '',
          isCommentInputFocused: Boolean(localState.isCommentInputFocused),
          avatarUrl: avatarResolved || YIQUAN_DEFAULT_AVATAR,
          imageList: imageListResolved,
          rawData: { ...rawPost },
        }
      }))
      console.log('彝圈页面：动态视图模型列表构建完成', postList.length)
      return postList
    },
    // 中文注释：统一更新指定动态对象，保证单条动态局部刷新时不影响其他项。
    updatePost(postId, updater) {
      console.log('彝圈页面：开始更新指定动态状态', postId)
      this.postList = this.postList.map((post) => {
        if (post._id !== postId) return post
        return typeof updater === 'function' ? updater(post) : { ...post, ...updater }
      })
      console.log('彝圈页面：指定动态状态更新完成', this.postList)
    },
    // 中文注释：统一转换动态审核状态文案，便于用户看到自己动态当前进度。
    getPostStatusText(status) {
      console.log('彝圈页面：开始转换动态审核状态文案', status)
      const statusTextMap = {
        pending: '待审核',
        rejected: '已驳回',
        approved: '已通过',
      }
      const statusText = statusTextMap[status] || '审核中'
      console.log('彝圈页面：动态审核状态文案转换完成', statusText)
      return statusText
    },
    // 中文注释：统一生成自己非公开动态的提示文案，避免待审核动态被误认为已公开。
    getPostReviewTip(post) {
      console.log('彝圈页面：开始生成动态审核提示文案', post)
      if (!post || post.status === 'approved') {
        console.log('彝圈页面：当前动态已公开，无需展示审核提示')
        return ''
      }

      if (post.status === 'rejected') {
        const rejectedText = post.reviewRemark
          ? `这条动态未通过审核：${post.reviewRemark}`
          : '这条动态未通过审核，只有你自己可见。'
        console.log('彝圈页面：已生成驳回提示文案', rejectedText)
        return rejectedText
      }

      console.log('彝圈页面：已生成待审核提示文案')
      return '这条动态正在等待管理员审核，当前只有你自己可见。'
    },
    // 中文注释：统一加载已审核通过的彝圈动态列表。
    async loadPostList(options = {}) {
      const silent = Boolean(options.silent)
      const stopPullDownRefresh = Boolean(options.stopPullDownRefresh)
      console.log('彝圈页面：开始加载动态列表', options)
      if (this.isLoading) return
      this.isLoading = true
      let hasShownLoading = false
      if (!silent) {
        uni.showLoading({ title: '加载彝圈中', mask: true })
        hasShownLoading = true
      }
      try {
        const response = await wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.GET_YIQUAN_POSTS, data: { pageSize: 30 } })
        const result = response && response.result ? response.result : {}
        console.log('彝圈页面：获取彝圈动态云函数返回结果', result)
        if (!result.success) throw new Error(result.message || '动态加载失败')
        const rawPostList = result && result.data && Array.isArray(result.data.list) ? result.data.list : []
        const mergedRawPostList = this.mergeWithLocalPrivatePostList(rawPostList)
        this.postList = await this.buildPostList(mergedRawPostList)
        this.writeFeedCache(mergedRawPostList)
        this.hasLoadedOnce = true
      } catch (error) {
        console.error('彝圈页面：动态列表加载失败', error)
        if (!this.postList.length) {
          uni.showToast({ title: error.message || '动态加载失败', icon: 'none' })
        }
      } finally {
        this.isLoading = false
        if (hasShownLoading) uni.hideLoading()
        if (stopPullDownRefresh) uni.stopPullDownRefresh()
        console.log('彝圈页面：动态列表加载流程结束')
      }
    },
    // 中文注释：统一控制评论面板展开和按需拉取评论。
    async toggleCommentPanel(post) {
      console.log('彝圈页面：开始切换评论面板显示状态', post)
      if (!post || !post._id) return
      if (post.isCommentPanelVisible) {
        this.updatePost(post._id, { isCommentPanelVisible: false, isCommentInputFocused: false })
        return
      }
      this.updatePost(post._id, { isCommentPanelVisible: true })
      if (!post.isCommentLoaded) await this.loadComments(post._id)
    },
    // 中文注释：统一加载指定动态评论，并构建回复树。
    async loadComments(postId) {
      console.log('彝圈页面：开始加载指定动态评论', postId)
      const currentPost = this.postList.find((post) => post._id === postId)
      if (!currentPost || currentPost.isCommentLoading) return
      this.updatePost(postId, { isCommentLoading: true, isCommentPanelVisible: true })
      try {
        const response = await wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.GET_YIQUAN_COMMENTS, data: { postId, pageSize: 200 } })
        const result = response && response.result ? response.result : {}
        console.log('彝圈页面：获取彝圈评论云函数返回结果', result)
        if (!result.success) throw new Error(result.message || '评论加载失败')
        const rawCommentList = result && result.data && Array.isArray(result.data.list) ? result.data.list : []
        const commentList = await Promise.all(rawCommentList.map(async (rawComment) => {
          const comment = normalizeYiquanComment(rawComment, this.userId || '')
          return {
            ...comment,
            avatarUrl: (await resolveCloudFileSource(comment.avatarUrl || '')) || YIQUAN_DEFAULT_AVATAR,
          }
        }))
        this.updatePost(postId, (post) => ({
          ...post,
          commentList,
          commentTreeData: buildYiquanCommentTree(commentList),
          isCommentLoading: false,
          isCommentLoaded: true,
        }))
      } catch (error) {
        console.error('彝圈页面：指定动态评论加载失败', error)
        this.updatePost(postId, { isCommentLoading: false })
        uni.showToast({ title: error.message || '评论加载失败', icon: 'none' })
      }
    },
    // 中文注释：统一同步评论输入内容，保证每条动态的草稿互不影响。
    handleCommentInput(postId, event) {
      const value = event && event.detail ? event.detail.value : ''
      console.log('彝圈页面：收到评论输入事件', { postId, value })
      this.updatePost(postId, { commentInput: value })
    },
    // 中文注释：统一进入回复态，后续提交评论时会自动带上父评论链路。
    async startReply(postId, comment) {
      console.log('彝圈页面：开始进入评论回复状态', { postId, comment })
      if (!(await this.ensureLoggedIn('回复评论'))) return
      if (!comment || !comment._id || comment.isDeleted) return
      this.updatePost(postId, { activeReplyCommentId: comment._id, activeReplyNickName: comment.nickName || '这条评论', isCommentInputFocused: true, isCommentPanelVisible: true })
    },
    // 中文注释：统一取消回复态，恢复普通评论输入。
    cancelReply(postId) {
      console.log('彝圈页面：开始取消评论回复状态', postId)
      this.updatePost(postId, { activeReplyCommentId: '', activeReplyNickName: '', isCommentInputFocused: false })
    },
    // 中文注释：统一提交评论和回复评论，成功后直接写回本地评论树。
    async submitComment(post) {
      console.log('彝圈页面：开始提交评论', post)
      if (!(await this.ensureLoggedIn('发表评论'))) return
      if (!post || !post._id || post.isCommentSubmitting) return
      const content = (post.commentInput || '').trim()
      if (!content) {
        uni.showToast({ title: '评论内容不能为空', icon: 'none' })
        return
      }
      this.updatePost(post._id, { isCommentSubmitting: true })
      try {
        const response = await wx.cloud.callFunction({
          name: CLOUD_FUNCTIONS.CREATE_YIQUAN_COMMENT,
          data: { postId: post._id, parentCommentId: post.activeReplyCommentId || '', content },
        })
        const result = response && response.result ? response.result : {}
        console.log('彝圈页面：创建彝圈评论云函数返回结果', result)
        if (!result.success || !result.data) throw new Error(result.message || '评论提交失败')
        const comment = normalizeYiquanComment(result.data, this.userId || '')
        const nextComment = { ...comment, avatarUrl: (await resolveCloudFileSource(comment.avatarUrl || '')) || YIQUAN_DEFAULT_AVATAR }
        this.updatePost(post._id, (currentPost) => {
          const commentList = [...currentPost.commentList, nextComment]
          const commentCount = Math.max(0, Number(currentPost.commentCount || 0) + 1)
          return {
            ...currentPost,
            commentInput: '',
            activeReplyCommentId: '',
            activeReplyNickName: '',
            isCommentInputFocused: false,
            isCommentSubmitting: false,
            commentList,
            commentTreeData: buildYiquanCommentTree(commentList),
            commentCount,
            rawData: { ...(currentPost.rawData || {}), commentCount },
          }
        })
        uni.showToast({ title: result.message || '评论成功', icon: 'success' })
      } catch (error) {
        console.error('彝圈页面：评论提交流程失败', error)
        this.updatePost(post._id, { isCommentSubmitting: false })
        uni.showToast({ title: error.message || '评论提交失败', icon: 'none' })
      }
    },
    // 中文注释：统一删除自己的评论，兼容软删除和硬删除两种结果。
    async deleteComment(postId, comment) {
      console.log('彝圈页面：开始删除评论', { postId, comment })
      if (!(await this.ensureLoggedIn('删除评论'))) return
      if (!comment || !comment._id || !comment.canDelete) {
        uni.showToast({ title: '只能删除自己的评论', icon: 'none' })
        return
      }
      const modalResult = await uni.showModal({ title: '提示', content: '确认删除这条评论吗？若仍有回复，将保留回复链并显示“该评论已删除”。' })
      if (!modalResult.confirm) return
      try {
        const response = await wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.DELETE_YIQUAN_COMMENT, data: { commentId: comment._id } })
        const result = response && response.result ? response.result : {}
        console.log('彝圈页面：删除彝圈评论云函数返回结果', result)
        if (!result.success || !result.data) throw new Error(result.message || '评论删除失败')
        this.updatePost(postId, (post) => {
          let commentList = [...post.commentList]
          let commentCount = Math.max(0, Number(post.commentCount || 0))
          if (result.data.deleteMode === 'hard') {
            commentList = commentList.filter((item) => item._id !== result.data.commentId)
            commentCount = Math.max(0, commentCount - 1)
          } else {
            commentList = commentList.map((item) => item._id === result.data.commentId ? normalizeYiquanComment({ ...item, content: '该评论已删除', status: 'deleted', isDeleted: true, canDelete: false }, this.userId || '') : item)
          }
          if (result.data.parentCommentId) {
            commentList = commentList.map((item) => item._id === result.data.parentCommentId ? normalizeYiquanComment({ ...item, replyCount: Math.max(0, Number(item.replyCount || 0) - 1) }, this.userId || '') : item)
          }
          return {
            ...post,
            commentList,
            commentTreeData: buildYiquanCommentTree(commentList),
            commentCount,
            rawData: { ...(post.rawData || {}), commentCount },
            activeReplyCommentId: post.activeReplyCommentId === comment._id ? '' : post.activeReplyCommentId,
            activeReplyNickName: post.activeReplyCommentId === comment._id ? '' : post.activeReplyNickName,
          }
        })
        uni.showToast({ title: result.message || '评论删除成功', icon: 'success' })
      } catch (error) {
        console.error('彝圈页面：评论删除流程失败', error)
        uni.showToast({ title: error.message || '评论删除失败', icon: 'none' })
      }
    },
    // 中文注释：统一删除自己的动态，成功后同步更新本地缓存。
    async deletePost(post) {
      console.log('彝圈页面：开始删除动态', post)
      if (!(await this.ensureLoggedIn('删除动态'))) return
      if (!post || !post._id || !post.canDelete) {
        uni.showToast({ title: '只能删除自己的动态', icon: 'none' })
        return
      }
      const modalResult = await uni.showModal({ title: '提示', content: '确认删除这条动态吗？删除后这条动态下的评论也会一起清理。' })
      if (!modalResult.confirm) return
      try {
        const response = await wx.cloud.callFunction({ name: CLOUD_FUNCTIONS.DELETE_YIQUAN_POST, data: { postId: post._id } })
        const result = response && response.result ? response.result : {}
        console.log('彝圈页面：删除彝圈动态云函数返回结果', result)
        if (!result.success) throw new Error(result.message || '动态删除失败')
        this.postList = this.postList.filter((item) => item._id !== post._id)
        this.writeFeedCache(this.postList.map((item) => item.rawData || {}))
        uni.showToast({ title: result.message || '动态删除成功', icon: 'success' })
      } catch (error) {
        console.error('彝圈页面：动态删除流程失败', error)
        uni.showToast({ title: error.message || '动态删除失败', icon: 'none' })
      }
    },
    // 中文注释：统一预览动态九宫格图片。
    previewPostImage(post, imageIndex) {
      console.log('彝圈页面：开始预览动态图片', { post, imageIndex })
      if (!post || !Array.isArray(post.imageList) || !post.imageList.length) return
      uni.previewImage({ current: post.imageList[imageIndex] || post.imageList[0], urls: post.imageList })
    },
    // 中文注释：统一执行页面跳转，避免模板层分散导航逻辑。
    goToLogin() {
      console.log('彝圈页面：准备切换到我的页面')
      uni.switchTab({ url: '/pages/my/my' })
    },
    goToPublish() {
      console.log('彝圈页面：准备跳转到彝圈发布页')
      uni.navigateTo({ url: '/pages/yiquan/publish' })
    },
  },
}
</script>

<style lang="scss">
.yiquan-page { min-height: 100vh; padding-bottom: 56rpx; background: linear-gradient(180deg, #f4eee8 0%, #f8f7f5 100%); }
.hero { position: relative; height: 420rpx; overflow: hidden; }
.hero__bg, .hero__mask { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero__mask { background: linear-gradient(180deg, rgba(18, 10, 8, 0.12) 0%, rgba(18, 10, 8, 0.56) 100%); }
.hero__content { position: absolute; left: 32rpx; right: 32rpx; bottom: 34rpx; display: flex; align-items: flex-end; justify-content: space-between; }
.hero__user { display: flex; align-items: center; }
.hero__avatar { width: 114rpx; height: 114rpx; border: 4rpx solid rgba(255,255,255,.76); border-radius: 24rpx; }
.hero__info { display: flex; flex-direction: column; margin-left: 18rpx; }
.hero__name { font-size: 36rpx; font-weight: 700; color: #fff; }
.hero__desc { margin-top: 10rpx; font-size: 24rpx; color: rgba(255,255,255,.86); }
.hero__button { margin: 0; padding: 0 30rpx; height: 72rpx; line-height: 72rpx; border-radius: 999rpx; background: rgba(255,255,255,.22); border: 1rpx solid rgba(255,255,255,.35); font-size: 26rpx; color: #fff; }
.notice-card, .state-card, .post-card { margin: 24rpx 24rpx 0; padding: 28rpx; border-radius: 28rpx; background: rgba(255,255,255,.94); box-shadow: 0 18rpx 36rpx rgba(78,48,31,.08); }
.notice-card__title { display: block; font-size: 30rpx; font-weight: 700; color: #2f2723; }
.notice-card__text, .state-card__text { display: block; margin-top: 12rpx; font-size: 24rpx; line-height: 1.7; color: #7f7168; }
.post-card__header, .post-card__toolbar, .comment-editor__reply, .comment-editor__footer, .comment-item__meta, .reply-item__meta { display: flex; align-items: center; justify-content: space-between; }
.post-card__user { display: flex; align-items: center; }
.post-card__avatar { width: 88rpx; height: 88rpx; border-radius: 22rpx; background: #efe7df; }
.post-card__meta { display: flex; flex-direction: column; margin-left: 18rpx; }
.post-card__name { font-size: 30rpx; font-weight: 700; color: #2f2723; }
.post-card__time { margin-top: 8rpx; font-size: 22rpx; color: #998a80; }
.post-card__delete, .comment-item__action--danger, .comment-editor__reply-cancel { color: #b73324; }
.post-card__header-actions { display: flex; align-items: center; gap: 18rpx; }
.post-card__status { padding: 6rpx 14rpx; border-radius: 999rpx; background: #f5e6d8; font-size: 22rpx; color: #8f1d22; }
.post-card__review-tip { margin-top: 18rpx; padding: 16rpx 20rpx; border-radius: 18rpx; background: #fff4df; font-size: 24rpx; line-height: 1.6; color: #8a5a16; }
.post-card__content { display: block; margin-top: 22rpx; font-size: 30rpx; line-height: 1.8; color: #433933; word-break: break-all; }
.post-card__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; margin-top: 22rpx; }
.post-card__image { width: 100%; height: 210rpx; border-radius: 18rpx; background: #f1ede8; }
.post-card__image--single { width: 360rpx; }
.post-card__toolbar { margin-top: 24rpx; padding-top: 18rpx; border-top: 1rpx solid #f0e7df; }
.post-card__toolbar-text, .post-card__toolbar-action, .comment-item__action, .comment-editor__reply-text, .comment-editor__count, .comment-state__text { font-size: 24rpx; color: #7d6f66; }
.post-card__toolbar-action { color: #8f1d22; }
.comment-panel { margin-top: 22rpx; padding: 22rpx; border-radius: 22rpx; background: #f8f4ef; }
.comment-editor { padding: 20rpx; border-radius: 20rpx; background: #fff; }
.comment-editor__textarea { width: 100%; min-height: 120rpx; margin-top: 16rpx; font-size: 28rpx; line-height: 1.7; color: #3e332d; }
.comment-editor__submit { margin: 0; padding: 0 28rpx; border-radius: 999rpx; background: linear-gradient(90deg, #8f1d22 0%, #c53f2b 100%); color: #fff; }
.comment-state { margin-top: 18rpx; padding: 24rpx 10rpx 8rpx; text-align: center; }
.comment-list { margin-top: 20rpx; }
.comment-item, .reply-item { display: flex; align-items: flex-start; }
.comment-item { margin-bottom: 24rpx; }
.comment-item:last-child, .reply-item:last-child { margin-bottom: 0; }
.comment-item__avatar { width: 64rpx; height: 64rpx; border-radius: 18rpx; background: #efe7df; }
.comment-item__body { flex: 1; margin-left: 16rpx; }
.comment-item__name, .reply-item__name { font-size: 26rpx; font-weight: 600; color: #2f2723; }
.comment-item__time, .reply-item__time { font-size: 22rpx; color: #a39388; }
.comment-item__content, .reply-item__content { display: block; margin-top: 10rpx; font-size: 26rpx; line-height: 1.7; color: #433933; word-break: break-all; }
.comment-item__content--deleted { color: #9b8c82; font-style: italic; }
.comment-item__actions { display: flex; align-items: center; gap: 24rpx; margin-top: 14rpx; }
.reply-list { margin-top: 18rpx; padding: 18rpx; border-radius: 18rpx; background: #fff; }
.reply-item { margin-bottom: 18rpx; }
.reply-item__avatar { width: 50rpx; height: 50rpx; border-radius: 14rpx; background: #efe7df; }
.reply-item__body { flex: 1; margin-left: 14rpx; }
.reply-item__tag { color: #8f1d22; }
</style>
