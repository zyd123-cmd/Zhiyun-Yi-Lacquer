const cloud = require('wx-server-sdk')
const crypto = require('crypto')

// 中文注释：初始化云开发环境，确保管理员后台所有操作都运行在当前云环境。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取云数据库实例，后续管理员认证、文章、模型、评论管理都通过这里执行。
const db = cloud.database()
const _ = db.command
const ADMIN_COLLECTION_NAME = 'admin_users'
const ADMIN_SESSION_COLLECTION_NAME = 'admin_sessions'
const ARTICLE_COLLECTION_NAME = 'articles'
const MODEL_COLLECTION_NAME = 'artifact_models'
const COMMENT_COLLECTION_NAME = 'article_comments'
const COMMENT_LIKE_COLLECTION_NAME = 'article_comment_likes'
const ADMIN_SESSION_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000

// 中文注释：统一裁剪字符串输入，避免前后空格和非字符串类型直接写入数据库。
function normalizeText(value) {
  const normalizedText = typeof value === 'string' ? value.trim() : ''
  console.log('管理员后台云函数：字符串规范化完成', normalizedText)
  return normalizedText
}

// 中文注释：统一转换数值输入，避免空值和非法值导致排序字段异常。
function normalizeNumber(value, fallbackValue = 0) {
  const parsedValue = Number(value)
  const normalizedNumber = Number.isFinite(parsedValue) ? parsedValue : fallbackValue
  console.log('管理员后台云函数：数值规范化完成', {
    originalValue: value,
    normalizedNumber,
  })
  return normalizedNumber
}

// 中文注释：统一把文章正文从多行文本切分为段落数组，兼容前端直接传数组和纯文本两种方式。
function normalizeArticleContent(content) {
  console.log('管理员后台云函数：开始规范文章正文内容', content)

  if (Array.isArray(content)) {
    const normalizedArray = content
      .map((item) => normalizeText(item))
      .filter((item) => item)
    console.log('管理员后台云函数：文章正文数组规范化完成', normalizedArray.length)
    return normalizedArray
  }

  const normalizedText = normalizeText(content)

  if (!normalizedText) {
    console.log('管理员后台云函数：文章正文为空，返回空数组')
    return []
  }

  const normalizedArray = normalizedText
    .split(/\r?\n+/)
    .map((item) => normalizeText(item))
    .filter((item) => item)
  console.log('管理员后台云函数：文章正文文本切分完成', normalizedArray.length)
  return normalizedArray
}

// 中文注释：统一规范图片数组，避免把空路径写入数据库。
function normalizeImageList(imageList) {
  console.log('管理员后台云函数：开始规范图片数组', imageList)

  if (!Array.isArray(imageList)) {
    console.log('管理员后台云函数：图片数组不是数组类型，返回空数组')
    return []
  }

  const normalizedList = imageList
    .map((item) => normalizeText(item))
    .filter((item) => item)
  console.log('管理员后台云函数：图片数组规范化完成', normalizedList.length)
  return normalizedList
}

// 中文注释：统一计算密码哈希值，避免在数据库里存储明文密码。
function hashPassword(password) {
  const normalizedPassword = normalizeText(password)
  const passwordHash = crypto.createHash('sha256').update(normalizedPassword).digest('hex')
  console.log('管理员后台云函数：密码哈希计算完成')
  return passwordHash
}

// 中文注释：统一返回成功结果，方便管理员端按一致结构处理响应。
function buildSuccess(data, message, extra = {}) {
  console.log('管理员后台云函数：开始组装成功返回结果', {
    message,
    data,
  })
  return {
    success: true,
    data,
    message,
    ...extra,
  }
}

// 中文注释：统一返回失败结果，方便管理员端直接展示错误信息。
function buildFailure(message, extra = {}) {
  console.log('管理员后台云函数：开始组装失败返回结果', {
    message,
    extra,
  })
  return {
    success: false,
    data: null,
    message,
    ...extra,
  }
}

