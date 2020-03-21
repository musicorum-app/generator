const { loadImage } = require('canvas')
const path = require('path')

module.exports = class CachedArtist {
  constructor (data) {
    const { name, image } = data
    this.name = name
    this.image = image
  }

  async getImage (size) {
    console.log(22, this.image.replace('/250x250-', `/${size}x${size}-`))
    if (this.image) return loadImage(this.image.replace('/250x250-', `/${size}x${size}-`))
    return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'artistDefault.png'))
  }
}
