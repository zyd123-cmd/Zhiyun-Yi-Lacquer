const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保评论点赞流程始终运行在当前云环境下。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例和命令对象，后续评论点赞记录与计数更新都依赖这里。
const db = cloud.database()
const _ = db.command
const COMMENT_COLLECTION_NAME = 'article_comments'
const COMMENT_LIKE_COLLECTION_NAME = 'article_comment_likes'
const USER_COLLECTION_NAME = 'user'

// 中文注释：统一按 openid 查询项目用户，只返回点赞流程需要的最小字段。
async function getUserByOpenId(openid) {
  console.log('切换评论点赞云函数：开始按 openid 查询用户资料', openid)
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
  console.log('切换评论点赞云函数：用户资料查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：统一按评论 id 查询评论详情，仅返回点赞流程真正依赖的字段。
async function getCommentById(commentId) {
  console.log('切换评论点赞云函数：开始按评论 id 查询评论', commentId)
  const response = await db
    .collection(COMMENT_COLLECTION_NAME)
    .field({
      _id: true,
      articleId: true,
      likeCount: true,
      status: true,
    })
    .doc(commentId)
    .get()

  const comment = response.data || null
  console.log('切换评论点赞云函数：评论查询完成', comment ? comment._id : '')
  return comment
}

// 中文注释：统一查询当前用户对当前评论的点赞记录，避免先扫用户全部点赞数据再做内存过滤。
async function getLikeRecord(commentId, userId) {
  console.log('切换评论点赞云函数：开始查询当前评论点赞记录', {
    commentId,
    userId,
  })
  const response = await db
    .collection(COMMENT_LIKE_COLLECTION_NAME)
    .where({
      commentId,
      userId,
    })
    .field({
      _id: true,
    })
    .limit(1)
    .get()

  const likeRecord = response.data[0] || null
  console.log('切换评论点赞云函数：当前评论点赞记录查询完成', likeRecord ? likeRecord._id : '')
  return likeRecord
}

// 中文注释：统一构造返回结果，便于前端直接更新评论点赞状态。
function buildResponse(success, data, message, extra = {}) {
  console.log('切换评论点赞云函数：开始组装返回结果', {
    success,
    data,
    message,
  })
  return {
    success,
    data,
    message,
    ...extra,
  }
}

// 中文注释：云函数主入口，负责执行评论点赞与取消点赞逻辑。
exports.main = async (event) => {
  console.log('切换评论点赞云函数：收到评论点赞请求', event || {})
  const commentId = event && typeof event.commentId === 'string' ? event.commentId.trim() : ''

  if (!commentId) {
    console.log('切换评论点赞云函数：当前缺少评论 id，直接返回失败结果')
    return buildResponse(false, null, '缺少评论 id')
  }

  try {
    // 中文注释：先解析当前微信身份，后续会用来校验登录用户和点赞归属。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('切换评论点赞云函数：当前微信 openid 解析完成', openid)

    if (!openid) {
      console.log('切换评论点赞云函数：当前缺少微信 openid，直接返回失败结果')
      return buildResponse(false, null, '未获取到当前微信身份，请重新登录后再试')
    }

    const [currentUserProfile, comment] = await Promise.all([
      getUserByOpenId(openid),
      getCommentById(commentId),
    ])

    if (!currentUserProfile) {
      console.log('切换评论点赞云函数：当前微信账号尚未绑定项目用户资料，拒绝执行点赞')
      return buildResponse(false, null, '请先完成登录后再点赞评论')
    }

    if (!comment || comment.status !== 'active') {
      console.log('切换评论点赞云函数：当前评论不存在或状态不可用，拒绝执行点赞', {
        commentId,
        status: comment ? comment.status : '',
      })
      return buildResponse(false, null, '评论不存在或已不可用')
    }

    const likeRecord = await getLikeRecord(commentId, currentUserProfile._id)
    const currentTime = Date.now()
    const nextLikeCount = Math.max(
      0,
      Number(comment.likeCount || 0) + (likeRecord ? -1 : 1)
    )

    if (likeRecord) {
      console.log('切换评论点赞云函数：检测到现有点赞记录，准备执行取消点赞', likeRecord._id)
      await db.collection(COMMENT_LIKE_COLLECTION_NAME).doc(likeRecord._id).remove()
      console.log('切换评论点赞云函数：评论点赞记录删除完成', likeRecord._id)

      await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).update({
        data: {
          likeCount: _.inc(-1),
          updatedAt: currentTime,
        },
      })
      console.log('切换评论点赞云函数：评论点赞数量递减完成', {
        commentId,
        nextLikeCount,
      })
    } else {
      console.log('切换评论点赞云函数：当前不存在点赞记录，准备执行点赞', {
        commentId,
        userId: currentUserProfile._id,
      })
      await db.collection(COMMENT_LIKE_COLLECTION_NAME).add({
        data: {
          articleId: comment.articleId,
          commentId,
          userId: currentUserProfile._id,
          openid,
          createdAt: currentTime,
          updatedAt: currentTime,
        },
      })
      console.log('切换评论点赞云函数：评论点赞记录创建完成', commentId)

      await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).update({
        data: {
          likeCount: _.inc(1),
          updatedAt: currentTime,
        },
      })
      console.log('切换评论点赞云函数：评论点赞数量递增完成', {
        commentId,
        nextLikeCount,
      })
    }

    const responseData = {
      commentId,
      isLiked: !likeRecord,
      likeCount: nextLikeCount,
    }
    console.log('切换评论点赞云函数：评论点赞流程执行完成，准备返回前端', responseData)

    return buildResponse(
      true,
      responseData,
      responseData.isLiked ? '评论点赞成功' : '已取消评论点赞'
    )
  } catch (error) {
    console.error('切换评论点赞云函数：评论点赞流程失败', error)
    return buildResponse(false, null, '评论点赞失败，请稍后重试', {
      errorMessage: error.message || '',
    })
  }
}