// 中文注释：统一对管理员请求参数做脱敏处理，避免在云函数日志中暴露密码和会话 token。
function maskSensitiveEvent(event) {
  if (!event || typeof event !== 'object') {
    return event
  }

  const maskedEvent = {
    ...event,
  }

  if (Object.prototype.hasOwnProperty.call(maskedEvent, 'password')) {
    maskedEvent.password = maskedEvent.password ? '***' : ''
  }

  if (Object.prototype.hasOwnProperty.call(maskedEvent, 'sessionToken')) {
    maskedEvent.sessionToken = maskedEvent.sessionToken ? '***' : ''
  }

  return maskedEvent
}

// 中文注释：提取当前微信 openid，用于管理员身份识别和会话校验。
function getCurrentOpenId() {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || ''
  console.log('管理员后台云函数：当前微信 openid 解析完成', openid)
  return openid
}

// 中文注释：按管理员账号查询管理员资料，用于登录和初始化管理员时校验唯一性。
async function getAdminByAccount(account) {
  console.log('管理员后台云函数：开始按管理员账号查询管理员资料', account)
  const result = await db.collection(ADMIN_COLLECTION_NAME).where({ account }).limit(1).get()
  const adminProfile = result.data[0] || null
  console.log('管理员后台云函数：按管理员账号查询完成', adminProfile ? adminProfile._id : '')
  return adminProfile
}

// 中文注释：按 openid 查询管理员资料，用于后台免登录恢复和会话校验。
async function getAdminByOpenId(openid) {
  console.log('管理员后台云函数：开始按 openid 查询管理员资料', openid)
  const result = await db.collection(ADMIN_COLLECTION_NAME).where({ openid }).limit(1).get()
  const adminProfile = result.data[0] || null
  console.log('管理员后台云函数：按 openid 查询管理员资料完成', adminProfile ? adminProfile._id : '')
  return adminProfile
}

// 中文注释：按管理员 id 查询管理员资料，用于会话校验后恢复管理员信息。
async function getAdminById(adminId) {
  console.log('管理员后台云函数：开始按管理员 id 查询管理员资料', adminId)
  const result = await db.collection(ADMIN_COLLECTION_NAME).doc(adminId).get()
  const adminProfile = result.data || null
  console.log('管理员后台云函数：按管理员 id 查询管理员资料完成', adminProfile ? adminProfile._id : '')
  return adminProfile
}

// 中文注释：生成管理员会话 token，用于管理员后台的登录态持久化和接口鉴权。
async function createAdminSession(adminProfile, openid) {
  console.log('管理员后台云函数：开始创建管理员会话', {
    adminId: adminProfile && adminProfile._id,
    openid,
  })
  const currentTime = Date.now()
  const expiresAt = currentTime + ADMIN_SESSION_EXPIRE_MS
  const sessionToken = crypto.randomBytes(24).toString('hex')

  const oldSessionResult = await db.collection(ADMIN_SESSION_COLLECTION_NAME)
    .where({
      adminId: adminProfile._id,
      openid,
    })
    .limit(200)
    .get()

  for (let index = 0; index < oldSessionResult.data.length; index += 1) {
    const oldSession = oldSessionResult.data[index]
    console.log('管理员后台云函数：准备清理旧管理员会话', oldSession._id)
    await db.collection(ADMIN_SESSION_COLLECTION_NAME).doc(oldSession._id).remove()
    console.log('管理员后台云函数：旧管理员会话清理完成', oldSession._id)
  }

  const createResult = await db.collection(ADMIN_SESSION_COLLECTION_NAME).add({
    data: {
      adminId: adminProfile._id,
      openid,
      sessionToken,
      createdAt: currentTime,
      updatedAt: currentTime,
      expiresAt,
    },
  })
  console.log('管理员后台云函数：管理员会话创建完成', createResult._id)

  return {
    sessionToken,
    expiresAt,
  }
}

// 中文注释：按 sessionToken 和 openid 查询管理员会话，保证后台操作必须来源于已登录的管理员端。
async function getAdminSession(sessionToken, openid) {
  console.log('管理员后台云函数：开始查询管理员会话', {
    sessionToken,
    openid,
  })
  const result = await db.collection(ADMIN_SESSION_COLLECTION_NAME)
    .where({
      sessionToken,
      openid,
    })
    .limit(1)
    .get()

  const session = result.data[0] || null
  console.log('管理员后台云函数：管理员会话查询完成', session ? session._id : '')
  return session
}

