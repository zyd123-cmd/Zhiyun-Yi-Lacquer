const cloud = require('wx-server-sdk')

// 中文注释：初始化云开发环境，确保文章详情查询始终运行在当前云环境下。
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

// 中文注释：获取数据库实例，后续文章详情读取通过候选集合顺序兜底完成。
const db = cloud.database()
const ARTICLE_COLLECTION_NAME_LIST = ['articles', 'model', 'content']

// 中文注释：统一规范化文章详情查询参数，避免空 id 或脏数据直接进入数据库查询阶段。
function normalizeArticleId(event = {}) {
  const articleId = typeof event.id === 'string' ? event.id.trim() : ''
  console.log('获取文章详情云函数：文章 id 规范化完成', articleId)
  return articleId
}

// 中文注释：统一查询候选文章集合，只返回详情页真正需要的字段，减少传输体积。
async function queryArticleDetail(collectionName, articleId) {
  console.log('获取文章详情云函数：开始查询候选文章集合详情', {
    collectionName,
    articleId,
  })
  const response = await db
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
    .get()

  console.log('获取文章详情云函数：候选文章集合详情查询完成', {
    collectionName,
    articleId: response && response.data ? response.data._id : '',
  })
  return response
}

// 中文注释：云函数主入口，负责按候选文章集合顺序查找指定文章详情。
exports.main = async (event) => {
  console.log('获取文章详情云函数：收到文章详情查询请求', event)
  const articleId = normalizeArticleId(event)
  let lastError = null

  if (!articleId) {
    console.error('获取文章详情云函数：当前缺少文章 id，准备抛出参数异常')
    throw new Error('Missing article id')
  }

  for (let index = 0; index < ARTICLE_COLLECTION_NAME_LIST.length; index += 1) {
    const collectionName = ARTICLE_COLLECTION_NAME_LIST[index]

    try {
      const response = await queryArticleDetail(collectionName, articleId)
      console.log('获取文章详情云函数：成功返回文章详情结果', {
        collectionName,
        articleId,
      })
      return response
    } catch (error) {
      lastError = error
      console.warn('获取文章详情云函数：当前候选集合查询失败，准备继续尝试下一个集合', {
        collectionName,
        articleId,
        errorMessage: error.message || '',
      })

      if (index === ARTICLE_COLLECTION_NAME_LIST.length - 1) {
        console.error('获取文章详情云函数：所有候选集合均查询失败，准备抛出异常', error)
        throw error
      }
    }
  }

  console.error('获取文章详情云函数：没有可用的文章集合，准备抛出兜底异常', lastError)
  throw lastError || new Error('No available article collection found')
}
