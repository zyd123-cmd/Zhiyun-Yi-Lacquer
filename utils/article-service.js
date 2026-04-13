import {
  COLLECTIONS,
  COLLECTION_FALLBACKS,
  CLOUD_FUNCTIONS,
  CLOUD_FUNCTION_FALLBACKS,
  callCloudFunctionWithFallback,
  extractResultData,
  runCollectionWithFallback,
} from '@/utils/cloud'

const ARTICLE_LIST_CACHE_TTL = 2 * 60 * 1000
const ARTICLE_DETAIL_CACHE_TTL = 5 * 60 * 1000
const ARTICLE_SWIPER_CACHE_TTL = 10 * 60 * 1000
const ARTICLE_SEARCH_CACHE_TTL = 2 * 60 * 1000

const articleMemoryCacheMap = Object.create(null)
const articlePendingRequestMap = Object.create(null)

// 中文注释：统一构造缓存键，避免不同页面对同一份文章数据重复发起请求。
function buildCacheKey(scope, params = {}) {
  return `${scope}:${JSON.stringify(params)}`
}

// 中文注释：统一做深拷贝，避免页面侧修改缓存对象后把缓存污染掉。
function cloneCacheValue(value) {
  if (typeof value === 'undefined') {
    return value
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    console.warn('文章服务模块：缓存数据深拷贝失败，当前回退为原始数据', error)
    return value
  }
}

// 中文注释：统一读取内存缓存，并在过期时及时清理，避免旧数据长期占用内存。
function readMemoryCache(cacheKey) {
  const cacheItem = articleMemoryCacheMap[cacheKey]

  if (!cacheItem) {
    return null
  }

  if (cacheItem.expiresAt <= Date.now()) {
    console.log('文章服务模块：检测到缓存已过期，准备清理对应缓存项', cacheKey)
    delete articleMemoryCacheMap[cacheKey]
    return null
  }

  console.log('文章服务模块：命中内存缓存，当前直接返回缓存数据', cacheKey)
  return cloneCacheValue(cacheItem.data)
}

// 中文注释：统一写入内存缓存，提升同一次会话内的页面切换速度。
function writeMemoryCache(cacheKey, data, ttl) {
  console.log('文章服务模块：开始写入内存缓存', {
    cacheKey,
    ttl,
  })
  articleMemoryCacheMap[cacheKey] = {
    expiresAt: Date.now() + ttl,
    data: cloneCacheValue(data),
  }
  console.log('文章服务模块：内存缓存写入完成', cacheKey)
  return cloneCacheValue(data)
}

// 中文注释：统一做请求去重，避免同一时刻多个页面或多个组件重复请求同一份数据。
async function useCachedRequest(cacheKey, ttl, requestExecutor, forceRefresh = false) {
  console.log('文章服务模块：开始执行带缓存的数据请求', {
    cacheKey,
    ttl,
    forceRefresh,
  })

  if (!forceRefresh) {
    const cachedValue = readMemoryCache(cacheKey)

    if (cachedValue !== null) {
      console.log('文章服务模块：当前请求直接返回缓存结果', cacheKey)
      return cachedValue
    }
  }

  if (articlePendingRequestMap[cacheKey]) {
    console.log('文章服务模块：检测到同键请求正在执行，当前复用进行中的 Promise', cacheKey)
    return articlePendingRequestMap[cacheKey]
  }

  articlePendingRequestMap[cacheKey] = (async () => {
    try {
      console.log('文章服务模块：开始执行新的远端请求', cacheKey)
      const responseData = await requestExecutor()
      console.log('文章服务模块：远端请求执行完成，准备写入缓存', cacheKey)
      return writeMemoryCache(cacheKey, responseData, ttl)
    } finally {
      console.log('文章服务模块：当前请求执行流程结束，准备释放请求占位', cacheKey)
      delete articlePendingRequestMap[cacheKey]
    }
  })()

  return articlePendingRequestMap[cacheKey]
}

