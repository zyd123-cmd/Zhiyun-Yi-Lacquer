const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()
const _ = db.command
const collectionNames = ['articles', 'model', 'content']

exports.main = async (event) => {
  const id = event.id
  const delta = Number(event.delta)
  let likeDelta = delta

  if (!Number.isInteger(likeDelta)) {
    if (event.handupcolor === '#dd524d') {
      likeDelta = 1
    } else if (event.handupcolor === '#666666') {
      likeDelta = -1
    } else {
      throw new Error('Invalid like delta')
    }
  }

  let lastError = null

  for (let index = 0; index < collectionNames.length; index += 1) {
    const collectionName = collectionNames[index]

    try {
      return await db.collection(collectionName).doc(id).update({
        data: {
          handup: _.inc(likeDelta),
        },
      })
    } catch (error) {
      lastError = error

      if (index === collectionNames.length - 1) {
        throw error
      }
    }
  }

  throw lastError || new Error('No available article collection found')
}
