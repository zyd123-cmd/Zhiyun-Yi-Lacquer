const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保彝圈评论查询运行在当前云环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，后续评论和用户资料查询都会通过这里执行。
const db = cloud.database()
const COMMENT_COLLECTION_NAME = 'yiquan_post_comments'
const USER_COLLECTION_NAME = 'user'

// 中文注释：统一规范评论分页大小，避免单条动态一次性拉取过多评论。
function normalizePageSize(pageSize) {
  console.log('获取彝圈评论云函数：开始规范分页大小', pageSize)
  const normalizedPageSize = Math.min(Math.max(Number(pageSize) || 80, 1), 200)
  console.log('获取彝圈评论云函数：分页大小规范完成', normalizedPageSize)
  return normalizedPageSize
}

// 中文注释：按 openid 查询当前用户，用于返回评论删除权限。
async function getUserByOpenId(openid) {
  console.log('获取彝圈评论云函数：开始按 openid 查询当前用户', openid)

  if (!openid) {
    console.log('获取彝圈评论云函数：openid 为空，直接返回空用户')
    return null
  }

  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('获取彝圈评论云函数：当前用户查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：统一格式化评论返回数据，补齐是否可删除等前端展示字段。
function formatComment(comment, currentUserId, currentOpenid) {
  console.log('获取彝圈评论云函数：开始格式化单条评论', comment && comment._id)
  const status = comment.status || 'active'
  const isDeleted = status === 'deleted'
  const isOwner =
    Boolean(currentUserId && comment.userId === currentUserId) ||
    Boolean(currentOpenid && comment.openid === currentOpenid)
  const formattedComment = {
    _id: comment._id,
    postId: comment.postId || '',
    userId: comment.userId || '',
    nickName: comment.nickName || '微信用户',
    avatarUrl: comment.avatarUrl || '',
    content: isDeleted ? '该评论已删除' : comment.content || '',
    parentCommentId: comment.parentCommentId || '',
    rootCommentId: comment.rootCommentId || '',
    replyToCommentId: comment.replyToCommentId || '',
    replyToUserId: comment.replyToUserId || '',
    replyToNickName: comment.replyToNickName || '',
    replyCount: Number(comment.replyCount || 0),
    createdAt: Number(comment.createdAt || 0),
    updatedAt: Number(comment.updatedAt || 0),
    status,
    isDeleted,
    isOwner,
    canDelete: isOwner && !isDeleted,
  }
  console.log('获取彝圈评论云函数：单条评论格式化完成', formattedComment)
  return formattedComment
}

// 中文注释：云函数入口，按动态 id 返回评论和回复列表。
exports.main = async (event) => {
  console.log('获取彝圈评论云函数：收到评论列表查询请求', event || {})
  const postId = event && typeof event.postId === 'string' ? event.postId.trim() : ''
  const pageSize = normalizePageSize(event && event.pageSize)

  if (!postId) {
    console.log('获取彝圈评论云函数：缺少动态 id，直接返回失败')
    return {
      success: false,
      data: {
        list: [],
        totalCount: 0,
      },
      message: '缺少动态 id',
    }
  }

  try {
    // 中文注释：解析当前微信身份，用于判断评论归属。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('获取彝圈评论云函数：当前微信 openid 解析完成', openid)
    const currentUserProfile = await getUserByOpenId(openid)
    const currentUserId = currentUserProfile ? currentUserProfile._id : ''
    console.log('获取彝圈评论云函数：当前项目用户 id 解析完成', currentUserId)

    const commentResult = await db.collection(COMMENT_COLLECTION_NAME)
      .where({ postId })
      .limit(pageSize)
      .get()
    console.log('获取彝圈评论云函数：评论数据库查询完成', commentResult.data.length)

    const commentList = (commentResult.data || [])
      .filter((comment) => !comment.status || comment.status === 'active' || comment.status === 'deleted')
      .sort((currentComment, nextComment) => Number(currentComment.createdAt || 0) - Number(nextComment.createdAt || 0))
      .map((comment) => formatComment(comment, currentUserId, openid))
    console.log('获取彝圈评论云函数：评论列表格式化完成', commentList.length)

    return {
      success: true,
      data: {
        list: commentList,
        totalCount: commentList.length,
      },
      message: '获取彝圈评论成功',
    }
  } catch (error) {
    console.error('获取彝圈评论云函数：评论列表查询失败', error)
    return {
      success: false,
      data: {
        list: [],
        totalCount: 0,
      },
      message: '获取彝圈评论失败',
      errorMessage: error.message || '',
    }
  }
}
