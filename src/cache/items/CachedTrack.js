const CacheFileManager = require('../CacheFileManager.js')
const { loadImage } = require('canvas')
const path = require('path')

module.exports = class CachedTrack {
  constructor (data) {
    const { name, artist, album, image, deezer, spotify, imageID, audioAnalysis } = data
    this.name = name
    this.artist = artist
    this.album = album
    this.image = image
    this.deezer = deezer
    this.spotify = spotify
    this.imageID = imageID
    this.audioAnalysis = audioAnalysis
  }

  getImage () {
    try {
      return CacheFileManager.getImageFromCache(this.imageID, this.image)
    } catch (e) {
      return loadImage(path.resolve(__dirname, '..', '..', '..', 'cache', 'albumDefault.png'))
    }
  }
}