// 中文注释：统一校验管理员登录态，没有有效会话时直接拒绝后台操作。
async function assertAdminSession(event) {
  console.log('管理员后台云函数：开始校验管理员会话', event || {})
  const sessionToken = normalizeText(event && event.sessionToken)
  const openid = getCurrentOpenId()

  if (!openid) {
    throw new Error('未获取到当前微信身份，请重新登录后再试')
  }

  if (!sessionToken) {
    throw new Error('管理员会话已失效，请重新登录')
  }

  const session = await getAdminSession(sessionToken, openid)

  if (!session) {
    throw new Error('管理员会话不存在，请重新登录')
  }

  if (Number(session.expiresAt || 0) <= Date.now()) {
    console.log('管理员后台云函数：管理员会话已过期，准备删除过期会话', session._id)
    await db.collection(ADMIN_SESSION_COLLECTION_NAME).doc(session._id).remove()
    throw new Error('管理员会话已过期，请重新登录')
  }

  const adminProfile = await getAdminById(session.adminId)

  if (!adminProfile || adminProfile.status !== 'active') {
    throw new Error('管理员账号不可用，请联系系统维护者')
  }

  console.log('管理员后台云函数：管理员会话校验通过', adminProfile._id)
  return {
    adminProfile,
    session,
    openid,
  }
}

// 中文注释：统一裁剪管理员资料返回字段，避免把密码哈希等敏感信息返回到客户端。
function buildAdminProfileResponse(adminProfile, sessionInfo = null) {
  console.log('管理员后台云函数：开始组装管理员资料返回结构', adminProfile && adminProfile._id)
  const responseData = {
    _id: adminProfile._id,
    account: adminProfile.account,
    nickName: adminProfile.nickName || '',
    role: adminProfile.role || 'admin',
    status: adminProfile.status || 'active',
    lastLoginAt: Number(adminProfile.lastLoginAt || 0),
    createdAt: Number(adminProfile.createdAt || 0),
  }

  if (sessionInfo) {
    responseData.sessionToken = sessionInfo.sessionToken
    responseData.expiresAt = sessionInfo.expiresAt
  }

  console.log('管理员后台云函数：管理员资料返回结构组装完成', responseData._id)
  return responseData
}

// 中文注释：统一清理指定字段对应的整批数据，用于删除文章时同步清理评论和点赞记录。
async function removeCollectionDocumentsByField(collectionName, fieldName, fieldValue) {
  console.log('管理员后台云函数：开始按字段批量删除集合数据', {
    collectionName,
    fieldName,
    fieldValue,
  })
  let removedCount = 0
  let shouldContinue = true

  while (shouldContinue) {
    const result = await db.collection(collectionName)
      .where({
        [fieldName]: fieldValue,
      })
      .limit(100)
      .get()

    if (!result.data.length) {
      shouldContinue = false
      continue
    }

    for (let index = 0; index < result.data.length; index += 1) {
      const currentDocument = result.data[index]
      console.log('管理员后台云函数：准备删除集合中的单条数据', {
        collectionName,
        documentId: currentDocument._id,
      })
      await db.collection(collectionName).doc(currentDocument._id).remove()
      removedCount += 1
      console.log('管理员后台云函数：集合中的单条数据删除完成', {
        collectionName,
        documentId: currentDocument._id,
      })
    }
  }

  console.log('管理员后台云函数：按字段批量删除集合数据完成', {
    collectionName,
    removedCount,
  })
  return removedCount
}

// 中文注释：统一校验 GLB 模型地址，避免误把非 glb 文件写成模型地址。
function validateModelUrl(modelUrl) {
  const normalizedModelUrl = normalizeText(modelUrl)
  const isValid = normalizedModelUrl.toLowerCase().endsWith('.glb')
  console.log('管理员后台云函数：GLB 模型地址校验完成', {
    normalizedModelUrl,
    isValid,
  })
  return isValid
}

