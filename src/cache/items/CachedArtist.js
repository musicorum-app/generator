const CacheManager = require('../CacheManager.js')

module.exports = class CachedArtist {
  constructor (name, imageURL, deezer, spotify) {
    this.name = name
    this.imageURL = imageURL
    this.deezer = deezer
    this.spotify = spotify
  }

  getImage () {
    return CacheManager.getImageFromCache(`a_${this.spotify}`, this.imageURL)
  }
}
