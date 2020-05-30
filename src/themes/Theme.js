const { loadImage, createCanvas } = require('canvas')
const CacheFileManager = require('../cache/CacheFileManager.js')
const LastFM = require('../utils/LastFM.js')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')
const path = require('path')
const Sentry = require('@sentry/node')

Sentry.init({ dsn: 'https://71e513cd826c403a98df4e163b510f75@o379578.ingest.sentry.io/5214235' })

module.exports = class Theme {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.loadDefaults()
  }

  async loadDefaults () {
    this.defaultArtistImage = await loadImage(path.resolve(__dirname, '..', '..', 'cache', 'artistDefault.png'))
    this.defaultAlbumImage = await loadImage(path.resolve(__dirname, '..', '..', 'cache', 'albumDefault.png'))
    const canvas = createCanvas(1, 1)
    canvas.getContext('2d')
    this.blankCanvas = canvas
  }

  async preGenerate (options) {
    try {
      if (!options.user) throw new ResponseError(400, responses.MISSING_USER)
      // eslint-disable-next-line no-extra-boolean-cast
      if (options.story) return this.generateStory(options)
      else return this.generate(options)
    } catch (e) {
      Sentry.captureException(e)
      if (e instanceof ResponseError) throw e
      console.error(e)
      throw new ResponseError(500, responses.GENERIC_ERROR)
    }
  }

  /**
   * Get a image from an artist
   * @param {(string|Object)} artistObject The name of the artist OR the artist Object
   * @param {string} artistObject.name The artist name from the object
   * @param {number} size The image size
   * @returns {Promise<Image>} The artist image in canvas item
   */
  async getArtistImage (artistObject, size) {
    if (!artistObject) return this.blankCanvas
    const artist = await this.musicorum.dataManager.getArtist(artistObject)
    return artist ? artist.getImage(this.musicorum.cacheFileManager, size) : this.defaultArtistImage
  }

  /**
   * Get a image from an album
   * @param {Object} albumObject The object from the album
   * @param {string} albumObject.name The album name
   * @param {string} albumObject.artist.name The artist name
   * @param {number} size The image size
   * @returns {Promise<Image>} The album image in canvas item
   */
  async getAlbumImage (albumObject, size) {
    if (!albumObject) return this.blankCanvas
    const album = await this.musicorum.dataManager.getAlbum(albumObject)
    return album ? album.getImage(this.musicorum.cacheFileManager, size) : this.defaultAlbumImage
  }

  /**
   * Get a image from an track
   * @param {Object} trackObject The object from the track
   * @param {string} trackObject.name The album name
   * @param {string} trackObject.artist.name The artist name
   * @param {number} size The image size
   * @returns {Promise<Image>} The track image in canvas item
   */
  async getTrackImage (trackObject, size) {
    if (!trackObject) return this.blankCanvas
    const track = await this.musicorum.dataManager.getTrack(trackObject)
    return track ? track.getImage(this.musicorum.cacheFileManager) : this.defaultAlbumImage
  }

  async getItemImage (itemType, arg, size) {
    if (!itemType || typeof itemType !== 'string') throw new TypeError('Invalid item type from Theme.getItemImage')
    if (itemType.endsWith('s')) itemType = itemType.slice(0, -1)
    if (!['artist', 'album', 'track'].includes(itemType)) throw new TypeError(`Invalid item type ${itemType}. Must be 'artist', 'album' or 'track'`)
    switch (itemType) {
      case 'artist':
        return this.getArtistImage(arg, size)
      case 'track':
        return this.getTrackImage(arg, size)
      case 'album':
        return this.getAlbumImage(arg, size)
      default:
        return null
    }
  }

  async loadUserImage (userObject, size) {
    if (userObject.image[0]['#text']) return loadImage(LastFM.getBestImage(userObject.image, size))
    return this.musicorum.cacheFileManager.getImageFromCache('userDefault.png', 'https://lastfm-img2.akamaized.net/i/u/avatar670/818148bf682d429dc215c1705eb27b98')
  }

  /**
   * @deprecated
   */
  async getMultipleArtists (artists) {
    return this.musicorum.dataManager.getMultipleArtists(artists)
  }

  async generate () {
    throw new Error('Missing theme generate function')
  }

  async generateStory () {
    throw new Error('Missing instagram theme generate function')
  }
}