// 中文注释：初始化首个管理员账号，只允许在管理员集合为空时执行一次。
async function bootstrapAdmin(event) {
  console.log('管理员后台云函数：开始执行初始化首个管理员流程', maskSensitiveEvent(event || {}))
  const openid = getCurrentOpenId()
  const account = normalizeText(event.account)
  const password = normalizeText(event.password)
  const nickName = normalizeText(event.nickName) || '系统管理员'

  if (!openid) {
    return buildFailure('未获取到当前微信身份，请重新登录后再试')
  }

  if (!account || !password) {
    return buildFailure('管理员账号和密码不能为空')
  }

  const countResult = await db.collection(ADMIN_COLLECTION_NAME).count()
  console.log('管理员后台云函数：当前管理员数量查询完成', countResult.total)

  if (countResult.total > 0) {
    return buildFailure('管理员账号已初始化，请直接登录')
  }

  const currentTime = Date.now()
  const passwordHash = hashPassword(password)
  const createResult = await db.collection(ADMIN_COLLECTION_NAME).add({
    data: {
      account,
      passwordHash,
      nickName,
      role: 'super_admin',
      status: 'active',
      openid,
      createdAt: currentTime,
      updatedAt: currentTime,
      lastLoginAt: currentTime,
    },
  })
  console.log('管理员后台云函数：首个管理员账号创建完成', createResult._id)

  const adminProfile = await getAdminById(createResult._id)
  const sessionInfo = await createAdminSession(adminProfile, openid)
  const responseData = buildAdminProfileResponse(adminProfile, sessionInfo)
  console.log('管理员后台云函数：初始化首个管理员流程完成', responseData._id)
  return buildSuccess(responseData, '管理员初始化成功')
}

// 中文注释：管理员账号登录，验证账号密码后为当前 openid 创建会话。
async function loginAdmin(event) {
  console.log('管理员后台云函数：开始执行管理员登录流程', maskSensitiveEvent(event || {}))
  const openid = getCurrentOpenId()
  const account = normalizeText(event.account)
  const password = normalizeText(event.password)

  if (!openid) {
    return buildFailure('未获取到当前微信身份，请重新登录后再试')
  }

  if (!account || !password) {
    return buildFailure('管理员账号和密码不能为空')
  }

  const adminProfile = await getAdminByAccount(account)

  if (!adminProfile || adminProfile.status !== 'active') {
    return buildFailure('管理员账号不存在或已停用')
  }

  if (adminProfile.passwordHash !== hashPassword(password)) {
    return buildFailure('管理员账号或密码错误')
  }

  const currentTime = Date.now()
  await db.collection(ADMIN_COLLECTION_NAME).doc(adminProfile._id).update({
    data: {
      openid,
      updatedAt: currentTime,
      lastLoginAt: currentTime,
    },
  })
  console.log('管理员后台云函数：管理员登录信息更新完成', adminProfile._id)

  const latestAdminProfile = await getAdminById(adminProfile._id)
  const sessionInfo = await createAdminSession(latestAdminProfile, openid)
  const responseData = buildAdminProfileResponse(latestAdminProfile, sessionInfo)
  console.log('管理员后台云函数：管理员登录流程完成', responseData._id)
  return buildSuccess(responseData, '管理员登录成功')
}

// 中文注释：读取当前管理员资料，用于管理员端静默恢复登录态。
async function getAdminProfileAction(event) {
  console.log('管理员后台云函数：开始读取当前管理员资料', maskSensitiveEvent(event || {}))
  const { adminProfile, session } = await assertAdminSession(event)
  const responseData = buildAdminProfileResponse(adminProfile, {
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt,
  })
  console.log('管理员后台云函数：当前管理员资料读取完成', responseData._id)
  return buildSuccess(responseData, '获取管理员资料成功')
}

// 中文注释：管理员退出登录时清理当前会话，避免旧会话继续被复用。
async function logoutAdmin(event) {
  console.log('管理员后台云函数：开始执行管理员退出登录流程', maskSensitiveEvent(event || {}))
  const { session } = await assertAdminSession(event)
  await db.collection(ADMIN_SESSION_COLLECTION_NAME).doc(session._id).remove()
  console.log('管理员后台云函数：管理员会话删除完成', session._id)
  return buildSuccess({
    sessionToken: '',
  }, '管理员已退出登录')
}

