const CacheFileManager = require('../CacheFileManager.js')
const { loadImage } = require('canvas')
const path = require('path')

module.exports = class CachedArtist {
  constructor (data) {
    const { name, image, deezer, spotify, imageID } = data
    this.name = name
    this.image = image
    this.deezer = deezer
    this.spotify = spotify
    this.imageID = imageID
  }

  getImage () {
    try {
      return CacheFileManager.getImageFromCache(this.imageID, this.image)
    } catch (e) {
      return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'artistDefault.png'))
    }
  }
}
