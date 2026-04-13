const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保彝圈评论写入当前云环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，评论创建、动态状态校验和用户资料读取都通过这里完成。
const db = cloud.database()
const _ = db.command
const POST_COLLECTION_NAME = 'yiquan_posts'
const COMMENT_COLLECTION_NAME = 'yiquan_post_comments'
const USER_COLLECTION_NAME = 'user'

// 中文注释：统一规整评论内容，避免空白评论和超长评论入库。
function normalizeContent(content) {
  console.log('创建彝圈评论云函数：开始规整评论内容', content)
  const normalizedContent = typeof content === 'string' ? content.trim() : ''
  console.log('创建彝圈评论云函数：评论内容规整完成', normalizedContent)
  return normalizedContent
}

// 中文注释：按 openid 查询当前用户，保证只有真实登录用户才能评论。
async function getUserByOpenId(openid) {
  console.log('创建彝圈评论云函数：开始按 openid 查询当前用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('创建彝圈评论云函数：当前用户查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：按动态 id 查询动态，用于校验只有已审核动态才能被评论。
async function getPostById(postId) {
  console.log('创建彝圈评论云函数：开始按动态 id 查询动态', postId)
  const result = await db.collection(POST_COLLECTION_NAME).doc(postId).get()
  const post = result.data || null
  console.log('创建彝圈评论云函数：动态查询完成', post ? post._id : '')
  return post
}

// 中文注释：按评论 id 查询被回复评论，用于生成回复链路。
async function getCommentById(commentId) {
  console.log('创建彝圈评论云函数：开始按评论 id 查询父评论', commentId)

  if (!commentId) {
    console.log('创建彝圈评论云函数：未传入父评论 id，当前为根评论')
    return null
  }

  const result = await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).get()
  const comment = result.data || null
  console.log('创建彝圈评论云函数：父评论查询完成', comment ? comment._id : '')
  return comment
}

// 中文注释：统一裁剪评论返回字段，方便前端直接追加到评论树。
function buildCommentResponse(commentData, currentUserId) {
  console.log('创建彝圈评论云函数：开始组装评论返回数据', commentData && commentData._id)
  const responseData = {
    _id: commentData._id,
    postId: commentData.postId,
    userId: commentData.userId,
    nickName: commentData.nickName || '微信用户',
    avatarUrl: commentData.avatarUrl || '',
    content: commentData.content || '',
    parentCommentId: commentData.parentCommentId || '',
    rootCommentId: commentData.rootCommentId || '',
    replyToCommentId: commentData.replyToCommentId || '',
    replyToUserId: commentData.replyToUserId || '',
    replyToNickName: commentData.replyToNickName || '',
    replyCount: Number(commentData.replyCount || 0),
    createdAt: Number(commentData.createdAt || 0),
    updatedAt: Number(commentData.updatedAt || 0),
    status: commentData.status || 'active',
    isDeleted: false,
    isOwner: Boolean(currentUserId && commentData.userId === currentUserId),
    canDelete: Boolean(currentUserId && commentData.userId === currentUserId),
  }
  console.log('创建彝圈评论云函数：评论返回数据组装完成', responseData)
  return responseData
}

// 中文注释：云函数入口，负责创建根评论或回复评论。
exports.main = async (event) => {
  console.log('创建彝圈评论云函数：收到创建评论请求', event || {})
  const postId = event && typeof event.postId === 'string' ? event.postId.trim() : ''
  const parentCommentId = event && typeof event.parentCommentId === 'string' ? event.parentCommentId.trim() : ''
  const content = normalizeContent(event && event.content)

  if (!postId) {
    return { success: false, data: null, message: '缺少动态 id' }
  }

  if (!content) {
    return { success: false, data: null, message: '评论内容不能为空' }
  }

  if (content.length > 300) {
    return { success: false, data: null, message: '评论内容不能超过 300 字' }
  }

  try {
    // 中文注释：先校验当前微信身份，再读取项目用户资料。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('创建彝圈评论云函数：当前微信 openid 解析完成', openid)

    if (!openid) {
      return { success: false, data: null, message: '未获取到当前微信身份，请重新登录后再评论' }
    }

    const currentUserProfile = await getUserByOpenId(openid)

    if (!currentUserProfile) {
      return { success: false, data: null, message: '请先完成登录后再发表评论' }
    }

    const currentPost = await getPostById(postId)

    if (!currentPost || currentPost.status !== 'approved') {
      console.log('创建彝圈评论云函数：动态不存在或未审核通过，拒绝评论', currentPost)
      return { success: false, data: null, message: '动态不存在或尚未审核通过，暂不能评论' }
    }

    const parentComment = await getCommentById(parentCommentId)

    if (parentCommentId && !parentComment) {
      return { success: false, data: null, message: '被回复的评论不存在或已删除' }
    }

    if (parentComment && parentComment.postId !== postId) {
      return { success: false, data: null, message: '回复的评论与当前动态不匹配' }
    }

    if (parentComment && parentComment.status !== 'active') {
      return { success: false, data: null, message: '被回复的评论已不可用' }
    }

    const currentTime = Date.now()
    const commentData = {
      postId,
      userId: currentUserProfile._id,
      openid,
      nickName: currentUserProfile.nickName || '微信用户',
      avatarUrl: currentUserProfile.avatarUrl || '',
      content,
      parentCommentId: parentComment ? parentComment._id : '',
      rootCommentId: parentComment ? (parentComment.rootCommentId || parentComment._id) : '',
      replyToCommentId: parentComment ? parentComment._id : '',
      replyToUserId: parentComment ? parentComment.userId || '' : '',
      replyToNickName: parentComment ? parentComment.nickName || '' : '',
      replyCount: 0,
      status: 'active',
      createdAt: currentTime,
      updatedAt: currentTime,
    }
    console.log('创建彝圈评论云函数：评论入库数据组装完成', commentData)

    const createResult = await db.collection(COMMENT_COLLECTION_NAME).add({ data: commentData })
    console.log('创建彝圈评论云函数：评论创建完成', createResult._id)

    await db.collection(POST_COLLECTION_NAME).doc(postId).update({
      data: {
        commentCount: _.inc(1),
        updatedAt: currentTime,
      },
    })
    console.log('创建彝圈评论云函数：动态评论数更新完成', postId)

    if (parentComment) {
      await db.collection(COMMENT_COLLECTION_NAME).doc(parentComment._id).update({
        data: {
          replyCount: _.inc(1),
          updatedAt: currentTime,
        },
      })
      console.log('创建彝圈评论云函数：父评论回复数更新完成', parentComment._id)
    }

    const responseData = buildCommentResponse({ _id: createResult._id, ...commentData }, currentUserProfile._id)

    return {
      success: true,
      data: responseData,
      message: parentComment ? '回复评论成功' : '发表评论成功',
    }
  } catch (error) {
    console.error('创建彝圈评论云函数：评论创建失败', error)
    return {
      success: false,
      data: null,
      message: '评论提交失败，请稍后重试',
      errorMessage: error.message || '',
    }
  }
}
