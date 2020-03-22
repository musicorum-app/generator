const { loadImage, createCanvas } = require('canvas')
const { CachedArtist, CachedAlbum, CachedTrack } = require('../cache/items')
const SpotifyAPI = require('../apis/Spotify.js')
const DeezerAPI = require('../apis/Deezer.js')
const SearchManager = require('./SearchManager.js')
const path = require('path')
const crypto = require('crypto')

module.exports = class DataManager {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.cacheManager = musicorum.cacheManager
    this.searchManager = new SearchManager(musicorum)
    this.loadDefaults()
  }

  async loadDefaults () {
    this.defaultArtistImage = await loadImage(path.resolve(__dirname, '..', '..', 'cache', 'artistDefault.png'))
    this.defaultAlbumImage = await loadImage(path.resolve(__dirname, '..', '..', 'cache', 'albumDefault.png'))
  }

  async getArtist (artistItem) {
    let artistName
    if (typeof artistItem === 'string') artistName = artistItem
    else {
      artistName = artistItem.name
    }
    
    const artist = this.cacheManager.getArtist(artistName)
    if (artist) return artist
    else {
      const deezerImageRegex = /https?:\/\/([a-zA-Z0-9.-]+)\/images\/artist\/([a-zA-Z0-9]+)\/([0-9]+)x([0-9]+)-([0-9a-zA-Z.-]+)/g
      const { data } = await DeezerAPI.searchArtist(artistName)
      const image = data.length ? data[0].picture_medium : null
      if (!image) return null
      const regexResult = deezerImageRegex.test(image)
      if (!regexResult) return null
      const newArtist = new CachedArtist({
        name: artistName,
        image,
        imageID: `A_D${data[0].id}`
      })

      this.cacheManager.artists.push(newArtist)
      return newArtist
    }
  }

  async getAlbum ({ name, artist, image: albumImage }) {
    const artistName = artist['#text'] || artist.name
    const album = this.cacheManager.getAlbum(name, artistName)

    if (album) return album

    const image = albumImage ? albumImage[3] ? albumImage[3]['#text'] : null : null
    let newAlbum

    if (image) {
      newAlbum = new CachedAlbum({
        artist: artistName,
        name,
        image,
        imageID: `R_L${crypto.randomBytes(8).toString('hex').toUpperCase()}`
      })
    } else {
      try {
        const res = await this.musicorum.lastfm.getAlbumInfo(name, artistName, true)
        const newImage = res.album.image[3]['#text']
        if (!newImage) throw new Error('Error while getting the image')
        newAlbum = new CachedAlbum({
          name,
          artist: artistName,
          image: newImage,
          imageID: `R_L${crypto.randomBytes(8).toString('hex').toUpperCase()}`
        })
      } catch (e) {
        console.error(e)
        return null
      }
    }

    this.cacheManager.albums.push(newAlbum)
    return newAlbum
  }

  async getTrack ({ name, artist, image: albumImage }) {
    const artistName = artist['#text'] || artist.name
    const track = this.cacheManager.getTrack(name, artistName)

    if (track) return track

    try {
      const res = await this.searchManager.searchTrackFromSpotify(name, artistName)
      const newTrack = new CachedTrack(res)
      this.cacheManager.tracks.push(newTrack)
      return newTrack
    } catch (e) {
      console.error(e)
      return null
    }
  }

  // TODO: method to get a bunch of images using MBID
  // TODO: finish this
  async getMultipleArtists (artists) {
    const result = []
    for (const { name, mbid } of artists) {
      const foundArtist = this.cacheManager.getArtist(name)
      if (foundArtist) {
        result.push(foundArtist)
        continue
      }
      let newArtist

      if (mbid) {
        try {
          const id = this.searchManager.getSpotifyIdFromArtistMBID(null, mbid, false)
          result.push(id)
          continue
        } catch (e) {
          result.push(new CachedArtist(await this.searchManager.searchArtistFromSpotify(name)))
        }
        newArtist = new CachedArtist({
          name,
          image: `http://coverartarchive.org/release/${mbid}/front-250`,
          imageID: `a_M${crypto.randomBytes(8).toString('hex').toUpperCase()}`
        })
      } else {
        newArtist = new CachedArtist(await this.searchManager.searchArtistFromSpotify(name))
      }

      this.cacheManager.albums.push(newArtist)
      result.push(newArtist)
    }

    return result
  }

  static createCanvasWithoutScannable (image, size) {
    const scannableHeight = Math.round((size / 4))
    const canvas = createCanvas(size, size + scannableHeight)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, 0, 0, size, size)

    return canvas
  }

  static async createCanvasWithScannable (image, uri, background, color, size) {
    const scannableHeight = Math.round((size / 4))
    const canvas = createCanvas(size, size + scannableHeight)
    const ctx = canvas.getContext('2d')
    const scannable = await SpotifyAPI.getSpotifyCode(uri, background, color, 280)

    ctx.drawImage(image, 0, 0, size, size)
    ctx.drawImage(scannable, 0, size, size, scannableHeight)

    return canvas
  }
}
