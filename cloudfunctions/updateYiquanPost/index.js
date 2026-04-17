const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保驳回动态二次提审时始终运行在当前云环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，后续用户校验与动态更新都会通过这里执行。
const db = cloud.database()
const POST_COLLECTION_NAME = 'yiquan_posts'
const USER_COLLECTION_NAME = 'user'

// 中文注释：统一规整动态正文，避免空白内容直接写入数据库。
function normalizeContent(content) {
  console.log('更新彝圈动态云函数：开始规整动态正文', content)
  const normalizedContent = typeof content === 'string' ? content.trim() : ''
  console.log('更新彝圈动态云函数：动态正文规整完成', normalizedContent)
  return normalizedContent
}

// 中文注释：统一规整图片列表，保持九宫格最多九张图的展示约束。
function normalizeImageList(imageList) {
  console.log('更新彝圈动态云函数：开始规整动态图片列表', imageList)
  const normalizedImageList = (Array.isArray(imageList) ? imageList : [])
    .filter((imageUrl) => typeof imageUrl === 'string' && imageUrl.trim())
    .slice(0, 9)
  console.log('更新彝圈动态云函数：动态图片列表规整完成', normalizedImageList)
  return normalizedImageList
}

// 中文注释：统一规整动态 id，避免空值或异常类型参与数据库查询。
function normalizePostId(postId) {
  console.log('更新彝圈动态云函数：开始规整动态 id', postId)
  const normalizedPostId = typeof postId === 'string' ? postId.trim() : ''
  console.log('更新彝圈动态云函数：动态 id 规整完成', normalizedPostId)
  return normalizedPostId
}

// 中文注释：按 openid 查询当前项目用户，确保只有动态作者本人才能重新编辑提交。
async function getUserByOpenId(openid) {
  console.log('更新彝圈动态云函数：开始按 openid 查询当前用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('更新彝圈动态云函数：当前用户查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：统一组装返回给前端的最新动态结果，便于用户端立刻同步本地状态。
function buildReturnPost(postRecord) {
  console.log('更新彝圈动态云函数：开始组装返回动态数据', postRecord && postRecord._id)
  const returnPost = {
    _id: postRecord._id,
    userId: postRecord.userId || '',
    nickName: postRecord.nickName || '微信用户',
    avatarUrl: postRecord.avatarUrl || '',
    content: postRecord.content || '',
    imageList: Array.isArray(postRecord.imageList) ? postRecord.imageList : [],
    status: postRecord.status || 'pending',
    reviewRemark: postRecord.reviewRemark || '',
    commentCount: Number(postRecord.commentCount || 0),
    createdAt: Number(postRecord.createdAt || 0),
    updatedAt: Number(postRecord.updatedAt || 0),
    reviewedAt: Number(postRecord.reviewedAt || 0),
    canDelete: true,
  }
  console.log('更新彝圈动态云函数：返回动态数据组装完成', returnPost)
  return returnPost
}

// 中文注释：云函数入口，负责处理用户修改已驳回动态并重新提交审核的完整流程。
exports.main = async (event) => {
  console.log('更新彝圈动态云函数：收到修改动态请求', event || {})
  const postId = normalizePostId(event && event.postId)
  const content = normalizeContent(event && event.content)
  const imageList = normalizeImageList(event && event.imageList)

  if (!postId) {
    console.log('更新彝圈动态云函数：缺少动态 id，拒绝继续处理')
    return {
      success: false,
      data: null,
      message: '缺少动态 id',
    }
  }

  if (!content && !imageList.length) {
    console.log('更新彝圈动态云函数：正文和图片都为空，拒绝重新提交')
    return {
      success: false,
      data: null,
      message: '请填写内容或上传图片',
    }
  }

  if (content.length > 500) {
    console.log('更新彝圈动态云函数：动态正文超过长度限制，拒绝重新提交', content.length)
    return {
      success: false,
      data: null,
      message: '动态正文不能超过 500 字',
    }
  }

  try {
    // 中文注释：先解析微信身份，再绑定项目用户资料，确保权限判断准确可靠。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('更新彝圈动态云函数：当前微信 openid 解析完成', openid)

    if (!openid) {
      console.log('更新彝圈动态云函数：当前未解析到微信身份，终止修改流程')
      return {
        success: false,
        data: null,
        message: '未获取到当前微信身份，请重新登录后再试',
      }
    }

    const currentUserProfile = await getUserByOpenId(openid)

    if (!currentUserProfile) {
      console.log('更新彝圈动态云函数：当前微信账号未绑定项目用户资料，终止修改流程')
      return {
        success: false,
        data: null,
        message: '请先完成登录后再修改动态',
      }
    }

    console.log('更新彝圈动态云函数：开始读取原始动态记录', postId)
    const postResult = await db.collection(POST_COLLECTION_NAME).doc(postId).get()
    const currentPost = postResult.data || null
    console.log('更新彝圈动态云函数：原始动态记录读取完成', currentPost)

    if (!currentPost || !currentPost._id) {
      console.log('更新彝圈动态云函数：未找到对应动态，终止修改流程')
      return {
        success: false,
        data: null,
        message: '未找到需要修改的动态',
      }
    }

    if (currentPost.userId !== currentUserProfile._id) {
      console.log('更新彝圈动态云函数：当前用户不是动态作者，拒绝修改', {
        postUserId: currentPost.userId,
        currentUserId: currentUserProfile._id,
      })
      return {
        success: false,
        data: null,
        message: '只能修改自己的动态',
      }
    }

    if (currentPost.status !== 'rejected') {
      console.log('更新彝圈动态云函数：当前动态不是驳回状态，不允许重新提交', currentPost.status)
      return {
        success: false,
        data: null,
        message: '只有已驳回的动态才可以重新编辑提交',
      }
    }

    const currentTime = Date.now()
    const nextPostData = {
      nickName: currentUserProfile.nickName || currentPost.nickName || '微信用户',
      avatarUrl: currentUserProfile.avatarUrl || currentPost.avatarUrl || '',
      content,
      imageList,
      status: 'pending',
      reviewRemark: '',
      reviewedAt: 0,
      reviewerId: '',
      updatedAt: currentTime,
    }
    console.log('更新彝圈动态云函数：开始更新驳回动态并重置为待审核状态', nextPostData)

    await db.collection(POST_COLLECTION_NAME).doc(postId).update({
      data: nextPostData,
    })
    console.log('更新彝圈动态云函数：驳回动态更新完成，开始回查最新记录', postId)

    const latestResult = await db.collection(POST_COLLECTION_NAME).doc(postId).get()
    const latestPost = latestResult.data || {}
    console.log('更新彝圈动态云函数：最新动态记录回查完成', latestPost)

    return {
      success: true,
      data: buildReturnPost(latestPost),
      message: '动态已重新提交审核',
    }
  } catch (error) {
    console.error('更新彝圈动态云函数：修改动态流程失败', error)
    return {
      success: false,
      data: null,
      message: '动态修改失败，请稍后重试',
      errorMessage: error.message || '',
    }
  }
}
