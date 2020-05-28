const { loadImage } = require('canvas')
const path = require('path')

module.exports = class CachedTrack {
  constructor (data) {
    const { name, artist, image, spotify, imageID } = data
    this.name = name
    this.artist = artist
    this.image = image
    this.spotify = spotify
    this.imageID = imageID
  }

  getImage (cfm) {
    try {
      return cfm.getImageFromCache(this.imageID, this.image)
    } catch (e) {
      return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'albumDefault.png'))
    }
  }
}