// 中文注释：列出文章列表，供管理员查看、编辑和删除文章使用。
async function listArticles(event) {
  console.log('管理员后台云函数：开始查询文章列表', maskSensitiveEvent(event || {}))
  await assertAdminSession(event)
  const result = await db.collection(ARTICLE_COLLECTION_NAME).limit(200).get()
  const articleList = (result.data || [])
    .sort((currentArticle, nextArticle) => Number(nextArticle.updatedAt || 0) - Number(currentArticle.updatedAt || 0))
    .map((article) => ({
      _id: article._id,
      title: article.title || '',
      author: article.author || '',
      type: article.type || '',
      imagesrc: Array.isArray(article.imagesrc) ? article.imagesrc : [],
      handup: Number(article.handup || 0),
      createdAt: Number(article.createdAt || 0),
      updatedAt: Number(article.updatedAt || 0),
    }))
  console.log('管理员后台云函数：文章列表查询完成', articleList.length)
  return buildSuccess(articleList, '获取文章列表成功')
}

// 中文注释：读取单篇文章详情，用于管理员编辑已有文章。
async function getArticleDetailAction(event) {
  console.log('管理员后台云函数：开始读取文章详情', maskSensitiveEvent(event || {}))
  await assertAdminSession(event)
  const articleId = normalizeText(event.articleId)

  if (!articleId) {
    return buildFailure('缺少文章 id')
  }

  const result = await db.collection(ARTICLE_COLLECTION_NAME).doc(articleId).get()
  console.log('管理员后台云函数：文章详情读取完成', result.data && result.data._id)
  return buildSuccess(result.data || null, '获取文章详情成功')
}

// 中文注释：保存文章，兼容新增文章和编辑文章两种场景。
async function saveArticle(event) {
  console.log('管理员后台云函数：开始保存文章', maskSensitiveEvent(event || {}))
  const { adminProfile } = await assertAdminSession(event)
  const articleId = normalizeText(event.articleId)
  const title = normalizeText(event.title)
  const author = normalizeText(event.author)
  const type = normalizeText(event.type)
  const content = normalizeArticleContent(event.content)
  const imagesrc = normalizeImageList(event.imagesrc)

  if (!title) {
    return buildFailure('文章标题不能为空')
  }

  if (!author) {
    return buildFailure('文章作者不能为空')
  }

  if (!content.length) {
    return buildFailure('文章正文不能为空')
  }

  const currentTime = Date.now()
  const articleData = {
    title,
    author,
    type,
    content,
    imagesrc,
    updatedAt: currentTime,
    adminId: adminProfile._id,
  }
  console.log('管理员后台云函数：文章保存数据组装完成', articleData)

  if (articleId) {
    await db.collection(ARTICLE_COLLECTION_NAME).doc(articleId).update({
      data: articleData,
    })
    console.log('管理员后台云函数：文章更新完成', articleId)

    const latestResult = await db.collection(ARTICLE_COLLECTION_NAME).doc(articleId).get()
    return buildSuccess(latestResult.data || null, '文章更新成功')
  }

  const createResult = await db.collection(ARTICLE_COLLECTION_NAME).add({
    data: {
      ...articleData,
      handup: 0,
      createdAt: currentTime,
      pagesrc: '',
    },
  })
  console.log('管理员后台云函数：文章创建完成', createResult._id)

  const pagesrc = `/subcontentpkg/hottopic/article0/article0?id=${createResult._id}`
  await db.collection(ARTICLE_COLLECTION_NAME).doc(createResult._id).update({
    data: {
      pagesrc,
    },
  })
  console.log('管理员后台云函数：新文章页面路径回填完成', createResult._id)

  const latestResult = await db.collection(ARTICLE_COLLECTION_NAME).doc(createResult._id).get()
  return buildSuccess(latestResult.data || null, '文章发布成功')
}

