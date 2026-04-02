const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()
const collectionNames = ['artifact_models', '3dview']

exports.main = async () => {
  let lastError = null

  for (let index = 0; index < collectionNames.length; index += 1) {
    const collectionName = collectionNames[index]

    try {
      return await db.collection(collectionName).orderBy('order', 'asc').get()
    } catch (error) {
      lastError = error

      if (index === collectionNames.length - 1) {
        throw error
      }
    }
  }

  throw lastError || new Error('No available model collection found')
}
