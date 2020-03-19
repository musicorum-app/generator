const { loadImage, createCanvas } = require('canvas')
const { CachedArtist } = require('../cache/items')
const SpotifyAPI = require('../apis/Spotify.js')
const DeezerAPI = require('../apis/Deezer.js')
const path = require('path')

module.exports = class DataManager {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.cacheManager = musicorum.cacheManager
    this.loadDefaults()
  }

  async loadDefaults () {
    this.defaultArtistImage = await loadImage(path.resolve(__dirname, '..', '..', 'cache', 'artistDefault.png'))
  }

  async getArtistImage (artistName, spotifyCode, size = 280, background, color = 'black') {
    const artist = this.cacheManager.getArtist(artistName)
    console.log(artist)
    if (artist) {
      if (spotifyCode) {
        if (!artist.spotify) {
          try {
            const query = encodeURIComponent(artistName)
            const spotifyArtist = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=artist&q=${query}`)
            artist.spotify = spotifyArtist.artists.items[0].id
          } catch (e) {
            return DataManager.createCanvasWithoutScannable(await artist.getImage(), size)
          }
        }

        return DataManager.createCanvasWithScannable(await artist.getImage(), `spotify:artist:${artist.spotify}`, background, color, size)
      } else {
        return artist.getImage()
      }
    } else {
      if (spotifyCode) {
        try {
          const query = encodeURIComponent(artistName)
          const spotifyArtist = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=artist&q=${query}`)
          const spotifyObject = spotifyArtist.artists.items[0]
          const obj = {
            name: spotifyObject.name,
            image: spotifyObject.images[1].url,
            spotify: spotifyObject.id,
            imageID: `a_S${spotifyObject.id}`
          }
          const newArtist = new CachedArtist(obj)
          this.cacheManager.artists.push(newArtist)
          return DataManager.createCanvasWithScannable(await newArtist.getImage(), `spotify:artist:${newArtist.spotify}`, background, color, size)
        } catch (e) {
          console.error(e)
          return DataManager.createCanvasWithoutScannable(this.defaultArtistImage, size)
        }
      } else {
        try {
          const res = await DeezerAPI.searchArtist(artistName).then(r => r.json())
          const deezerArtist = res.data[0]
          const obj = {
            name: deezerArtist.name,
            image: deezerArtist.picture_medium,
            deezer: deezerArtist.id.toString(),
            imageID: `a_D${deezerArtist.id}`
          }
          const newArtist = new CachedArtist(obj)
          this.cacheManager.artists.push(newArtist)
          return newArtist.getImage()
        } catch (e) {
          return this.defaultArtistImage
        }
      }
    }
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
    ctx.drawImage(image, 0, 0, size, size)
    const scannable = await SpotifyAPI.getSpotifyCode(uri, background, color, 280)
    ctx.drawImage(scannable, 0, size, size, scannableHeight)
    return canvas
  }
}
