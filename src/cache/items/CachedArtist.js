const CacheFileManager = require('../CacheFileManager.js')
const { loadImage } = require('canvas')
const path = require('path')

module.exports = class CachedArtist {
  constructor (data) {
    const { name, image, imageID } = data
    this.name = name
    this.image = image
    this.imageID = imageID
  }

  async getImage (size) {
    try {
      if (!size) return CacheFileManager.getImageFromCache(this.imageID, this.image)
      const url = this.image.replace('/250x250-', `/${size}x${size}-`)
      return CacheFileManager.getImageFromCache(this.imageID + '_H', url)
    } catch (e) {
      return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'artistDefault.png'))
    }
  }
}
