const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保云函数始终运行在当前环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取云数据库实例，后续所有登录与用户操作都走这里。
const db = cloud.database()
const USER_COLLECTION_NAME = 'user'

// 中文注释：按 openid 查询当前微信账号绑定的用户资料。
async function getUserByOpenId(openid) {
  console.log('微信登录云函数：开始按 openid 查询用户', openid)
  const result = await db.collection(USER_COLLECTION_NAME).where({ openid }).limit(1).get()
  console.log('微信登录云函数：openid 查询完成，命中数量', result.data.length)
  return result.data[0] || null
}

// 中文注释：按旧的用户主键查询历史资料，兼容项目之前的伪登录数据。
async function getUserById(userId) {
  if (!userId) {
    console.log('微信登录云函数：未传入旧用户 id，跳过旧账号查询')
    return null
  }

  console.log('微信登录云函数：开始按旧用户 id 查询历史资料', userId)

  try {
    const result = await db.collection(USER_COLLECTION_NAME).doc(userId).get()
    console.log('微信登录云函数：旧用户资料查询成功', result.data && result.data._id)
    return result.data || null
  } catch (error) {
    console.log('微信登录云函数：旧用户资料查询失败，按未命中处理', error)
    return null
  }
}

// 中文注释：统一更新用户资料，避免多处写重复更新代码。
async function updateUserProfile(userId, updateData) {
  console.log('微信登录云函数：开始更新用户资料', userId, updateData)
  await db.collection(USER_COLLECTION_NAME).doc(userId).update({
    data: updateData,
  })
  console.log('微信登录云函数：用户资料更新完成', userId)
}

// 中文注释：提取可写入的用户资料字段，避免把空值覆盖进数据库。
function buildWritableProfile(event, currentTime) {
  const updateData = {
    updatedAt: currentTime,
    lastLoginAt: currentTime,
  }

  console.log('微信登录云函数：开始组装可写入的用户资料字段')

  if (typeof event.avatarUrl === 'string' && event.avatarUrl.trim()) {
    updateData.avatarUrl = event.avatarUrl.trim()
  }

  if (typeof event.nickName === 'string' && event.nickName.trim()) {
    updateData.nickName = event.nickName.trim()
  }

  if (typeof event.backimage === 'string') {
    updateData.backimage = event.backimage
  }

  if (Array.isArray(event.imagelist)) {
    updateData.imagelist = event.imagelist
  }

  console.log('微信登录云函数：可写入字段组装完成', updateData)
  return updateData
}

// 中文注释：统一格式化返回结果，方便前端直接读取登录状态。
function buildResponse(success, data, openid, message, extra = {}) {
  console.log('微信登录云函数：开始组装返回结果', success, message)
  return {
    success,
    data,
    openid,
    message,
    ...extra,
  }
}

// 中文注释：云函数主入口，负责处理微信登录、老账号绑定和首次建档。
exports.main = async (event) => {
  console.log('微信登录云函数：收到登录请求', {
    hasCode: Boolean(event && event.code),
    createIfNotExists: Boolean(event && event.createIfNotExists),
    hasAvatar: Boolean(event && event.avatarUrl),
    hasNickName: Boolean(event && event.nickName),
    hasLegacyUserId: Boolean(event && event.legacyUserId),
  })

  // 中文注释：先校验前端是否真实调用了微信登录接口。
  if (!event || !event.code) {
    console.log('微信登录云函数：缺少 wx.login 返回的 code，直接拒绝请求')
    return buildResponse(false, null, '', '缺少微信登录凭证 code')
  }

  // 中文注释：从云函数上下文中提取当前微信用户身份。
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || ''
  console.log('微信登录云函数：获取到当前微信 openid', openid)

  if (!openid) {
    console.log('微信登录云函数：未能获取到微信 openid，登录失败')
    return buildResponse(false, null, '', '未获取到当前微信身份')
  }

  const currentTime = new Date().toISOString()
  const writableProfile = buildWritableProfile(event, currentTime)

  try {
    // 中文注释：优先查询当前微信账号是否已经绑定过项目用户。
    let profile = await getUserByOpenId(openid)

    if (profile) {
      console.log('微信登录云函数：检测到当前微信账号已绑定用户，准备刷新登录时间')
      await updateUserProfile(profile._id, writableProfile)
      profile = {
        ...profile,
        ...writableProfile,
      }
      console.log('微信登录云函数：已完成老用户登录')
      return buildResponse(true, profile, openid, '微信登录成功', {
        isNewUser: false,
        needsProfile: false,
      })
    }

    // 中文注释：如果前端只是做静默登录探测，则直接返回未建档状态。
    if (!event.createIfNotExists) {
      console.log('微信登录云函数：当前微信账号尚未建档，返回前端继续补资料')
      return buildResponse(true, null, openid, '当前微信账号尚未绑定用户资料', {
        isNewUser: false,
        needsProfile: true,
      })
    }

    // 中文注释：用户主动登录时，先尝试把旧的本地账号绑定到当前 openid。
    const legacyProfile = await getUserById(event.legacyUserId)

    if (legacyProfile && !legacyProfile.openid) {
      console.log('微信登录云函数：检测到可绑定的旧账号，准备写入 openid')
      const legacyUpdateData = {
        ...writableProfile,
        openid,
      }
      await updateUserProfile(legacyProfile._id, legacyUpdateData)
      profile = {
        ...legacyProfile,
        ...legacyUpdateData,
      }
      console.log('微信登录云函数：旧账号绑定当前微信身份成功', profile._id)
      return buildResponse(true, profile, openid, '微信登录成功，已绑定历史账号', {
        isNewUser: false,
        needsProfile: false,
        isBoundLegacyUser: true,
      })
    }

    // 中文注释：首次建档时必须带上头像和昵称，保证用户资料完整。
    if (!writableProfile.avatarUrl || !writableProfile.nickName) {
      console.log('微信登录云函数：首次建档缺少头像或昵称，拒绝创建新用户')
      return buildResponse(false, null, openid, '首次登录请先补充头像和昵称')
    }

    // 中文注释：创建新的微信用户资料，并写入 openid 作为唯一身份绑定。
    const createData = {
      openid,
      avatarUrl: writableProfile.avatarUrl,
      nickName: writableProfile.nickName,
      backimage: writableProfile.backimage || '',
      imagelist: writableProfile.imagelist || [],
      createdAt: currentTime,
      updatedAt: currentTime,
      lastLoginAt: currentTime,
    }

    console.log('微信登录云函数：开始创建新的微信用户资料', createData)
    const createResult = await db.collection(USER_COLLECTION_NAME).add({
      data: createData,
    })
    profile = {
      _id: createResult._id,
      ...createData,
    }
    console.log('微信登录云函数：新用户创建成功', profile._id)

    return buildResponse(true, profile, openid, '微信登录成功，已创建新用户', {
      isNewUser: true,
      needsProfile: false,
    })
  } catch (error) {
    console.error('微信登录云函数：登录处理失败', error)
    return buildResponse(false, null, openid, '微信登录失败，请稍后重试', {
      errorMessage: error.message || '',
    })
  }
}
