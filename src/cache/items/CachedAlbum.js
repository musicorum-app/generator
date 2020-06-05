const { loadImage } = require('canvas')
const path = require('path')

module.exports = class CachedAlbum {
  constructor (data) {
    const { name, artist, image, imageID } = data
    this.name = name
    this.artist = artist
    this.image = image
    this.imageID = imageID
  }

  getImage (cfm, size) {
    try {
      if (!size) return cfm.getImageFromCache(this.imageID, this.image)
      const url = this.image.replace('300x300', `${size}x${size}`)
      return cfm.getImageFromCache(this.imageID + '_H', url)
    } catch (e) {
      return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'albumDefault.png'))
    }
  }

  getBufferImage (cfm) {
    try {
      return cfm.getBufferImageFromCache(this.imageID + '_H', this.image)
    } catch (e) {
      return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'albumDefault.png'))
    }
  }
}