// 中文注释：统一把文章摘要字段整理成前端稳定可用的结构，减少页面层反复兜底。
function normalizeArticleSummary(article = {}) {
  const rawImageList = Array.isArray(article.imagesrc)
    ? article.imagesrc
    : article.imagesrc
      ? [article.imagesrc]
      : []

  return {
    _id: article._id || '',
    title: article.title || '',
    author: article.author || '',
    imagesrc: rawImageList.filter((item) => typeof item === 'string' && item.trim().length > 0),
    pagesrc: article.pagesrc || '',
    type: article.type || '',
    handup: Number(article.handup || 0),
  }
}

// 中文注释：统一整理文章详情数据，避免详情页每次都做字段兼容判断。
function normalizeArticleDetail(article = {}) {
  const normalizedSummary = normalizeArticleSummary(article)
  const normalizedContent = Array.isArray(article.content)
    ? article.content.filter((item) => typeof item === 'string')
    : typeof article.content === 'string' && article.content.trim()
      ? [article.content]
      : []

  return {
    ...normalizedSummary,
    content: normalizedContent,
  }
}

// 中文注释：统一把文章列表标准化，减少页面层的数组判空和字段兼容逻辑。
function normalizeArticleSummaryList(articleList = []) {
  const normalizedList = Array.isArray(articleList)
    ? articleList.map((article) => normalizeArticleSummary(article))
    : []

  return normalizedList.filter((article) => Boolean(article._id))
}

// 中文注释：统一处理云函数和数据库返回的分页结果，让页面层只关心 list、nextCursor 和 hasMore。
function normalizeArticleListPage(rawData, pageSize) {
  console.log('文章服务模块：开始标准化文章分页结果', {
    pageSize,
    rawDataType: Array.isArray(rawData) ? 'array' : typeof rawData,
  })

  if (Array.isArray(rawData)) {
    const normalizedList = normalizeArticleSummaryList(rawData)
    const hasMore = normalizedList.length === pageSize
    const nextCursor =
      hasMore && normalizedList.length
        ? normalizedList[normalizedList.length - 1]._id
        : ''

    console.log('文章服务模块：文章分页结果标准化完成', {
      listLength: normalizedList.length,
      hasMore,
      nextCursor,
    })
    return {
      list: normalizedList,
      nextCursor,
      hasMore,
    }
  }

  const normalizedList = normalizeArticleSummaryList(rawData && rawData.list)
  const hasMore =
    typeof (rawData && rawData.hasMore) === 'boolean'
      ? rawData.hasMore
      : normalizedList.length === pageSize
  const nextCursor =
    hasMore
      ? (rawData && rawData.nextCursor) ||
        (normalizedList.length ? normalizedList[normalizedList.length - 1]._id : '')
      : ''

  console.log('文章服务模块：对象型文章分页结果标准化完成', {
    listLength: normalizedList.length,
    hasMore,
    nextCursor,
  })
  return {
    list: normalizedList,
    nextCursor,
    hasMore,
  }
}

