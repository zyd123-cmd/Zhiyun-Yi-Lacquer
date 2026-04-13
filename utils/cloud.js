export const COLLECTIONS = Object.freeze({
  SWIPER: 'swiper',
  USERS: 'user',
  ARTICLES: 'articles',
  ARTIFACT_MODELS: 'artifact_models',
  ARTICLE_COMMENTS: 'article_comments',
  ARTICLE_COMMENT_LIKES: 'article_comment_likes',
  YIQUAN_POSTS: 'yiquan_posts',
  YIQUAN_POST_COMMENTS: 'yiquan_post_comments',
})

export const COLLECTION_FALLBACKS = Object.freeze({
  ARTICLES: ['model', 'content'],
  ARTIFACT_MODELS: ['3dview'],
})

export const CLOUD_FUNCTIONS = Object.freeze({
  WECHAT_LOGIN: 'wechatLogin',
  GET_ARTICLE_LIST: 'getArticleList',
  GET_ARTICLE_DETAIL: 'getArticleDetail',
  UPDATE_ARTICLE_LIKES: 'updateArticleLikes',
  GET_ARTICLE_COMMENTS: 'getArticleComments',
  CREATE_ARTICLE_COMMENT: 'createArticleComment',
  TOGGLE_ARTICLE_COMMENT_LIKE: 'toggleArticleCommentLike',
  DELETE_ARTICLE_COMMENT: 'deleteArticleComment',
  GET_ARTIFACT_MODELS: 'getArtifactModels',
  GET_USER_PROFILE: 'getUserProfile',
  CREATE_USER_PROFILE: 'createUserProfile',
  UPDATE_USER_AVATAR: 'updateUserAvatar',
  UPDATE_USER_NICKNAME: 'updateUserNickname',
  GET_YIQUAN_POSTS: 'getYiquanPosts',
  CREATE_YIQUAN_POST: 'createYiquanPost',
  DELETE_YIQUAN_POST: 'deleteYiquanPost',
  GET_YIQUAN_COMMENTS: 'getYiquanComments',
  CREATE_YIQUAN_COMMENT: 'createYiquanComment',
  DELETE_YIQUAN_COMMENT: 'deleteYiquanComment',
})

export const CLOUD_FUNCTION_FALLBACKS = Object.freeze({
  GET_ARTICLE_LIST: ['getmaincontent'],
  GET_ARTICLE_DETAIL: ['GetDate', 'getimage'],
  UPDATE_ARTICLE_LIKES: ['addHandup'],
  GET_ARTIFACT_MODELS: ['get3d'],
})

const missingCloudFunctionNameSet = new Set()
const cloudFileTempUrlCache = Object.create(null)

