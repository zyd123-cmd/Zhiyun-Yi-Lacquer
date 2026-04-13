const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保彝圈动态查询始终运行在当前小程序云环境中。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，后续动态和用户资料查询都会通过这里执行。
const db = cloud.database()
const _ = db.command
const POST_COLLECTION_NAME = 'yiquan_posts'
const USER_COLLECTION_NAME = 'user'

// 中文注释：统一规范分页大小，避免一次性查询过多动态拖慢彝圈首屏。
function normalizePageSize(pageSize) {
  console.log('获取彝圈动态云函数：开始规范分页大小', pageSize)
  const normalizedPageSize = Math.min(Math.max(Number(pageSize) || 30, 1), 50)
  console.log('获取彝圈动态云函数：分页大小规范完成', normalizedPageSize)
  return normalizedPageSize
}

// 中文注释：按 openid 查询当前登录用户，用于判断动态是否属于当前用户。
async function getUserByOpenId(openid) {
  console.log('获取彝圈动态云函数：开始按 openid 查询当前用户', openid)

  if (!openid) {
    console.log('获取彝圈动态云函数：openid 为空，直接返回空用户')
    return null
  }

  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('获取彝圈动态云函数：当前用户查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：统一格式化动态返回结构，避免把敏感 openid 直接传回前端。
function formatPost(post, currentUserId, currentOpenid) {
  console.log('获取彝圈动态云函数：开始格式化单条动态', post && post._id)
  const isOwner =
    Boolean(currentUserId && post.userId === currentUserId) ||
    Boolean(currentOpenid && post.openid === currentOpenid)
  const formattedPost = {
    _id: post._id,
    userId: post.userId || '',
    nickName: post.nickName || '微信用户',
    avatarUrl: post.avatarUrl || '',
    content: post.content || '',
    imageList: Array.isArray(post.imageList) ? post.imageList : [],
    status: post.status || 'approved',
    commentCount: Number(post.commentCount || 0),
    createdAt: Number(post.createdAt || 0),
    updatedAt: Number(post.updatedAt || 0),
    isOwner,
    canDelete: isOwner,
  }
  console.log('获取彝圈动态云函数：单条动态格式化完成', formattedPost)
  return formattedPost
}

// 中文注释：云函数入口，只返回审核通过的动态，保证普通用户端看不到待审核内容。
exports.main = async (event) => {
  console.log('获取彝圈动态云函数：收到动态列表查询请求', event || {})
  const pageSize = normalizePageSize(event && event.pageSize)

  try {
    // 中文注释：先解析微信 openid，再查询项目用户资料，用于补齐删除权限。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('获取彝圈动态云函数：当前微信 openid 解析完成', openid)
    const currentUserProfile = await getUserByOpenId(openid)
    const currentUserId = currentUserProfile ? currentUserProfile._id : ''
    console.log('获取彝圈动态云函数：当前项目用户 id 解析完成', currentUserId)

    // 中文注释：用户端公开展示审核通过动态，同时额外展示当前用户自己的待审核和驳回动态。
    const approvedPostResult = await db.collection(POST_COLLECTION_NAME)
      .where({
        status: 'approved',
      })
      .limit(pageSize)
      .get()
    console.log('获取彝圈动态云函数：公开动态查询完成', approvedPostResult.data.length)

    let ownerPostResult = {
      data: [],
    }

    if (currentUserId) {
      console.log('获取彝圈动态云函数：当前用户已登录，开始查询自己的待审核和驳回动态', currentUserId)
      ownerPostResult = await db.collection(POST_COLLECTION_NAME)
        .where({
          userId: currentUserId,
          status: _.in(['pending', 'rejected']),
        })
        .limit(50)
        .get()
      console.log('获取彝圈动态云函数：当前用户自己的非公开动态查询完成', ownerPostResult.data.length)
    }

    const postMap = {}
    ;[...(approvedPostResult.data || []), ...(ownerPostResult.data || [])].forEach((post) => {
      console.log('获取彝圈动态云函数：准备合并动态结果', post && post._id)
      if (post && post._id && post.status !== 'deleted') {
        postMap[post._id] = post
      }
    })
    const mergedPostList = Object.keys(postMap).map((postId) => postMap[postId])
    console.log('获取彝圈动态云函数：公开动态和个人待审核动态合并完成', mergedPostList.length)

    const postList = mergedPostList
      .sort((currentPost, nextPost) => Number(nextPost.createdAt || 0) - Number(currentPost.createdAt || 0))
      .map((post) => formatPost(post, currentUserId, openid))
    console.log('获取彝圈动态云函数：动态列表格式化完成', postList.length)

    return {
      success: true,
      data: {
        list: postList,
        totalCount: postList.length,
      },
      message: '获取彝圈动态成功',
    }
  } catch (error) {
    console.error('获取彝圈动态云函数：动态列表查询失败', error)
    return {
      success: false,
      data: {
        list: [],
        totalCount: 0,
      },
      message: '获取彝圈动态失败',
      errorMessage: error.message || '',
    }
  }
}