// 中文注释：统一从数据库读取分页文章列表，并优先使用游标翻页代替 skip，降低越翻越慢的问题。
async function loadArticleListFromDatabase({ type = '', pageSize = 7, cursor = '', offset = 0 }) {
  console.log('文章服务模块：开始通过数据库直连加载文章列表', {
    type,
    pageSize,
    cursor,
    offset,
  })
  const db = wx.cloud.database()
  const command = db.command

  const response = await runCollectionWithFallback(
    [COLLECTIONS.ARTICLES, ...COLLECTION_FALLBACKS.ARTICLES],
    (collectionName) => {
      console.log('文章服务模块：开始查询候选文章集合', {
        collectionName,
        type,
        pageSize,
        cursor,
        offset,
      })
      let query = db
        .collection(collectionName)
        .field({
          _id: true,
          title: true,
          author: true,
          imagesrc: true,
          pagesrc: true,
          type: true,
          handup: true,
        })
        .orderBy('_id', 'asc')

      const queryCondition = {}

      if (type) {
        queryCondition.type = type
      }

      if (cursor) {
        queryCondition._id = command.gt(cursor)
      }

      if (Object.keys(queryCondition).length > 0) {
        console.log('文章服务模块：当前文章列表查询命中了筛选条件', queryCondition)
        query = query.where(queryCondition)
      }

      if (!cursor && offset > 0) {
        console.log('文章服务模块：当前数据库直连查询仍需兼容旧的 offset 分页参数', offset)
        query = query.skip(offset)
      }

      return query.limit(pageSize + 1).get()
    },
    {
      fallbackWhenEmpty: true,
    }
  )

  const rawList = response && Array.isArray(response.data) ? response.data : []
  const hasMore = rawList.length > pageSize
  const visibleList = hasMore ? rawList.slice(0, pageSize) : rawList
  const normalizedPage = {
    list: normalizeArticleSummaryList(visibleList),
    nextCursor: hasMore && visibleList.length ? visibleList[visibleList.length - 1]._id : '',
    hasMore,
  }
  console.log('文章服务模块：数据库直连文章列表加载完成', {
    listLength: normalizedPage.list.length,
    hasMore: normalizedPage.hasMore,
    nextCursor: normalizedPage.nextCursor,
  })
  return normalizedPage
}

// 中文注释：统一从数据库直连读取文章详情，作为云函数异常时的兜底方案。
async function loadArticleDetailFromDatabase(articleId) {
  console.log('文章服务模块：开始通过数据库直连加载文章详情', articleId)
  const db = wx.cloud.database()

  const response = await runCollectionWithFallback(
    [COLLECTIONS.ARTICLES, ...COLLECTION_FALLBACKS.ARTICLES],
    (collectionName) =>
      db
        .collection(collectionName)
        .field({
          _id: true,
          title: true,
          author: true,
          imagesrc: true,
          pagesrc: true,
          type: true,
          handup: true,
          content: true,
        })
        .doc(articleId)
        .get(),
    {
      fallbackWhenEmpty: true,
    }
  )

  const normalizedArticle = normalizeArticleDetail((response && response.data) || {})
  console.log('文章服务模块：数据库直连文章详情加载完成', normalizedArticle._id)
  return normalizedArticle
}

