const { loadImage } = require('canvas')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')
const path = require('path')

module.exports = class Theme {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.loadDefaults()
  }

  async loadDefaults () {
    this.defaultArtistImage = await loadImage(path.resolve(__dirname, '..', '..', 'cache', 'artistDefault.png'))
    this.defaultAlbumImage = await loadImage(path.resolve(__dirname, '..', '..', 'cache', 'albumDefault.png'))
  }

  async preGenerate (options) {
    try {
      if (!options.user) throw new ResponseError(400, responses.MISSING_USER)
      return this.generate(options)
    } catch (e) {
      if (e instanceof ResponseError) throw e
      console.error(e)
      throw new ResponseError(500, responses.GENERIC_ERROR)
    }
  }

  async getArtistImage (artistName, size) {
    const image = await this.musicorum.dataManager.getArtistImage(artistName, size)
    if (image) {
      return image
    } else {
      return this.defaultArtistImage
    }
  }

  async getAlbumImage (albumItem, size) {
    const image = await this.musicorum.dataManager.getAlbumImage(albumItem, size)
    if (image) {
      return image
    } else {
      return this.defaultArtistImage
    }
  }

  async getMultipleArtists (artists) {
    return this.musicorum.dataManager.getMultipleArtists(artists)
  }

  async generate (options) {
    throw new Error('Missing theme generate function')
  }
}
