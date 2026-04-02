export const COLLECTIONS = Object.freeze({
  SWIPER: 'swiper',
  USERS: 'user',
  ARTICLES: 'articles',
  ARTIFACT_MODELS: 'artifact_models',
})

export const COLLECTION_FALLBACKS = Object.freeze({
  ARTICLES: ['model', 'content'],
  ARTIFACT_MODELS: ['3dview'],
})

export const CLOUD_FUNCTIONS = Object.freeze({
  GET_ARTICLE_LIST: 'getArticleList',
  GET_ARTICLE_DETAIL: 'getArticleDetail',
  UPDATE_ARTICLE_LIKES: 'updateArticleLikes',
  GET_ARTIFACT_MODELS: 'getArtifactModels',
  GET_USER_PROFILE: 'getUserProfile',
  CREATE_USER_PROFILE: 'createUserProfile',
  UPDATE_USER_AVATAR: 'updateUserAvatar',
  UPDATE_USER_NICKNAME: 'updateUserNickname',
})

export const CLOUD_FUNCTION_FALLBACKS = Object.freeze({
  GET_ARTICLE_LIST: ['getmaincontent'],
  GET_ARTICLE_DETAIL: ['GetDate', 'getimage'],
  UPDATE_ARTICLE_LIKES: ['addHandup'],
  GET_ARTIFACT_MODELS: ['get3d'],
})

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

    try {
      const result = await wx.cloud.callFunction({
        name: functionName,
        data,
      })
      const resultData = getData(result)
      const isLastCandidate = index === names.length - 1

      if (!fallbackWhenEmpty || hasUsableData(resultData) || isLastCandidate) {
        return result
      }

      lastError = new Error(`Cloud function ${functionName} returned empty data`)
    } catch (error) {
      lastError = error

      if (!isFunctionNotFoundError(error) || index === names.length - 1) {
        throw error
      }
    }
  }

  throw lastError || new Error('No cloud function candidates available')
}