// 中文注释：统一转义搜索关键字，避免正则特殊字符放大查询成本或导致结果异常。
function escapeSearchKeyword(keyword) {
  return String(keyword || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 中文注释：统一提供轮播图数据读取能力，并对静态内容做短时缓存。
export async function fetchSwiperItems(options = {}) {
  const forceRefresh = Boolean(options.forceRefresh)
  const cacheKey = buildCacheKey('swiper-items', {})
  console.log('文章服务模块：开始获取首页轮播图数据', {
    forceRefresh,
  })

  return useCachedRequest(
    cacheKey,
    ARTICLE_SWIPER_CACHE_TTL,
    async () => {
      const db = wx.cloud.database()
      const response = await db
        .collection(COLLECTIONS.SWIPER)
        .field({
          _id: true,
          imagesrc: true,
          pagesrc: true,
        })
        .orderBy('_id', 'asc')
        .get()

      const swiperList = Array.isArray(response.data)
        ? response.data.map((item) => ({
            _id: item._id || '',
            imagesrc: item.imagesrc || '',
            pagesrc: item.pagesrc || '',
          }))
        : []
      console.log('文章服务模块：首页轮播图数据加载完成', swiperList.length)
      return swiperList
    },
    forceRefresh
  )
}

// 中文注释：统一获取文章列表，优先使用云函数与游标分页，并提供缓存与数据库兜底。
export async function fetchArticleList(options = {}) {
  const type = typeof options.type === 'string' ? options.type.trim() : ''
  const pageSize = Math.max(1, Number(options.pageSize) || 7)
  const cursor = typeof options.cursor === 'string' ? options.cursor.trim() : ''
  const offset = Math.max(0, Number(options.offset) || 0)
  const forceRefresh = Boolean(options.forceRefresh)
  const cacheKey = buildCacheKey('article-list', {
    type,
    pageSize,
    cursor,
    offset,
  })

  console.log('文章服务模块：开始获取文章列表数据', {
    type,
    pageSize,
    cursor,
    offset,
    forceRefresh,
  })

  return useCachedRequest(
    cacheKey,
    ARTICLE_LIST_CACHE_TTL,
    async () => {
      try {
        console.log('文章服务模块：准备通过云函数获取文章列表', {
          type,
          pageSize,
          cursor,
          offset,
        })
        const response = await callCloudFunctionWithFallback(
          [CLOUD_FUNCTIONS.GET_ARTICLE_LIST],
          {
            type,
            pageSize,
            cursor,
            offset,
          },
          {
            fallbackWhenEmpty: true,
          }
        )
        const normalizedPage = normalizeArticleListPage(extractResultData(response), pageSize)
        console.log('文章服务模块：云函数文章列表加载完成', {
          listLength: normalizedPage.list.length,
          hasMore: normalizedPage.hasMore,
          nextCursor: normalizedPage.nextCursor,
        })
        return normalizedPage
      } catch (cloudError) {
        console.warn('文章服务模块：云函数文章列表加载失败，当前回退数据库直连方案', cloudError)
        return loadArticleListFromDatabase({
          type,
          pageSize,
          cursor,
          offset,
        })
      }
    },
    forceRefresh
  )
}

// 中文注释：统一获取文章详情，并缓存最近访问的文章详情以提升二次打开速度。
export async function fetchArticleDetail(options = {}) {
  const articleId = typeof options.articleId === 'string' ? options.articleId.trim() : ''
  const forceRefresh = Boolean(options.forceRefresh)
  const cacheKey = buildCacheKey('article-detail', {
    articleId,
  })

  console.log('文章服务模块：开始获取文章详情数据', {
    articleId,
    forceRefresh,
  })

  if (!articleId) {
    console.log('文章服务模块：当前缺少文章 id，直接返回空文章详情对象')
    return {}
  }

  return useCachedRequest(
    cacheKey,
    ARTICLE_DETAIL_CACHE_TTL,
    async () => {
      try {
        console.log('文章服务模块：准备通过云函数获取文章详情', articleId)
        const response = await callCloudFunctionWithFallback(
          [CLOUD_FUNCTIONS.GET_ARTICLE_DETAIL, ...CLOUD_FUNCTION_FALLBACKS.GET_ARTICLE_DETAIL],
          {
            id: articleId,
          },
          {
            fallbackWhenEmpty: true,
          }
        )
        const normalizedArticle = normalizeArticleDetail(extractResultData(response) || {})
        console.log('文章服务模块：云函数文章详情加载完成', normalizedArticle._id)
        return normalizedArticle
      } catch (cloudError) {
        console.warn('文章服务模块：云函数文章详情加载失败，当前回退数据库直连方案', cloudError)
        return loadArticleDetailFromDatabase(articleId)
      }
    },
    forceRefresh
  )
}

// 中文注释：统一更新文章详情缓存，保证点赞等乐观更新后再次进入详情页仍能看到较新的状态。
export function updateArticleDetailCache(articleId, updater) {
  const normalizedArticleId = typeof articleId === 'string' ? articleId.trim() : ''
  const cacheKey = buildCacheKey('article-detail', {
    articleId: normalizedArticleId,
  })
  const currentCacheItem = articleMemoryCacheMap[cacheKey]

  console.log('文章服务模块：开始尝试更新文章详情缓存', {
    articleId: normalizedArticleId,
    cacheKey,
  })

  if (!normalizedArticleId || !currentCacheItem || currentCacheItem.expiresAt <= Date.now()) {
    console.log('文章服务模块：当前没有可更新的文章详情缓存，结束缓存更新流程', normalizedArticleId)
    return
  }

  const currentArticle = cloneCacheValue(currentCacheItem.data) || {}
  const nextArticle =
    typeof updater === 'function'
      ? updater(currentArticle)
      : {
          ...currentArticle,
          ...(updater || {}),
        }

  articleMemoryCacheMap[cacheKey] = {
    expiresAt: currentCacheItem.expiresAt,
    data: cloneCacheValue(nextArticle),
  }
  console.log('文章服务模块：文章详情缓存更新完成', normalizedArticleId)
}

// 中文注释：统一提供文章搜索能力，并给相同关键字搜索结果做短时缓存。
export async function searchArticleSummaries(options = {}) {
  const keyword = typeof options.keyword === 'string' ? options.keyword.trim() : ''
  const limit = Math.max(1, Number(options.limit) || 20)
  const forceRefresh = Boolean(options.forceRefresh)
  const escapedKeyword = escapeSearchKeyword(keyword)
  const cacheKey = buildCacheKey('article-search', {
    keyword: escapedKeyword,
    limit,
  })

  console.log('文章服务模块：开始搜索文章摘要数据', {
    keyword,
    limit,
    forceRefresh,
  })

  if (!keyword) {
    console.log('文章服务模块：当前搜索关键字为空，直接返回空结果')
    return []
  }

  return useCachedRequest(
    cacheKey,
    ARTICLE_SEARCH_CACHE_TTL,
    async () => {
      const db = wx.cloud.database()
      const response = await runCollectionWithFallback(
        [COLLECTIONS.ARTICLES, ...COLLECTION_FALLBACKS.ARTICLES],
        (collectionName) =>
          db
            .collection(collectionName)
            .where({
              title: db.RegExp({
                regexp: escapedKeyword,
                options: 'i',
              }),
            })
            .field({
              _id: true,
              title: true,
            })
            .limit(limit)
            .get(),
        {
          fallbackWhenEmpty: true,
        }
      )

      const searchResultList = Array.isArray(response.data)
        ? response.data
            .map((item) => ({
              _id: item._id || '',
              title: item.title || '',
            }))
            .filter((item) => Boolean(item._id))
        : []
      console.log('文章服务模块：文章搜索结果加载完成', searchResultList.length)
      return searchResultList
    },
    forceRefresh
  )
}

// 中文注释：统一合并分页文章列表，避免翻页后因为重复请求或缓存命中产生重复文章。
export function mergeArticleList(currentList = [], nextList = []) {
  console.log('文章服务模块：开始合并文章列表数据', {
    currentLength: Array.isArray(currentList) ? currentList.length : 0,
    nextLength: Array.isArray(nextList) ? nextList.length : 0,
  })
  const mergedList = []
  const articleIdSet = new Set()
  const sourceList = [
    ...(Array.isArray(currentList) ? currentList : []),
    ...(Array.isArray(nextList) ? nextList : []),
  ]

  sourceList.forEach((article) => {
    if (!article || !article._id || articleIdSet.has(article._id)) {
      return
    }

    articleIdSet.add(article._id)
    mergedList.push(article)
  })

  console.log('文章服务模块：文章列表数据合并完成', mergedList.length)
  return mergedList
}

// 中文注释：统一获取文章封面，保证所有列表页都使用同一套兜底逻辑。
export function getArticleCoverImage(article, fallbackImage = '') {
  if (Array.isArray(article && article.imagesrc) && article.imagesrc.length > 0) {
    return article.imagesrc[0]
  }

  if (article && typeof article.imagesrc === 'string' && article.imagesrc) {
    return article.imagesrc
  }

  return fallbackImage
}

// 中文注释：统一生成文章详情页跳转地址，减少各页面重复拼接路由。
export function getArticleDetailUrl(article) {
  const articleId = article && (article._id || article.id) ? article._id || article.id : ''
  return articleId ? `/subcontentpkg/hottopic/article0/article0?id=${articleId}` : '/pages/index/index'
}
