const MiscUtils = require('./MiscUtils.js')

module.exports = async (mapFn, items, pieces, delay = 500) => {
  const mapper = async (...arg) => (new Promise(resolve => {
    resolve(mapFn(...arg))
  }))
  const promises = []

  items.forEach(a => {
    promises.push(async () => (
      mapper(a)
    ))
  })
  const ids = []

  const chunks = MiscUtils.chunkArray(promises, pieces)

  for (let i = 0; i < chunks.length; i++) {
    const res = await Promise.all(chunks[i].map(f => f()))
    await MiscUtils.wait(delay)
    ids.push(...res)
  }

  return ids
}
