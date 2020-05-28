const { loadImage } = require('canvas')
const path = require('path')

module.exports = class CachedArtist {
  constructor (data) {
    const { name, image, imageID, spotify } = data
    this.name = name
    this.image = image
    this.imageID = imageID
    this.spotify = spotify
  }

  async getImage (cfm, size) {
    try {
      return cfm.getImageFromCache(this.imageID, this.image)
    } catch (e) {
      return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'artistDefault.png'))
    }
  }
}
