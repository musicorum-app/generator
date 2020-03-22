const { loadImage } = require('canvas')
const CacheFileManager = require('../cache/CacheFileManager.js')
const LastFM = require('../utils/LastFM.js')
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

  /**
   * Get a image from an artist
   * @param {(string|Object)} artistObject The name of the artist OR the artist Object
   * @param {string} artistObject.name The artist name from the object
   * @returns {Promise<Image>} The artist image in canvas item
   */
  async getArtistImage (artistObject, that = this) {
    const artist = await that.musicorum.dataManager.getArtist(artistObject)
    return artist ? artist.getImage() : that.defaultArtistImage
  }

  /**
   * Get a image from an album
   * @param {Object} albumObject The object from the album
   * @param {string} albumObject.name The album name
   * @param {string} albumObject.artist.name The artist name
   * @returns {Promise<Image>} The album image in canvas item
   */
  async getAlbumImage (albumObject, that = this) {
    const album = await that.musicorum.dataManager.getAlbum(albumObject)
    return album ? album.getImage() : that.defaultAlbumImage
  }

  /**
   * Get a image from an track
   * @param {Object} trackObject The object from the track
   * @param {string} trackObject.name The album name
   * @param {string} trackObject.artist.name The artist name
   * @returns {Promise<Image>} The track image in canvas item
   */
  async getTrackImage (trackObject, that = this) {
    const track = await that.musicorum.dataManager.getTrack(trackObject)
    return track ? track.getImage() : that.defaultAlbumImage
  }

  async getItemImage (itemType, arg) {
    if (!itemType || typeof itemType !== 'string') throw new TypeError('Invalid item type from Theme.getItemImage')
    if (itemType.endsWith('s')) itemType = itemType.slice(0, -1)
    if (!['artist', 'album', 'track'].includes(itemType)) throw new TypeError(`Invalid item type ${itemType}. Must be 'artist', 'album' or 'track'`)
    return {
      artist: this.getArtistImage,
      album: this.getAlbumImage,
      track: this.getTrackImage
    }[itemType](arg, this)
  }

  async loadUserImage (userObject, size) {
    if (userObject.image[0]['#text']) return loadImage(LastFM.getBestImage(userObject.image, size))
    return CacheFileManager.getImageFromCache('userDefault.png', 'https://lastfm-img2.akamaized.net/i/u/avatar670/818148bf682d429dc215c1705eb27b98')
  }

  async getMultipleArtists (artists) {
    return this.musicorum.dataManager.getMultipleArtists(artists)
  }

  async generate (options) {
    throw new Error('Missing theme generate function')
  }
}
