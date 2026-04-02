const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()
const collectionNames = ['articles', 'model', 'content']

exports.main = async (event) => {
  const rawOffset = typeof event.offset === 'undefined' ? event.listlength : event.offset
  const offset = Number(rawOffset) || 0
  const pageSize = Number(event.pageSize) || 7
  const type = event.type || ''
  let lastError = null

  for (let index = 0; index < collectionNames.length; index += 1) {
    const collectionName = collectionNames[index]

    try {
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
        .skip(offset)
        .limit(pageSize)

      if (type) {
        query = query.where({ type })
      }

      return await query.get()
    } catch (error) {
      lastError = error

      if (index === collectionNames.length - 1) {
        throw error
      }
    }
  }

  throw lastError || new Error('No available article collection found')
}
