const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保昵称更新在当前环境执行。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，后续按当前微信身份更新昵称。
const db = cloud.database()
const USER_COLLECTION_NAME = 'user'

// 中文注释：按 openid 查询用户资料，避免前端仅靠 id 越权修改。
async function getUserByOpenId(openid) {
  console.log('更新昵称云函数：开始按 openid 查询用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  console.log('更新昵称云函数：openid 查询完成，命中数量', result.data.length)
  return result.data[0] || null
}

// 中文注释：云函数主入口，只允许更新当前微信身份的昵称。
exports.main = async (event) => {
  console.log('更新昵称云函数：收到昵称更新请求', {
    hasNickName: Boolean(event && event.nickName),
  })

  // 中文注释：先拿到当前微信身份的 openid。
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || ''
  console.log('更新昵称云函数：获取到当前 openid', openid)

  if (!openid) {
    console.log('更新昵称云函数：未获取到 openid，直接返回失败')
    return {
      success: false,
      data: null,
      message: '未获取到当前微信身份',
    }
  }

  // 中文注释：先校验前端是否输入了新的昵称。
  if (!event || !event.nickName || !String(event.nickName).trim()) {
    console.log('更新昵称云函数：昵称为空，拒绝更新')
    return {
      success: false,
      data: null,
      message: '缺少昵称内容',
    }
  }

  try {
    // 中文注释：查询当前微信账号绑定的用户资料。
    const profile = await getUserByOpenId(openid)

    if (!profile) {
      console.log('更新昵称云函数：当前微信账号未绑定用户资料')
      return {
        success: false,
        data: null,
        message: '当前微信账号尚未绑定用户资料',
      }
    }

    const normalizedNickName = String(event.nickName).trim()
    const updateData = {
      nickName: normalizedNickName,
      updatedAt: new Date().toISOString(),
    }

    console.log('更新昵称云函数：开始写入新的昵称', profile._id, updateData)
    await db.collection(USER_COLLECTION_NAME).doc(profile._id).update({
      data: updateData,
    })
    console.log('更新昵称云函数：昵称更新成功', profile._id)

    return {
      success: true,
      data: {
        _id: profile._id,
        nickName: normalizedNickName,
      },
      message: '更新昵称成功',
    }
  } catch (error) {
    console.error('更新昵称云函数：昵称更新失败', error)
    return {
      success: false,
      data: null,
      message: '更新昵称失败',
      errorMessage: error.message || '',
    }
  }
}
