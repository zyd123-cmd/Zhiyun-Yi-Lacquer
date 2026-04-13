const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，保证用户资料查询始终使用当前环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，用于按当前微信身份查询用户资料。
const db = cloud.database()
const USER_COLLECTION_NAME = 'user'

// 中文注释：按 openid 查询当前微信身份对应的用户资料。
async function getUserByOpenId(openid) {
  console.log('获取用户资料云函数：开始按 openid 查询用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  console.log('获取用户资料云函数：openid 查询完成，命中数量', result.data.length)
  return result.data[0] || null
}

// 中文注释：云函数主入口，只允许读取当前微信账号对应的资料。
exports.main = async (event) => {
  console.log('获取用户资料云函数：收到查询请求', event || {})

  // 中文注释：先从微信上下文拿到当前用户的 openid。
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || ''
  console.log('获取用户资料云函数：获取到当前 openid', openid)

  if (!openid) {
    console.log('获取用户资料云函数：未获取到 openid，直接返回失败')
    return {
      success: false,
      data: null,
      openid: '',
      message: '未获取到当前微信身份',
    }
  }

  try {
    // 中文注释：按 openid 查询当前用户资料。
    const profile = await getUserByOpenId(openid)

    if (!profile) {
      console.log('获取用户资料云函数：当前微信账号尚未绑定任何用户资料')
      return {
        success: true,
        data: null,
        openid,
        message: '当前微信账号尚未绑定用户资料',
      }
    }

    // 中文注释：如果前端额外传了 id，则校验它必须与当前账号资料一致。
    if (event && event.id && event.id !== profile._id) {
      console.log('获取用户资料云函数：前端传入的用户 id 与当前微信身份不一致', event.id, profile._id)
      return {
        success: false,
        data: null,
        openid,
        message: '当前微信账号与请求的用户资料不匹配',
      }
    }

    console.log('获取用户资料云函数：用户资料查询成功', profile._id)
    return {
      success: true,
      data: profile,
      openid,
      message: '获取用户资料成功',
    }
  } catch (error) {
    console.error('获取用户资料云函数：查询失败', error)
    return {
      success: false,
      data: null,
      openid,
      message: '获取用户资料失败',
      errorMessage: error.message || '',
    }
  }
}
