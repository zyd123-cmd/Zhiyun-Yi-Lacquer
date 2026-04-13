const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保评论创建与回复逻辑都运行在当前云环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取云数据库实例，后续评论和用户资料查询都会通过这里执行。
const db = cloud.database()
const _ = db.command
const COMMENT_COLLECTION_NAME = 'article_comments'
const USER_COLLECTION_NAME = 'user'

// 中文注释：统一裁剪评论内容，避免空字符串和超长评论直接入库。
function normalizeCommentContent(content) {
  console.log('创建文章评论云函数：开始规范评论内容', content)
  const normalizedContent = typeof content === 'string' ? content.trim() : ''
  console.log('创建文章评论云函数：评论内容规范完成', normalizedContent)
  return normalizedContent
}

// 中文注释：按 openid 查询当前微信用户绑定的项目账号资料，用于快照作者昵称和头像。
async function getUserByOpenId(openid) {
  console.log('创建文章评论云函数：开始按 openid 查询用户资料', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('创建文章评论云函数：用户资料查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：按评论 id 查询被回复的评论，用于生成父评论链路和回复对象昵称。
async function getCommentById(commentId) {
  console.log('创建文章评论云函数：开始按评论 id 查询父评论', commentId)

  if (!commentId) {
    console.log('创建文章评论云函数：未传父评论 id，当前为根评论')
    return null
  }

  const result = await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).get()
  console.log('创建文章评论云函数：父评论查询完成', result.data && result.data._id)
  return result.data || null
}

// 中文注释：统一裁剪创建成功后返回给前端的评论字段，避免把 openid 等敏感字段回传到页面。
function buildCommentResponse(commentData, currentUserId) {
  console.log('创建文章评论云函数：开始组装前端需要的评论返回数据', commentData && commentData._id)
  const responseData = {
    _id: commentData._id,
    articleId: commentData.articleId,
    userId: commentData.userId,
    nickName: commentData.nickName || '微信用户',
    avatarUrl: commentData.avatarUrl || '',
    content: commentData.content || '',
    parentCommentId: commentData.parentCommentId || '',
    rootCommentId: commentData.rootCommentId || '',
    replyToCommentId: commentData.replyToCommentId || '',
    replyToUserId: commentData.replyToUserId || '',
    replyToNickName: commentData.replyToNickName || '',
    likeCount: Number(commentData.likeCount || 0),
    replyCount: Number(commentData.replyCount || 0),
    createdAt: Number(commentData.createdAt || 0),
    updatedAt: Number(commentData.updatedAt || 0),
    isLiked: false,
    isOwner: Boolean(currentUserId && commentData.userId === currentUserId),
    canDelete: Boolean(currentUserId && commentData.userId === currentUserId),
    isDeleted: false,
    status: commentData.status || 'active',
  }
  console.log('创建文章评论云函数：评论返回数据组装完成', responseData._id)
  return responseData
}

// 中文注释：云函数主入口，负责创建根评论与回复评论。
exports.main = async (event) => {
  console.log('创建文章评论云函数：收到创建评论请求', event || {})
  const articleId = event && typeof event.articleId === 'string' ? event.articleId.trim() : ''
  const parentCommentId =
    event && typeof event.parentCommentId === 'string' ? event.parentCommentId.trim() : ''
  const content = normalizeCommentContent(event && event.content)

  if (!articleId) {
    console.log('创建文章评论云函数：缺少文章 id，直接返回失败结果')
    return {
      success: false,
      data: null,
      message: '缺少文章 id',
    }
  }

  if (!content) {
    console.log('创建文章评论云函数：评论内容为空，直接返回失败结果')
    return {
      success: false,
      data: null,
      message: '评论内容不能为空',
    }
  }

  if (content.length > 300) {
    console.log('创建文章评论云函数：评论内容超长，直接返回失败结果', content.length)
    return {
      success: false,
      data: null,
      message: '评论内容不能超过 300 字',
    }
  }

  try {
    // 中文注释：先从微信上下文中提取当前身份，并据此找到项目用户资料。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('创建文章评论云函数：成功获取当前微信 openid', openid)

    if (!openid) {
      console.log('创建文章评论云函数：未获取到当前微信 openid，直接返回失败结果')
      return {
        success: false,
        data: null,
        message: '未获取到当前微信身份，请重新登录后再试',
      }
    }

    const currentUserProfile = await getUserByOpenId(openid)

    if (!currentUserProfile) {
      console.log('创建文章评论云函数：当前微信账号尚未绑定项目用户资料，拒绝创建评论')
      return {
        success: false,
        data: null,
        message: '请先完成登录后再发表评论',
      }
    }

    const parentComment = await getCommentById(parentCommentId)

    if (parentCommentId && !parentComment) {
      console.log('创建文章评论云函数：父评论不存在，拒绝创建回复')
      return {
        success: false,
        data: null,
        message: '被回复的评论不存在或已删除',
      }
    }

    if (parentComment && parentComment.articleId !== articleId) {
      console.log('创建文章评论云函数：父评论与当前文章不匹配，拒绝创建回复', {
        parentArticleId: parentComment.articleId,
        articleId,
      })
      return {
        success: false,
        data: null,
        message: '回复的评论与当前文章不匹配',
      }
    }

    if (parentComment && parentComment.status !== 'active') {
      console.log('创建文章评论云函数：父评论状态不可用，拒绝创建回复', parentComment.status)
      return {
        success: false,
        data: null,
        message: '被回复的评论已不可用',
      }
    }

    const currentTime = Date.now()
    const commentData = {
      articleId,
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
      likeCount: 0,
      replyCount: 0,
      status: 'active',
      createdAt: currentTime,
      updatedAt: currentTime,
    }
    console.log('创建文章评论云函数：评论入库数据组装完成', commentData)

    const createResult = await db.collection(COMMENT_COLLECTION_NAME).add({
      data: commentData,
    })
    console.log('创建文章评论云函数：评论创建成功', createResult._id)

    if (parentComment) {
      console.log('创建文章评论云函数：当前为回复评论，开始更新父评论回复数量', parentComment._id)
      await db.collection(COMMENT_COLLECTION_NAME).doc(parentComment._id).update({
        data: {
          replyCount: _.inc(1),
          updatedAt: currentTime,
        },
      })
      console.log('创建文章评论云函数：父评论回复数量更新完成', parentComment._id)
    }

    const createdComment = {
      _id: createResult._id,
      ...commentData,
    }
    const responseData = buildCommentResponse(createdComment, currentUserProfile._id)
    console.log('创建文章评论云函数：创建评论流程完成，准备返回前端', responseData._id)

    return {
      success: true,
      data: responseData,
      message: parentComment ? '回复评论成功' : '发表评论成功',
    }
  } catch (error) {
    console.error('创建文章评论云函数：创建评论失败', error)
    return {
      success: false,
      data: null,
      message: '发表评论失败，请稍后重试',
      errorMessage: error.message || '',
    }
  }
}