// 中文注释：删除文章时同步删除该文章下的评论和评论点赞记录，避免残留无效数据。
async function deleteArticle(event) {
  console.log('管理员后台云函数：开始删除文章', maskSensitiveEvent(event || {}))
  await assertAdminSession(event)
  const articleId = normalizeText(event.articleId)

  if (!articleId) {
    return buildFailure('缺少文章 id')
  }

  await db.collection(ARTICLE_COLLECTION_NAME).doc(articleId).remove()
  console.log('管理员后台云函数：文章主记录删除完成', articleId)
  await removeCollectionDocumentsByField(COMMENT_COLLECTION_NAME, 'articleId', articleId)
  await removeCollectionDocumentsByField(COMMENT_LIKE_COLLECTION_NAME, 'articleId', articleId)
  console.log('管理员后台云函数：文章相关评论和点赞记录清理完成', articleId)
  return buildSuccess({
    articleId,
  }, '文章删除成功')
}

// 中文注释：列出模型列表，供管理员查看、编辑和删除模型使用。
async function listModels(event) {
  console.log('管理员后台云函数：开始查询模型列表', maskSensitiveEvent(event || {}))
  await assertAdminSession(event)
  const result = await db.collection(MODEL_COLLECTION_NAME).limit(200).get()
  const modelList = (result.data || [])
    .sort((currentModel, nextModel) => Number(currentModel.order || 0) - Number(nextModel.order || 0))
    .map((model) => ({
      _id: model._id,
      name: model.name || '',
      image: model.image || '',
      modelUrl: model.modelUrl || '',
      scale3d: model.scale3d || '',
      position3d: model.position3d || '',
      description: model.description || '',
      order: Number(model.order || 0),
      updatedAt: Number(model.updatedAt || 0),
      createdAt: Number(model.createdAt || 0),
    }))
  console.log('管理员后台云函数：模型列表查询完成', modelList.length)
  return buildSuccess(modelList, '获取模型列表成功')
}

// 中文注释：读取单个模型详情，用于管理员编辑已有模型。
async function getModelDetailAction(event) {
  console.log('管理员后台云函数：开始读取模型详情', maskSensitiveEvent(event || {}))
  await assertAdminSession(event)
  const modelId = normalizeText(event.modelId)

  if (!modelId) {
    return buildFailure('缺少模型 id')
  }

  const result = await db.collection(MODEL_COLLECTION_NAME).doc(modelId).get()
  console.log('管理员后台云函数：模型详情读取完成', result.data && result.data._id)
  return buildSuccess(result.data || null, '获取模型详情成功')
}

// 中文注释：保存模型，兼容新增模型和编辑模型两种场景。
async function saveModel(event) {
  console.log('管理员后台云函数：开始保存模型', maskSensitiveEvent(event || {}))
  const { adminProfile } = await assertAdminSession(event)
  const modelId = normalizeText(event.modelId)
  const name = normalizeText(event.name)
  const image = normalizeText(event.image)
  const modelUrl = normalizeText(event.modelUrl)
  const scale3d = normalizeText(event.scale3d) || '1 1 1'
  const position3d = normalizeText(event.position3d) || '0 0 0'
  const description = normalizeText(event.description)
  const order = normalizeNumber(event.order, 0)

  if (!name) {
    return buildFailure('模型名称不能为空')
  }

  if (!image) {
    return buildFailure('请先上传模型封面图')
  }

  if (!modelUrl) {
    return buildFailure('请先上传 GLB 模型文件')
  }

  if (!validateModelUrl(modelUrl)) {
    return buildFailure('模型文件必须为 glb 格式')
  }

  const currentTime = Date.now()
  const modelData = {
    name,
    image,
    modelUrl,
    scale3d,
    position3d,
    description,
    order,
    updatedAt: currentTime,
    adminId: adminProfile._id,
  }
  console.log('管理员后台云函数：模型保存数据组装完成', modelData)

  if (modelId) {
    await db.collection(MODEL_COLLECTION_NAME).doc(modelId).update({
      data: modelData,
    })
    console.log('管理员后台云函数：模型更新完成', modelId)

    const latestResult = await db.collection(MODEL_COLLECTION_NAME).doc(modelId).get()
    return buildSuccess(latestResult.data || null, '模型更新成功')
  }

  const createResult = await db.collection(MODEL_COLLECTION_NAME).add({
    data: {
      ...modelData,
      createdAt: currentTime,
    },
  })
  console.log('管理员后台云函数：模型创建完成', createResult._id)

  const latestResult = await db.collection(MODEL_COLLECTION_NAME).doc(createResult._id).get()
  return buildSuccess(latestResult.data || null, '模型上传成功')
}