function normalizeCandidates(candidates) {
  const candidateList = Array.isArray(candidates) ? candidates : [candidates]
  return Array.from(
    new Set(candidateList.filter((item) => typeof item === 'string' && item.trim().length > 0))
  )
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function extractResultData(result) {
  if (result && typeof result === 'object' && 'result' in result) {
    if (result.result && typeof result.result === 'object' && 'data' in result.result) {
      return result.result.data
    }

    return result.result
  }

  if (result && typeof result === 'object' && 'data' in result) {
    return result.data
  }

  return result
}

export function hasUsableData(data) {
  if (Array.isArray(data)) {
    return data.length > 0
  }

  if (isPlainObject(data)) {
    return Object.keys(data).length > 0
  }

  return data !== null && typeof data !== 'undefined' && data !== ''
}

export function getErrorMessage(error) {
  if (!error) {
    return ''
  }

  if (typeof error === 'string') {
    return error
  }

  return error.message || error.errMsg || ''
}

export function isFunctionNotFoundError(error) {
  const message = getErrorMessage(error)
  return (
    message.indexOf('FUNCTION_NOT_FOUND') !== -1 ||
    message.indexOf('FunctionName parameter could not be found') !== -1
  )
}

function isCloudFileId(value) {
  return typeof value === 'string' && value.indexOf('cloud://') === 0
}

function isLegacyTcbHttpUrl(value) {
  return (
    typeof value === 'string' &&
    /^https?:\/\/[^/]+\.tcb\.qcloud\.la\//i.test(value)
  )
}

function convertLegacyTcbHttpUrlToFileId(value) {
  if (!isLegacyTcbHttpUrl(value)) {
    return ''
  }

  const matchedResult = value.match(/^https?:\/\/([^/]+)\.tcb\.qcloud\.la\/(.+)$/i)

  if (!matchedResult) {
    return ''
  }

  const hostPrefix = matchedResult[1]
  const filePath = matchedResult[2]
  const envMatchedResult = hostPrefix.match(/^[^-]+-(cloud\d-[a-z0-9]+)-\d+$/i)

  if (!envMatchedResult || !envMatchedResult[1] || !filePath) {
    return ''
  }

  const envId = envMatchedResult[1]
  return `cloud://${envId}.${hostPrefix}/${filePath}`
}

function getCloudFileIdFromSource(source) {
  if (isCloudFileId(source)) {
    return source
  }

  return convertLegacyTcbHttpUrlToFileId(source)
}

// 中文注释：统一把云存储 fileID 或旧版 tcb 公网链接转换成当前可用的临时地址，避免老公网域名失效后图片全部无法显示。
export async function resolveCloudFileSource(source) {
  console.log('云工具模块：开始解析单个云文件地址', source)

  if (!source || typeof source !== 'string') {
    console.log('云工具模块：当前云文件地址为空或不是字符串，直接返回原值')
    return source || ''
  }

  if (cloudFileTempUrlCache[source]) {
    console.log('云工具模块：命中云文件地址内存缓存，直接返回缓存结果', source)
    return cloudFileTempUrlCache[source]
  }

  const fileId = getCloudFileIdFromSource(source)

  if (!fileId) {
    console.log('云工具模块：当前地址不是云文件地址，直接返回原始地址', source)
    cloudFileTempUrlCache[source] = source
    return source
  }

  try {
    console.log('云工具模块：开始调用云开发接口换取云文件临时地址', fileId)
    const response = await wx.cloud.getTempFileURL({
      fileList: [fileId],
    })
    const fileItem =
      response &&
      response.fileList &&
      Array.isArray(response.fileList) &&
      response.fileList.length
        ? response.fileList[0]
        : null
    const resolvedSource =
      fileItem && fileItem.tempFileURL
        ? fileItem.tempFileURL
        : source

    cloudFileTempUrlCache[source] = resolvedSource
    cloudFileTempUrlCache[fileId] = resolvedSource
    console.log('云工具模块：云文件临时地址解析完成', {
      source,
      fileId,
      resolvedSource,
    })
    return resolvedSource
  } catch (error) {
    console.error('云工具模块：云文件临时地址解析失败，准备回退原始地址', error)
    cloudFileTempUrlCache[source] = source
    return source
  }
}

// 中文注释：统一批量解析图片地址，减少页面层重复编写 Promise.all 逻辑。
export async function resolveCloudFileSourceList(sourceList = []) {
  console.log('云工具模块：开始批量解析云文件地址列表', sourceList)
  const normalizedSourceList = Array.isArray(sourceList) ? sourceList : []
  const resolvedSourceList = await Promise.all(
    normalizedSourceList.map((source) => resolveCloudFileSource(source))
  )
  console.log('云工具模块：云文件地址列表批量解析完成', resolvedSourceList)
  return resolvedSourceList
}

export async function runCollectionWithFallback(collectionNames, executor, options = {}) {
  const names = normalizeCandidates(collectionNames)
  const fallbackWhenEmpty = Boolean(options.fallbackWhenEmpty)
  const getData = typeof options.getData === 'function' ? options.getData : extractResultData
  let lastError = null

  for (let index = 0; index < names.length; index += 1) {
    const collectionName = names[index]

    try {
      const result = await executor(collectionName)
      const data = getData(result)
      const isLastCandidate = index === names.length - 1

      if (!fallbackWhenEmpty || hasUsableData(data) || isLastCandidate) {
        return result
      }

      lastError = new Error(`Collection ${collectionName} returned empty data`)
    } catch (error) {
      lastError = error

      if (index === names.length - 1) {
        throw error
      }
    }
  }

  throw lastError || new Error('No collection candidates available')
}

export async function callCloudFunctionWithFallback(functionNames, data = {}, options = {}) {
  const names = normalizeCandidates(functionNames)
  const fallbackWhenEmpty = Boolean(options.fallbackWhenEmpty)
  const getData = typeof options.getData === 'function' ? options.getData : extractResultData
  let lastError = null

  for (let index = 0; index < names.length; index += 1) {
    const functionName = names[index]
    const isLastCandidate = index === names.length - 1

    if (missingCloudFunctionNameSet.has(functionName) && !isLastCandidate) {
      console.log('云工具模块：当前云函数已被标记为不存在，跳过本次调用', functionName)
      continue
    }

    try {
      console.log('云工具模块：开始调用候选云函数', {
        functionName,
        data,
      })
      const result = await wx.cloud.callFunction({
        name: functionName,
        data,
      })
      const resultData = getData(result)

      if (!fallbackWhenEmpty || hasUsableData(resultData) || isLastCandidate) {
        console.log('云工具模块：候选云函数调用成功并返回可用数据', functionName)
        return result
      }

      lastError = new Error(`Cloud function ${functionName} returned empty data`)
    } catch (error) {
      lastError = error

      if (isFunctionNotFoundError(error)) {
        console.warn('云工具模块：检测到候选云函数不存在，已写入会话级跳过缓存', functionName)
        missingCloudFunctionNameSet.add(functionName)
      }

      if (!isFunctionNotFoundError(error) || isLastCandidate) {
        throw error
      }
    }
  }

  throw lastError || new Error('No cloud function candidates available')
}
