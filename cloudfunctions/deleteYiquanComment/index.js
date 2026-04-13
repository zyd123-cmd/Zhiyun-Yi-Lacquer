const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保评论删除逻辑运行在当前云环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，评论删除、动态评论数更新和用户校验都通过这里执行。
const db = cloud.database()
const _ = db.command
const POST_COLLECTION_NAME = 'yiquan_posts'
const COMMENT_COLLECTION_NAME = 'yiquan_post_comments'
const USER_COLLECTION_NAME = 'user'

// 中文注释：按 openid 查询当前用户，用于校验评论归属。
async function getUserByOpenId(openid) {
  console.log('删除彝圈评论云函数：开始按 openid 查询当前用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('删除彝圈评论云函数：当前用户查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：按评论 id 查询评论详情，供归属校验和回复链判断使用。
async function getCommentById(commentId) {
  console.log('删除彝圈评论云函数：开始按评论 id 查询评论', commentId)
  const result = await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).get()
  const comment = result.data || null
  console.log('删除彝圈评论云函数：评论查询完成', comment ? comment._id : '')
  return comment
}

// 中文注释：检查当前评论是否还有子回复，有子回复时改为软删除以保留回复链。
async function hasChildComments(comment) {
  console.log('删除彝圈评论云函数：开始检查评论是否存在子回复', comment && comment._id)
  const result = await db.collection(COMMENT_COLLECTION_NAME)
    .where({ postId: comment.postId })
    .limit(200)
    .get()
  const hasChildren = (result.data || []).some((item) => {
    if (item._id === comment._id) return false
    if (item.status && item.status !== 'active' && item.status !== 'deleted') return false
    return item.parentCommentId === comment._id || item.replyToCommentId === comment._id || item.rootCommentId === comment._id
  })
  console.log('删除彝圈评论云函数：评论子回复检查完成', hasChildren)
  return hasChildren
}

// 中文注释：评论硬删除后同步递减父评论回复数，保证回复数量准确。
async function decreaseParentReplyCount(parentCommentId) {
  console.log('删除彝圈评论云函数：开始递减父评论回复数', parentCommentId)

  if (!parentCommentId) {
    console.log('删除彝圈评论云函数：当前评论不是回复评论，无需递减父评论回复数')
    return
  }

  await db.collection(COMMENT_COLLECTION_NAME).doc(parentCommentId).update({
    data: {
      replyCount: _.inc(-1),
      updatedAt: Date.now(),
    },
  })
  console.log('删除彝圈评论云函数：父评论回复数递减完成', parentCommentId)
}

// 中文注释：评论硬删除后同步递减动态评论数，软删除不递减以保留回复链占位。
async function decreasePostCommentCount(postId) {
  console.log('删除彝圈评论云函数：开始递减动态评论数', postId)
  await db.collection(POST_COLLECTION_NAME).doc(postId).update({
    data: {
      commentCount: _.inc(-1),
      updatedAt: Date.now(),
    },
  })
  console.log('删除彝圈评论云函数：动态评论数递减完成', postId)
}

// 中文注释：云函数入口，仅允许用户删除自己的评论。
exports.main = async (event) => {
  console.log('删除彝圈评论云函数：收到删除评论请求', event || {})
  const commentId = event && typeof event.commentId === 'string' ? event.commentId.trim() : ''

  if (!commentId) {
    return { success: false, data: null, message: '缺少评论 id' }
  }

  try {
    // 中文注释：解析当前微信身份并校验项目用户资料。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('删除彝圈评论云函数：当前微信 openid 解析完成', openid)

    if (!openid) {
      return { success: false, data: null, message: '未获取到当前微信身份，请重新登录后再删除' }
    }

    const currentUserProfile = await getUserByOpenId(openid)

    if (!currentUserProfile) {
      return { success: false, data: null, message: '请先完成登录后再删除评论' }
    }

    const currentComment = await getCommentById(commentId)

    if (!currentComment) {
      return { success: false, data: null, message: '评论不存在或已删除' }
    }

    const isOwnerByUserId = Boolean(currentComment.userId && currentComment.userId === currentUserProfile._id)
    const isOwnerByOpenid = Boolean(currentComment.openid && currentComment.openid === openid)

    if (!isOwnerByUserId && !isOwnerByOpenid) {
      console.log('删除彝圈评论云函数：评论不属于当前用户，拒绝删除')
      return { success: false, data: null, message: '只能删除自己的评论' }
    }

    if (currentComment.status === 'deleted') {
      return {
        success: true,
        data: {
          commentId,
          postId: currentComment.postId,
          parentCommentId: currentComment.parentCommentId || '',
          deleteMode: 'soft',
          status: 'deleted',
        },
        message: '评论已删除',
      }
    }

    const childCommentExists = await hasChildComments(currentComment)
    const currentTime = Date.now()

    if (childCommentExists) {
      console.log('删除彝圈评论云函数：当前评论存在子回复，准备执行软删除')
      await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).update({
        data: {
          status: 'deleted',
          content: '该评论已删除',
          updatedAt: currentTime,
        },
      })
      console.log('删除彝圈评论云函数：评论软删除完成', commentId)
      return {
        success: true,
        data: {
          commentId,
          postId: currentComment.postId,
          parentCommentId: currentComment.parentCommentId || '',
          deleteMode: 'soft',
          status: 'deleted',
        },
        message: '评论删除成功',
      }
    }

    console.log('删除彝圈评论云函数：当前评论没有子回复，准备执行硬删除')
    await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).remove()
    await decreaseParentReplyCount(currentComment.parentCommentId || '')
    await decreasePostCommentCount(currentComment.postId)
    console.log('删除彝圈评论云函数：评论硬删除完成', commentId)

    return {
      success: true,
      data: {
        commentId,
        postId: currentComment.postId,
        parentCommentId: currentComment.parentCommentId || '',
        deleteMode: 'hard',
        status: 'deleted',
      },
      message: '评论删除成功',
    }
  } catch (error) {
    console.error('删除彝圈评论云函数：评论删除失败', error)
    return {
      success: false,
      data: null,
      message: '评论删除失败，请稍后重试',
      errorMessage: error.message || '',
    }
  }
}
