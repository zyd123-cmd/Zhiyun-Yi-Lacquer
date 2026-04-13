const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保评论查询始终工作在当前云环境下。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，后续评论、点赞记录和用户资料都通过这里查询。
const db = cloud.database()
const COMMENT_COLLECTION_NAME = 'article_comments'
const COMMENT_LIKE_COLLECTION_NAME = 'article_comment_likes'
const USER_COLLECTION_NAME = 'user'

// 中文注释：统一规范化评论分页大小，避免单次查询过大拖慢文章详情页。
function normalizePageSize(pageSize) {
  console.log('获取文章评论云函数：开始规范化评论分页大小', pageSize)
  const normalizedSize = Math.min(Math.max(Number(pageSize) || 50, 1), 200)
  console.log('获取文章评论云函数：评论分页大小规范化完成', normalizedSize)
  return normalizedSize
}

// 中文注释：统一按 openid 查询当前项目用户，仅保留后续权限判断需要的字段。
async function getUserByOpenId(openid) {
  console.log('获取文章评论云函数：开始按 openid 查询用户资料', openid)

  if (!openid) {
    console.log('获取文章评论云函数：当前 openid 为空，直接返回空用户资料')
    return null
  }

  const response = await db
    .collection(USER_COLLECTION_NAME)
    .where({
      openid,
    })
    .field({
      _id: true,
    })
    .limit(1)
    .get()

  const userProfile = response.data[0] || null
  console.log('获取文章评论云函数：用户资料查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：统一查询当前文章下的评论列表，并在数据库层按创建时间排序，减少前端和云函数的二次计算。
async function listComments(articleId, pageSize) {
  console.log('获取文章评论云函数：开始查询文章评论列表', {
    articleId,
    pageSize,
  })
  const response = await db
    .collection(COMMENT_COLLECTION_NAME)
    .where({
      articleId,
    })
    .field({
      _id: true,
      articleId: true,
      userId: true,
      openid: true,
      nickName: true,
      avatarUrl: true,
      content: true,
      parentCommentId: true,
      rootCommentId: true,
      replyToCommentId: true,
      replyToUserId: true,
      replyToNickName: true,
      likeCount: true,
      replyCount: true,
      createdAt: true,
      updatedAt: true,
      status: true,
    })
    .limit(pageSize)
    .get()

  const commentList = Array.isArray(response.data)
    ? response.data.filter(
        (comment) =>
          !comment.status || comment.status === 'active' || comment.status === 'deleted'
      ).sort(
        (currentComment, nextComment) =>
          Number(currentComment.createdAt || 0) - Number(nextComment.createdAt || 0)
      )
    : []
  console.log('获取文章评论云函数：文章评论列表查询完成', commentList.length)
  return commentList
}

// 中文注释：统一读取当前用户在当前文章下点过赞的评论 id，避免先扫用户全部点赞记录再做内存过滤。
async function getLikedCommentIdSet(articleId, userId) {
  console.log('获取文章评论云函数：开始查询当前用户已点赞的评论集合', {
    articleId,
    userId,
  })

  if (!articleId || !userId) {
    console.log('获取文章评论云函数：当前文章 id 或用户 id 为空，直接返回空点赞集合')
    return new Set()
  }

  const response = await db
    .collection(COMMENT_LIKE_COLLECTION_NAME)
    .where({
      articleId,
      userId,
    })
    .field({
      commentId: true,
    })
    .limit(200)
    .get()

  const likedCommentIdSet = new Set(
    (Array.isArray(response.data) ? response.data : []).map((item) => item.commentId)
  )
  console.log('获取文章评论云函数：已点赞评论集合查询完成', likedCommentIdSet.size)
  return likedCommentIdSet
}

// 中文注释：统一把评论列表格式化成前端直接可渲染的结构。
function formatCommentList(commentList, likedCommentIdSet, currentUserId, currentOpenid) {
  console.log('获取文章评论云函数：开始格式化评论列表结果', {
    commentLength: Array.isArray(commentList) ? commentList.length : 0,
    likedLength: likedCommentIdSet.size,
    currentUserId,
  })

  const formattedList = (Array.isArray(commentList) ? commentList : []).map((comment) => {
    const status = comment.status || 'active'
    const isDeleted = status === 'deleted'

    return {
      _id: comment._id,
      articleId: comment.articleId,
      userId: comment.userId,
      nickName: comment.nickName || '微信用户',
      avatarUrl: comment.avatarUrl || '',
      content: isDeleted ? '该评论已删除' : comment.content || '',
      parentCommentId: comment.parentCommentId || '',
      rootCommentId: comment.rootCommentId || '',
      replyToCommentId: comment.replyToCommentId || '',
      replyToUserId: comment.replyToUserId || '',
      replyToNickName: comment.replyToNickName || '',
      likeCount: Number(comment.likeCount || 0),
      replyCount: Number(comment.replyCount || 0),
      createdAt: Number(comment.createdAt || 0),
      updatedAt: Number(comment.updatedAt || 0),
      isLiked: isDeleted ? false : likedCommentIdSet.has(comment._id),
      isOwner:
        Boolean(currentUserId && comment.userId === currentUserId) ||
        Boolean(currentOpenid && comment.openid === currentOpenid),
      canDelete:
        (
          Boolean(currentUserId && comment.userId === currentUserId) ||
          Boolean(currentOpenid && comment.openid === currentOpenid)
        ) &&
        !isDeleted,
      isDeleted,
      status,
    }
  })

  console.log('获取文章评论云函数：评论列表格式化完成', formattedList.length)
  return formattedList
}

// 中文注释：云函数主入口，负责返回文章评论列表和当前用户对应的点赞状态。
exports.main = async (event) => {
  console.log('获取文章评论云函数：收到文章评论查询请求', event || {})
  const articleId = event && typeof event.articleId === 'string' ? event.articleId.trim() : ''
  const pageSize = normalizePageSize(event && event.pageSize)

  if (!articleId) {
    console.log('获取文章评论云函数：当前缺少文章 id，直接返回失败结果')
    return {
      success: false,
      data: {
        list: [],
        totalCount: 0,
      },
      message: '缺少文章 id',
    }
  }

  try {
    // 中文注释：先获取当前微信身份，后续会用来补齐当前登录用户对应的评论权限和点赞状态。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('获取文章评论云函数：当前微信 openid 解析完成', openid)

    const [currentUserProfile, commentList] = await Promise.all([
      getUserByOpenId(openid),
      listComments(articleId, pageSize),
    ])
    const currentUserId = currentUserProfile ? currentUserProfile._id : ''
    console.log('获取文章评论云函数：当前项目用户 id 解析完成', currentUserId)

    const likedCommentIdSet = await getLikedCommentIdSet(articleId, currentUserId)
    const formattedList = formatCommentList(commentList, likedCommentIdSet, currentUserId, openid)

    console.log('获取文章评论云函数：文章评论查询流程执行完成，准备返回前端', {
      articleId,
      totalCount: formattedList.length,
      currentUserId,
    })
    return {
      success: true,
      data: {
        list: formattedList,
        totalCount: formattedList.length,
        currentUserId,
      },
      message: '获取文章评论成功',
    }
  } catch (error) {
    console.error('获取文章评论云函数：文章评论查询失败', error)
    return {
      success: false,
      data: {
        list: [],
        totalCount: 0,
      },
      message: '获取文章评论失败',
      errorMessage: error.message || '',
    }
  }
}
