const { loadImage } = require('canvas')
const path = require('path')

module.exports = class CachedAlbum {
  constructor (data) {
    const { name, artist, image } = data
    this.name = name
    this.artist = artist
    this.image = image
  }

  getImage (size) {
    if (this.image) return loadImage(this.image.replace('300x300', `${size}x${size}`))
    return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'albumDefault.png'))
  }
}
