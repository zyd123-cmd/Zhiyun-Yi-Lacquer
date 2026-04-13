const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保文章列表查询始终运行在当前云环境下。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例和命令对象，后续文章列表查询与游标筛选都依赖这里。
const db = cloud.database()
const _ = db.command
const ARTICLE_COLLECTION_NAME_LIST = ['articles', 'model', 'content']

// 中文注释：统一规范化文章列表查询参数，兼容旧版 offset 分页和新版 cursor 分页。
function normalizeQueryOptions(event = {}) {
  console.log('获取文章列表云函数：开始规范化查询参数', event)
  const normalizedOptions = {
    offset: Math.max(0, Number(event.offset) || Number(event.listlength) || 0),
    pageSize: Math.min(Math.max(Number(event.pageSize) || 7, 1), 50),
    type: typeof event.type === 'string' ? event.type.trim() : '',
    cursor: typeof event.cursor === 'string' ? event.cursor.trim() : '',
  }
  console.log('获取文章列表云函数：查询参数规范化完成', normalizedOptions)
  return normalizedOptions
}

// 中文注释：统一构造文章列表查询条件，优先使用游标翻页以减少 skip 带来的性能损耗。
function buildQueryCondition(type, cursor) {
  console.log('获取文章列表云函数：开始构造文章列表查询条件', {
    type,
    cursor,
  })
  const queryCondition = {}

  if (type) {
    queryCondition.type = type
  }

  if (cursor) {
    queryCondition._id = _.gt(cursor)
  }

  console.log('获取文章列表云函数：文章列表查询条件构造完成', queryCondition)
  return queryCondition
}

// 中文注释：统一格式化分页结果，向前端返回更轻量的列表和下一页游标信息。
function buildPageResult(rawArticleList, pageSize) {
  console.log('获取文章列表云函数：开始格式化分页结果', {
    rawLength: Array.isArray(rawArticleList) ? rawArticleList.length : 0,
    pageSize,
  })
  const safeArticleList = Array.isArray(rawArticleList) ? rawArticleList : []
  const hasMore = safeArticleList.length > pageSize
  const visibleArticleList = hasMore ? safeArticleList.slice(0, pageSize) : safeArticleList
  const nextCursor =
    hasMore && visibleArticleList.length
      ? visibleArticleList[visibleArticleList.length - 1]._id
      : ''

  const responseData = {
    list: visibleArticleList,
    nextCursor,
    hasMore,
  }
  console.log('获取文章列表云函数：分页结果格式化完成', {
    listLength: responseData.list.length,
    nextCursor: responseData.nextCursor,
    hasMore: responseData.hasMore,
  })
  return responseData
}

// 中文注释：统一查询候选文章集合，保证历史集合结构下也能正常返回列表数据。
async function queryArticleCollection(collectionName, queryOptions) {
  console.log('获取文章列表云函数：开始查询候选文章集合', {
    collectionName,
    queryOptions,
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

  const queryCondition = buildQueryCondition(queryOptions.type, queryOptions.cursor)

  if (Object.keys(queryCondition).length > 0) {
    console.log('获取文章列表云函数：当前查询命中筛选条件，准备挂载 where', queryCondition)
    query = query.where(queryCondition)
  }

  if (!queryOptions.cursor && queryOptions.offset > 0) {
    console.log('获取文章列表云函数：当前请求仍在使用旧版 offset 翻页参数', queryOptions.offset)
    query = query.skip(queryOptions.offset)
  }

  const response = await query.limit(queryOptions.pageSize + 1).get()
  console.log('获取文章列表云函数：候选文章集合查询完成', {
    collectionName,
    resultLength: Array.isArray(response.data) ? response.data.length : 0,
  })
  return response
}

// 中文注释：云函数主入口，负责依次读取多个候选文章集合并返回分页结果。
exports.main = async (event) => {
  console.log('获取文章列表云函数：收到文章列表查询请求', event)
  const queryOptions = normalizeQueryOptions(event)
  let lastError = null

  for (let index = 0; index < ARTICLE_COLLECTION_NAME_LIST.length; index += 1) {
    const collectionName = ARTICLE_COLLECTION_NAME_LIST[index]

    try {
      const response = await queryArticleCollection(collectionName, queryOptions)
      const responseData = buildPageResult(response.data, queryOptions.pageSize)

      if (!responseData.list.length && index < ARTICLE_COLLECTION_NAME_LIST.length - 1) {
        console.log('获取文章列表云函数：当前候选集合未查询到数据，准备继续尝试下一个集合', {
          collectionName,
          type: queryOptions.type,
        })
        continue
      }

      console.log('获取文章列表云函数：成功返回文章列表结果', {
        collectionName,
        listLength: responseData.list.length,
        hasMore: responseData.hasMore,
      })
      return responseData
    } catch (error) {
      lastError = error
      console.warn('获取文章列表云函数：当前候选集合查询失败，准备继续尝试下一个集合', {
        collectionName,
        errorMessage: error.message || '',
      })

      if (index === ARTICLE_COLLECTION_NAME_LIST.length - 1) {
        console.error('获取文章列表云函数：所有候选集合均查询失败，准备抛出异常', error)
        throw error
      }
    }
  }

  console.error('获取文章列表云函数：没有可用的文章集合，准备抛出兜底异常', lastError)
  throw lastError || new Error('No available article collection found')
}
