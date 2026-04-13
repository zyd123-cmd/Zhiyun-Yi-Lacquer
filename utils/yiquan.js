export const YIQUAN_FEED_CACHE_KEY = 'yiquanFeedCacheV1'
// 中文注释：记录刚提交成功的动态，返回彝圈列表页时可立即展示待审核状态。
export const YIQUAN_LATEST_SUBMITTED_POST_KEY = 'yiquanLatestSubmittedPostV1'
export const YIQUAN_DEFAULT_AVATAR = '/static/myicon/user.png'
export const YIQUAN_DEFAULT_BACKGROUND = '/static/logo.png'

// 中文注释：统一规整文本内容，避免页面层和云函数层出现空字符串判断不一致。
export function normalizeYiquanText(value) {
  console.log('彝圈工具模块：开始规整文本内容', value)
  const normalizedText = typeof value === 'string' ? value.trim() : ''
  console.log('彝圈工具模块：文本内容规整完成', normalizedText)
  return normalizedText
}

// 中文注释：统一格式化时间文案，尽量让彝圈列表更接近朋友圈的阅读习惯。
export function formatYiquanTime(timestamp) {
  console.log('彝圈工具模块：开始格式化时间文案', timestamp)
  const numericTimestamp = Number(timestamp || 0)

  if (!numericTimestamp) {
    console.log('彝圈工具模块：当前时间戳为空，直接返回默认文案')
    return '刚刚'
  }

  const now = Date.now()
  const diff = Math.max(0, now - numericTimestamp)

  if (diff < 60 * 1000) {
    console.log('彝圈工具模块：当前时间差小于一分钟，返回刚刚')
    return '刚刚'
  }

  if (diff < 60 * 60 * 1000) {
    const minute = Math.max(1, Math.floor(diff / (60 * 1000)))
    const minuteText = `${minute}分钟前`
    console.log('彝圈工具模块：当前时间差小于一小时，返回分钟文案', minuteText)
    return minuteText
  }

  if (diff < 24 * 60 * 60 * 1000) {
    const hour = Math.max(1, Math.floor(diff / (60 * 60 * 1000)))
    const hourText = `${hour}小时前`
    console.log('彝圈工具模块：当前时间差小于一天，返回小时文案', hourText)
    return hourText
  }

  const date = new Date(numericTimestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const formattedText = `${year}-${month}-${day} ${hour}:${minute}`
  console.log('彝圈工具模块：时间文案格式化完成', formattedText)
  return formattedText
}

// 中文注释：统一创建彝圈评论面板的空状态，避免页面在首次渲染时出现缺字段问题。
export function createEmptyYiquanCommentPanelState() {
  console.log('彝圈工具模块：开始创建空评论面板状态')
  const emptyState = {
    isCommentPanelVisible: false,
    isCommentLoading: false,
    isCommentLoaded: false,
    isCommentSubmitting: false,
    commentInput: '',
    commentList: [],
    commentTreeData: [],
    activeReplyCommentId: '',
    activeReplyNickName: '',
    isCommentInputFocused: false,
  }
  console.log('彝圈工具模块：空评论面板状态创建完成', emptyState)
  return emptyState
}

// 中文注释：统一规整彝圈动态数据结构，确保页面层使用的字段稳定一致。
export function normalizeYiquanPost(post, currentUserId = '') {
  console.log('彝圈工具模块：开始规整彝圈动态数据', post)
  const normalizedPost = {
    _id: post && post._id ? post._id : '',
    userId: post && post.userId ? post.userId : '',
    nickName: normalizeYiquanText(post && post.nickName) || '微信用户',
    avatarUrl: post && post.avatarUrl ? post.avatarUrl : '',
    content: normalizeYiquanText(post && post.content),
    imageList: Array.isArray(post && post.imageList) ? post.imageList.filter((item) => item) : [],
    status: post && post.status ? post.status : 'approved',
    reviewRemark: normalizeYiquanText(post && post.reviewRemark),
    commentCount: Math.max(0, Number(post && post.commentCount) || 0),
    createdAt: Number((post && post.createdAt) || 0),
    updatedAt: Number((post && post.updatedAt) || 0),
    createdAtText: formatYiquanTime(post && post.createdAt),
    isOwner: Boolean(currentUserId && post && post.userId === currentUserId),
    canDelete:
      Boolean(post && post.canDelete) ||
      Boolean(currentUserId && post && post.userId === currentUserId),
  }
  console.log('彝圈工具模块：彝圈动态数据规整完成', normalizedPost)
  return normalizedPost
}

// 中文注释：统一规整彝圈评论数据结构，兼容普通评论、回复评论与已删除占位评论。
export function normalizeYiquanComment(comment, currentUserId = '') {
  console.log('彝圈工具模块：开始规整彝圈评论数据', comment)
  const status = comment && comment.status ? comment.status : 'active'
  const isDeleted = Boolean(comment && comment.isDeleted) || status === 'deleted'
  const normalizedComment = {
    _id: comment && comment._id ? comment._id : '',
    postId: comment && comment.postId ? comment.postId : '',
    userId: comment && comment.userId ? comment.userId : '',
    nickName: normalizeYiquanText(comment && comment.nickName) || '微信用户',
    avatarUrl: comment && comment.avatarUrl ? comment.avatarUrl : '',
    content: isDeleted ? '该评论已删除' : normalizeYiquanText(comment && comment.content),
    parentCommentId: comment && comment.parentCommentId ? comment.parentCommentId : '',
    rootCommentId: comment && comment.rootCommentId ? comment.rootCommentId : '',
    replyToCommentId: comment && comment.replyToCommentId ? comment.replyToCommentId : '',
    replyToUserId: comment && comment.replyToUserId ? comment.replyToUserId : '',
    replyToNickName: normalizeYiquanText(comment && comment.replyToNickName),
    replyCount: Math.max(0, Number(comment && comment.replyCount) || 0),
    createdAt: Number((comment && comment.createdAt) || 0),
    updatedAt: Number((comment && comment.updatedAt) || 0),
    createdAtText: formatYiquanTime(comment && comment.createdAt),
    isDeleted,
    status,
    isOwner:
      Boolean(comment && comment.isOwner) ||
      Boolean(currentUserId && comment && comment.userId === currentUserId),
    canDelete:
      !isDeleted &&
      (
        Boolean(comment && comment.canDelete) ||
        Boolean(currentUserId && comment && comment.userId === currentUserId)
      ),
  }
  console.log('彝圈工具模块：彝圈评论数据规整完成', normalizedComment)
  return normalizedComment
}

// 中文注释：统一把平铺评论整理成“根评论 + 回复列表”的树形结构，便于页面直接渲染。
export function buildYiquanCommentTree(commentList = []) {
  console.log('彝圈工具模块：开始构建彝圈评论树', commentList)
  const commentNodeMap = {}
  const rootCommentList = []

  commentList.forEach((comment) => {
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
    (currentComment, nextComment) => Number(nextComment.createdAt || 0) - Number(currentComment.createdAt || 0)
  )

  rootCommentList.forEach((rootComment) => {
    rootComment.replies.sort(
      (currentReply, nextReply) => Number(currentReply.createdAt || 0) - Number(nextReply.createdAt || 0)
    )
  })

  console.log('彝圈工具模块：彝圈评论树构建完成', rootCommentList)
  return rootCommentList
}
