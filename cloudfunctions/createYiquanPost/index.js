const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保彝圈发布动态时写入当前云环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，发布动态和用户资料校验都会通过这里完成。
const db = cloud.database()
const POST_COLLECTION_NAME = 'yiquan_posts'
const USER_COLLECTION_NAME = 'user'

// 中文注释：统一规整动态正文，避免空格内容和超长内容直接入库。
function normalizeContent(content) {
  console.log('创建彝圈动态云函数：开始规整动态正文', content)
  const normalizedContent = typeof content === 'string' ? content.trim() : ''
  console.log('创建彝圈动态云函数：动态正文规整完成', normalizedContent)
  return normalizedContent
}

// 中文注释：统一规整图片列表，最多保留九张图，满足朋友圈九宫格展示结构。
function normalizeImageList(imageList) {
  console.log('创建彝圈动态云函数：开始规整动态图片列表', imageList)
  const normalizedImageList = (Array.isArray(imageList) ? imageList : [])
    .filter((imageUrl) => typeof imageUrl === 'string' && imageUrl.trim())
    .slice(0, 9)
  console.log('创建彝圈动态云函数：动态图片列表规整完成', normalizedImageList)
  return normalizedImageList
}

// 中文注释：按 openid 查询当前用户，保证只有真实登录用户才能发布动态。
async function getUserByOpenId(openid) {
  console.log('创建彝圈动态云函数：开始按 openid 查询当前用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  const userProfile = result.data[0] || null
  console.log('创建彝圈动态云函数：当前用户查询完成', userProfile ? userProfile._id : '')
  return userProfile
}

// 中文注释：云函数入口，普通用户发布后统一写入 pending，等待管理员审核。
exports.main = async (event) => {
  console.log('创建彝圈动态云函数：收到创建动态请求', event || {})
  const content = normalizeContent(event && event.content)
  const imageList = normalizeImageList(event && event.imageList)

  if (!content && !imageList.length) {
    console.log('创建彝圈动态云函数：正文和图片都为空，拒绝创建动态')
    return {
      success: false,
      data: null,
      message: '请填写内容或上传图片',
    }
  }

  if (content.length > 500) {
    console.log('创建彝圈动态云函数：动态正文超出长度限制，拒绝创建动态', content.length)
    return {
      success: false,
      data: null,
      message: '动态正文不能超过 500 字',
    }
  }

  try {
    // 中文注释：从微信上下文获取 openid，再绑定到当前项目用户资料。
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID || ''
    console.log('创建彝圈动态云函数：当前微信 openid 解析完成', openid)

    if (!openid) {
      return {
        success: false,
        data: null,
        message: '未获取到当前微信身份，请重新登录后再发布',
      }
    }

    const currentUserProfile = await getUserByOpenId(openid)

    if (!currentUserProfile) {
      console.log('创建彝圈动态云函数：当前微信账号尚未绑定项目用户资料，拒绝创建动态')
      return {
        success: false,
        data: null,
        message: '请先完成登录后再发布动态',
      }
    }

    const currentTime = Date.now()
    const postData = {
      userId: currentUserProfile._id,
      openid,
      nickName: currentUserProfile.nickName || '微信用户',
      avatarUrl: currentUserProfile.avatarUrl || '',
      content,
      imageList,
      status: 'pending',
      reviewRemark: '',
      commentCount: 0,
      createdAt: currentTime,
      updatedAt: currentTime,
      reviewedAt: 0,
      reviewerId: '',
    }
    console.log('创建彝圈动态云函数：动态入库数据组装完成', postData)

    const createResult = await db.collection(POST_COLLECTION_NAME).add({
      data: postData,
    })
    console.log('创建彝圈动态云函数：动态创建完成，等待管理员审核', createResult._id)

    return {
      success: true,
      data: {
        _id: createResult._id,
        ...postData,
      },
      message: '动态已提交审核，通过后将在彝圈展示',
    }
  } catch (error) {
    console.error('创建彝圈动态云函数：动态创建失败', error)
    return {
      success: false,
      data: null,
      message: '动态提交失败，请稍后重试',
      errorMessage: error.message || '',
    }
  }
}