// 中文注释：删除模型记录，供管理员清理无效或错误上传的 3D 模型。
async function deleteModel(event) {
  console.log('管理员后台云函数：开始删除模型', maskSensitiveEvent(event || {}))
  await assertAdminSession(event)
  const modelId = normalizeText(event.modelId)

  if (!modelId) {
    return buildFailure('缺少模型 id')
  }

  await db.collection(MODEL_COLLECTION_NAME).doc(modelId).remove()
  console.log('管理员后台云函数：模型删除完成', modelId)
  return buildSuccess({
    modelId,
  }, '模型删除成功')
}

// 中文注释：列出评论列表并带上文章标题，方便管理员在后台统一查看和治理评论。
async function listComments(event) {
  console.log('管理员后台云函数：开始查询评论列表', maskSensitiveEvent(event || {}))
  await assertAdminSession(event)
  const result = await db.collection(COMMENT_COLLECTION_NAME).limit(200).get()
  const commentList = (result.data || []).sort(
    (currentComment, nextComment) => Number(nextComment.createdAt || 0) - Number(currentComment.createdAt || 0)
  )

  const articleResult = await db.collection(ARTICLE_COLLECTION_NAME).limit(200).get()
  const articleTitleMap = {}
  articleResult.data.forEach((article) => {
    articleTitleMap[article._id] = article.title || '未命名文章'
  })

  const formattedCommentList = commentList.map((comment) => ({
    _id: comment._id,
    articleId: comment.articleId || '',
    articleTitle: articleTitleMap[comment.articleId] || '未知文章',
    nickName: comment.nickName || '微信用户',
    content: comment.status === 'deleted' ? '该评论已删除' : (comment.content || ''),
    status: comment.status || 'active',
    likeCount: Number(comment.likeCount || 0),
    replyCount: Number(comment.replyCount || 0),
    createdAt: Number(comment.createdAt || 0),
  }))
  console.log('管理员后台云函数：评论列表查询完成', formattedCommentList.length)
  return buildSuccess(formattedCommentList, '获取评论列表成功')
}

// 中文注释：查询评论是否仍有子回复，存在子回复时管理员删除评论也走软删除，避免把其他回复链破坏掉。
async function hasChildComments(comment) {
  console.log('管理员后台云函数：开始查询评论是否仍有子回复', comment && comment._id)

  if (!comment || !comment._id) {
    console.log('管理员后台云函数：评论为空，直接判定不存在子回复')
    return false
  }

  const result = await db.collection(COMMENT_COLLECTION_NAME)
    .where({
      articleId: comment.articleId,
    })
    .limit(200)
    .get()

  const hasChildren = result.data.some((currentComment) => {
    if (currentComment._id === comment._id) {
      return false
    }

    if (currentComment.status !== 'active' && currentComment.status !== 'deleted' && currentComment.status) {
      return false
    }

    return (
      currentComment.parentCommentId === comment._id ||
      currentComment.replyToCommentId === comment._id ||
      (comment.rootCommentId
        ? currentComment.parentCommentId === comment._id
        : currentComment.rootCommentId === comment._id)
    )
  })
  console.log('管理员后台云函数：评论子回复查询完成', hasChildren)
  return hasChildren
}

// 中文注释：删除评论点赞记录，避免评论被硬删除后残留无效点赞数据。
async function removeCommentLikeRecords(commentId) {
  console.log('管理员后台云函数：开始清理评论点赞记录', commentId)
  const likeRecordResult = await db.collection(COMMENT_LIKE_COLLECTION_NAME)
    .where({
      commentId,
    })
    .limit(200)
    .get()

  for (let index = 0; index < likeRecordResult.data.length; index += 1) {
    const likeRecord = likeRecordResult.data[index]
    console.log('管理员后台云函数：准备删除单条评论点赞记录', likeRecord._id)
    await db.collection(COMMENT_LIKE_COLLECTION_NAME).doc(likeRecord._id).remove()
    console.log('管理员后台云函数：单条评论点赞记录删除完成', likeRecord._id)
  }

  console.log('管理员后台云函数：评论点赞记录清理完成', likeRecordResult.data.length)
}

