const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保头像更新在当前云环境执行。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，后续按当前微信身份更新头像。
const db = cloud.database()
const USER_COLLECTION_NAME = 'user'

// 中文注释：按 openid 查询用户资料，确保只能改自己的头像。
async function getUserByOpenId(openid) {
  console.log('更新头像云函数：开始按 openid 查询用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  console.log('更新头像云函数：openid 查询完成，命中数量', result.data.length)
  return result.data[0] || null
}

// 中文注释：云函数主入口，只允许更新当前微信身份的头像。
exports.main = async (event) => {
  console.log('更新头像云函数：收到头像更新请求', {
    hasAvatarUrl: Boolean(event && event.avatarUrl),
  })

  // 中文注释：先拿到当前微信用户 openid。
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || ''
  console.log('更新头像云函数：获取到当前 openid', openid)

  if (!openid) {
    console.log('更新头像云函数：未获取到 openid，直接返回失败')
    return {
      success: false,
      data: null,
      message: '未获取到当前微信身份',
    }
  }

  // 中文注释：校验前端是否传入了新的头像地址。
  if (!event || !event.avatarUrl) {
    console.log('更新头像云函数：前端未传入头像地址，无法继续更新')
    return {
      success: false,
      data: null,
      message: '缺少头像地址',
    }
  }

  try {
    // 中文注释：查询当前微信账号绑定的用户资料。
    const profile = await getUserByOpenId(openid)

    if (!profile) {
      console.log('更新头像云函数：当前微信账号未绑定用户资料')
      return {
        success: false,
        data: null,
        message: '当前微信账号尚未绑定用户资料',
      }
    }

    const updateData = {
      avatarUrl: event.avatarUrl,
      updatedAt: new Date().toISOString(),
    }

    console.log('更新头像云函数：开始写入新的头像地址', profile._id, updateData)
    await db.collection(USER_COLLECTION_NAME).doc(profile._id).update({
      data: updateData,
    })
    console.log('更新头像云函数：头像更新成功', profile._id)

    return {
      success: true,
      data: {
        _id: profile._id,
        avatarUrl: event.avatarUrl,
      },
      message: '更新头像成功',
    }
  } catch (error) {
    console.error('更新头像云函数：头像更新失败', error)
    return {
      success: false,
      data: null,
      message: '更新头像失败',
      errorMessage: error.message || '',
    }
  }
}
