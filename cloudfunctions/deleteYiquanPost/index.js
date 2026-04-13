const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保删除动态时使用当前小程序云环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，后续动态归属校验和评论清理都通过这里执行。
const db = cloud.database()
const POST_COLLECTION_NAME = 'yiquan_posts'
const COMMENT_COLLECTION_NAME = 'yiquan_post_comments'
const USER_COLLECTION_NAME = 'user'

// 中文注释：按 openid 查询当前项目用户，用于判断动态是否属于当前用户。
async function getUserByOpenId(openid) {
  console.log('删除彝圈动态云函数：开始按 openid 查询当前用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('删除彝圈动态云函数：当前用户查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：按动态 id 查询动态详情，供删除前做归属校验。
async function getPostById(postId) {
  console.log('删除彝圈动态云函数：开始按动态 id 查询动态', postId)
  const result = await db.collection(POST_COLLECTION_NAME).doc(postId).get()
  const post = result.data || null
  console.log('删除彝圈动态云函数：动态查询完成', post ? post._id : '')
  return post
}

// 中文注释：删除动态后同步清理其下评论，避免产生孤儿评论数据。
async function removePostComments(postId) {
  console.log('删除彝圈动态云函数：开始清理动态下的评论', postId)
  let removedCount = 0
  let shouldContinue = true

  while (shouldContinue) {
    const commentResult = await db.collection(COMMENT_COLLECTION_NAME)
      .where({ postId })
      .limit(100)
      .get()

    if (!commentResult.data.length) {
      shouldContinue = false
      continue
    }

    for (let index = 0; index < commentResult.data.length; index += 1) {
      const comment = commentResult.data[index]
      console.log('删除彝圈动态云函数：准备删除动态下的单条评论', comment._id)
      await db.collection(COMMENT_COLLECTION_NAME).doc(comment._id).remove()
      removedCount += 1
      console.log('删除彝圈动态云函数：动态下的单条评论删除完成', comment._id)
    }
  }

  console.log('删除彝圈动态云函数：动态下评论清理完成', removedCount)
  return removedCount
}

// 中文注释：云函数入口，仅允许用户删除自己的动态。
exports.main = async (event) => {
  console.log('删除彝圈动态云函数：收到删除动态请求', event || {})
  const postId = event && typeof event.postId === 'string' ? event.postId.trim() : ''

  if (!postId) {
    console.log('删除彝圈动态云函数：缺少动态 id，拒绝删除')
    return {
      success: false,
      data: null,
      message: '缺少动态 id',
    }
  }

  try {
    // 中文注释：解析当前微信身份并校验项目用户资料。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('删除彝圈动态云函数：当前微信 openid 解析完成', openid)

    if (!openid) {
      return {
        success: false,
        data: null,
        message: '未获取到当前微信身份，请重新登录后再删除',
      }
    }

    const currentUserProfile = await getUserByOpenId(openid)

    if (!currentUserProfile) {
      console.log('删除彝圈动态云函数：当前微信账号未绑定项目用户资料，拒绝删除')
      return {
        success: false,
        data: null,
        message: '请先完成登录后再删除动态',
      }
    }

    const post = await getPostById(postId)

    if (!post) {
      console.log('删除彝圈动态云函数：动态不存在，直接返回失败')
      return {
        success: false,
        data: null,
        message: '动态不存在或已删除',
      }
    }

    const isOwnerByUserId = Boolean(post.userId && post.userId === currentUserProfile._id)
    const isOwnerByOpenid = Boolean(post.openid && post.openid === openid)

    if (!isOwnerByUserId && !isOwnerByOpenid) {
      console.log('删除彝圈动态云函数：当前动态不属于当前用户，拒绝删除', {
        currentUserId: currentUserProfile._id,
        postUserId: post.userId || '',
      })
      return {
        success: false,
        data: null,
        message: '只能删除自己的动态',
      }
    }

    await db.collection(POST_COLLECTION_NAME).doc(postId).remove()
    console.log('删除彝圈动态云函数：动态主记录删除完成', postId)
    const removedCommentCount = await removePostComments(postId)

    return {
      success: true,
      data: {
        postId,
        removedCommentCount,
      },
      message: '动态删除成功',
    }
  } catch (error) {
    console.error('删除彝圈动态云函数：动态删除失败', error)
    return {
      success: false,
      data: null,
      message: '动态删除失败，请稍后重试',
      errorMessage: error.message || '',
    }
  }
}