// 中文注释：在硬删除回复评论后同步扣减父评论回复数，保持评论树展示准确。
async function decreaseParentReplyCount(parentCommentId) {
  console.log('管理员后台云函数：开始递减父评论回复数量', parentCommentId)

  if (!parentCommentId) {
    console.log('管理员后台云函数：当前评论不存在父评论，无需递减回复数量')
    return
  }

  await db.collection(COMMENT_COLLECTION_NAME).doc(parentCommentId).update({
    data: {
      replyCount: _.inc(-1),
      updatedAt: Date.now(),
    },
  })
  console.log('管理员后台云函数：父评论回复数量递减完成', parentCommentId)
}

// 中文注释：管理员删除评论，允许删除任意评论，并兼容软删除与硬删除两种场景。
async function deleteCommentByAdmin(event) {
  console.log('管理员后台云函数：开始执行管理员删除评论流程', maskSensitiveEvent(event || {}))
  await assertAdminSession(event)
  const commentId = normalizeText(event.commentId)

  if (!commentId) {
    return buildFailure('缺少评论 id')
  }

  const currentComment = await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).get()
  const commentData = currentComment.data || null

  if (!commentData) {
    return buildFailure('评论不存在或已删除')
  }

  if (commentData.status === 'deleted') {
    return buildSuccess({
      commentId,
      deleteMode: 'soft',
      status: 'deleted',
    }, '评论已删除')
  }

  const childCommentExists = await hasChildComments(commentData)

  if (childCommentExists) {
    await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).update({
      data: {
        status: 'deleted',
        content: '该评论已删除',
        updatedAt: Date.now(),
      },
    })
    console.log('管理员后台云函数：评论软删除完成', commentId)
    return buildSuccess({
      commentId,
      deleteMode: 'soft',
      status: 'deleted',
    }, '评论删除成功')
  }

  await removeCommentLikeRecords(commentId)
  await db.collection(COMMENT_COLLECTION_NAME).doc(commentId).remove()
  console.log('管理员后台云函数：评论硬删除完成', commentId)
  await decreaseParentReplyCount(commentData.parentCommentId || '')
  return buildSuccess({
    commentId,
    deleteMode: 'hard',
    status: 'deleted',
  }, '评论删除成功')
}

// 中文注释：统一根据 action 路由到具体管理员后台逻辑，减少管理员端函数调用分散程度。
exports.main = async (event) => {
  console.log('管理员后台云函数：收到管理员请求', maskSensitiveEvent(event || {}))
  const action = normalizeText(event && event.action)

  try {
    switch (action) {
      case 'bootstrapAdmin':
        return await bootstrapAdmin(event)
      case 'login':
        return await loginAdmin(event)
      case 'getProfile':
        return await getAdminProfileAction(event)
      case 'logout':
        return await logoutAdmin(event)
      case 'listArticles':
        return await listArticles(event)
      case 'getArticleDetail':
        return await getArticleDetailAction(event)
      case 'saveArticle':
        return await saveArticle(event)
      case 'deleteArticle':
        return await deleteArticle(event)
      case 'listModels':
        return await listModels(event)
      case 'getModelDetail':
        return await getModelDetailAction(event)
      case 'saveModel':
        return await saveModel(event)
      case 'deleteModel':
        return await deleteModel(event)
      case 'listComments':
        return await listComments(event)
      case 'deleteComment':
        return await deleteCommentByAdmin(event)
      default:
        console.log('管理员后台云函数：收到未知 action，直接返回失败结果', action)
        return buildFailure('未知的管理员操作类型')
    }
  } catch (error) {
    console.error('管理员后台云函数：管理员请求处理失败', error)
    return buildFailure(error.message || '管理员后台请求失败，请稍后重试', {
      errorMessage: error.message || '',
    })
  }
}
