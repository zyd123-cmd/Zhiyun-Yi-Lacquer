const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保评论删除逻辑运行在当前云环境中。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取云数据库实例，后续评论删除、点赞记录清理和用户校验都通过这里执行。
const db = cloud.database()
const _ = db.command
const COMMENT_COLLECTION_NAME = 'article_comments'
const COMMENT_LIKE_COLLECTION_NAME = 'article_comment_likes'
const USER_COLLECTION_NAME = 'user'

// 中文注释：按 openid 查询当前微信账号绑定的项目用户资料，用于校验评论归属。
async function getUserByOpenId(openid) {
  console.log('删除文章评论云函数：开始按 openid 查询用户资料', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('删除文章评论云函数：用户资料查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：按评论 id 查询评论详情，用于校验评论归属、回复关系和当前状态。
async function getCommentById(commentId) {
  console.log('删除文章评论云函数：开始按评论 id 查询评论', commentId)
  const result = await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).get()
  const comment = result.data || null
  console.log('删除文章评论云函数：评论查询完成', comment ? comment._id : '')
  return comment
}

// 中文注释：查询是否仍有评论回复到当前评论，存在子回复时改走软删除，避免把别人的回复一并丢掉。
async function hasChildComments(comment) {
  console.log('删除文章评论云函数：开始查询当前评论是否仍有子回复', comment && comment._id)

  if (!comment || !comment._id) {
    console.log('删除文章评论云函数：当前评论为空，直接判定不存在子回复')
    return false
  }

  const result = await db.collection(COMMENT_COLLECTION_NAME)
    .where({
      articleId: comment.articleId,
    })
    .limit(200)
    .get()

  const hasChildren = (result.data || []).some((currentComment) => {
    if (currentComment._id === comment._id) {
      return false
    }

    if (currentComment.status && currentComment.status !== 'active' && currentComment.status !== 'deleted') {
      return false
    }

    return (
      currentComment.parentCommentId === comment._id ||
      currentComment.replyToCommentId === comment._id ||
      (comment.rootCommentId
        ? currentComment.parentCommentId === comment._id
        : currentComment.rootCommentId === comment._id)
    )
  })
  console.log('删除文章评论云函数：子回复查询完成', hasChildren)
  return hasChildren
}

// 中文注释：删除评论点赞记录，避免评论被硬删除后还残留无效点赞数据。
async function removeCommentLikeRecords(commentId) {
  console.log('删除文章评论云函数：开始清理评论点赞记录', commentId)
  const likeRecordResult = await db.collection(COMMENT_LIKE_COLLECTION_NAME)
    .where({
      commentId,
    })
    .limit(200)
    .get()

  for (let index = 0; index < likeRecordResult.data.length; index += 1) {
    const likeRecord = likeRecordResult.data[index]
    console.log('删除文章评论云函数：准备删除单条评论点赞记录', likeRecord._id)
    await db.collection(COMMENT_LIKE_COLLECTION_NAME).doc(likeRecord._id).remove()
    console.log('删除文章评论云函数：单条评论点赞记录删除完成', likeRecord._id)
  }

  console.log('删除文章评论云函数：评论点赞记录清理完成', likeRecordResult.data.length)
}

// 中文注释：在硬删除回复评论后同步扣减父评论回复数，保持前端展示准确。
async function decreaseParentReplyCount(parentCommentId) {
  console.log('删除文章评论云函数：开始递减父评论回复数量', parentCommentId)

  if (!parentCommentId) {
    console.log('删除文章评论云函数：当前评论不存在父评论，无需递减回复数量')
    return
  }

  await db.collection(COMMENT_COLLECTION_NAME).doc(parentCommentId).update({
    data: {
      replyCount: _.inc(-1),
      updatedAt: Date.now(),
    },
  })
  console.log('删除文章评论云函数：父评论回复数量递减完成', parentCommentId)
}

// 中文注释：统一构造删除评论返回结果，方便前端区分硬删除和软删除后的本地处理。
function buildResponse(success, data, message, extra = {}) {
  console.log('删除文章评论云函数：开始组装返回结果', {
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

// 中文注释：云函数主入口，负责执行“本人删除自己的评论”逻辑。
exports.main = async (event) => {
  console.log('删除文章评论云函数：收到删除评论请求', event || {})
  const commentId = event && typeof event.commentId === 'string' ? event.commentId.trim() : ''

  if (!commentId) {
    console.log('删除文章评论云函数：缺少评论 id，直接返回失败结果')
    return buildResponse(false, null, '缺少评论 id')
  }

  try {
    // 中文注释：先从微信上下文中提取当前身份，并据此校验当前评论是否属于本人。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('删除文章评论云函数：成功获取当前微信 openid', openid)

    if (!openid) {
      console.log('删除文章评论云函数：未获取到当前微信 openid，直接返回失败结果')
      return buildResponse(false, null, '未获取到当前微信身份，请重新登录后再试')
    }

    const currentUserProfile = await getUserByOpenId(openid)

    if (!currentUserProfile) {
      console.log('删除文章评论云函数：当前微信账号尚未绑定项目用户资料，拒绝删除评论')
      return buildResponse(false, null, '请先完成登录后再删除评论')
    }

    const currentComment = await getCommentById(commentId)

    if (!currentComment) {
      console.log('删除文章评论云函数：评论不存在，直接返回失败结果')
      return buildResponse(false, null, '评论不存在或已删除')
    }

    const isOwnerByUserId =
      Boolean(currentComment.userId) &&
      currentComment.userId === currentUserProfile._id
    const isOwnerByOpenid =
      Boolean(currentComment.openid) &&
      currentComment.openid === openid

    if (!isOwnerByUserId && !isOwnerByOpenid) {
      console.log('删除文章评论云函数：当前评论不属于当前用户，拒绝删除', {
        currentUserId: currentUserProfile._id,
        ownerUserId: currentComment.userId,
        currentOpenid: openid,
        ownerOpenid: currentComment.openid || '',
      })
      return buildResponse(false, null, '只能删除自己的评论')
    }

    if (currentComment.status === 'deleted') {
      console.log('删除文章评论云函数：当前评论已处于已删除状态，直接返回成功')
      return buildResponse(true, {
        commentId,
        deleteMode: 'soft',
        status: 'deleted',
      }, '评论已删除')
    }

    const childCommentExists = await hasChildComments(currentComment)
    const currentTime = Date.now()

    if (childCommentExists) {
      console.log('删除文章评论云函数：检测到当前评论仍有子回复，准备执行软删除')
      await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).update({
        data: {
          status: 'deleted',
          content: '该评论已删除',
          updatedAt: currentTime,
        },
      })
      console.log('删除文章评论云函数：评论软删除完成', commentId)

      return buildResponse(true, {
        commentId,
        deleteMode: 'soft',
        status: 'deleted',
      }, '评论删除成功')
    }

    console.log('删除文章评论云函数：当前评论不存在子回复，准备执行硬删除')
    await removeCommentLikeRecords(commentId)
    await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).remove()
    console.log('删除文章评论云函数：评论硬删除完成', commentId)
    await decreaseParentReplyCount(currentComment.parentCommentId || '')

    return buildResponse(true, {
      commentId,
      deleteMode: 'hard',
      status: 'deleted',
      parentCommentId: currentComment.parentCommentId || '',
    }, '评论删除成功')
  } catch (error) {
    console.error('删除文章评论云函数：删除评论失败', error)
    return buildResponse(false, null, '评论删除失败，请稍后重试', {
      errorMessage: error.message || '',
    })
  }
}
