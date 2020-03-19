const { loadImage, createCanvas } = require('canvas')
const { CachedArtist, CachedAlbum } = require('../cache/items')
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

  async getItemImage (item, searchFallback, ItemClass, list, spotifyCode, size = 280, background = '000000', color = 'white') {
    if (item) {
      if (spotifyCode) {
        if (!item.spotify) {
          try {
            const obj = await searchFallback(true)
            if (!obj) throw new Error('Search not found or returned error')
            item.spotify = obj.spotify
          } catch (e) {
            return DataManager.createCanvasWithoutScannable(await item.getImage(), size)
          }
        }

        return DataManager.createCanvasWithScannable(await item.getImage(), item.getURI(), background, color, size)
      } else {
        return item.getImage()
      }
    } else {
      if (spotifyCode) {
        try {
          const obj = await searchFallback(true)
          if (!obj) throw new Error('Search not found or returned error')
          item.spotify = obj.spotify

          const newItem = new ItemClass(obj)
          list.push(newItem)
          return DataManager.createCanvasWithScannable(await newItem.getImage(), item.getURI(), background, color, size)
        } catch (e) {
          console.error(e)
          return DataManager.createCanvasWithoutScannable(this.defaultArtistImage, size)
        }
      } else {
        try {
          const obj = await searchFallback(false)
          if (!obj) throw new Error('Search not found or returned error')
          item.spotify = obj.spotify

          const newItem = new ItemClass(obj)
          list.push(newItem)
          return newItem.getImage()
        } catch (e) {
          return this.defaultArtistImage
        }
      }
    }
  }

  async searchFallback (spotifySource = true) {

  }

  async getArtistImage (artistName, spotifyCode, size = 280, background = '000000', color = 'white') {
    const artist = this.cacheManager.getArtist(artistName)
    const searchFallback = async spotifySource => {
      if (spotifySource) {
        const query = encodeURIComponent(artistName)
        const spotifyArtist = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=artist&q=${query}`)
        const spotifyObject = spotifyArtist.artists.items[0]
        return {
          name: spotifyObject.name,
          image: spotifyObject.images[1].url,
          spotify: spotifyObject.id,
          imageID: `a_S${spotifyObject.id}`
        }
      } else {
        const res = await DeezerAPI.searchArtist(artistName)
        const deezerArtist = res.data[0]
        return {
          name: deezerArtist.name,
          image: deezerArtist.picture_medium,
          deezer: deezerArtist.id.toString(),
          imageID: `a_D${deezerArtist.id}`
        }
      }
    }
    return this.getItemImage(artist, searchFallback, CachedArtist, this.cacheManager.artists, spotifyCode, size, background, color)
  }

  async getAlbumImage (albumName, artistName, spotifyCode, size = 280, background = '000000', color = 'white') {
    // TODO: finish this
    const album = this.cacheManager.getAlbum(albumName, artistName)
    const searchFallback = async spotifySource => {
      if (spotifySource) {
        const query = encodeURIComponent(artistName)
        const spotifyArtist = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=album&q=${query}`)
        const spotifyObject = spotifyArtist.artists.items[0]
        return {
          name: spotifyObject.name,
          artist: spotifyObject.artists[0].name,
          image: spotifyObject.images[1].url,
          spotify: spotifyObject.id,
          imageID: `l_S${spotifyObject.id}`
        }
      } else {
        const res = await DeezerAPI.searchArtist(artistName)
        const deezerArtist = res.data[0]
        return {
          name: deezerArtist.name,
          image: deezerArtist.picture_medium,
          deezer: deezerArtist.id.toString(),
          imageID: `l_D${deezerArtist.id}`
        }
      }
    }
    return this.getItemImage(album, searchFallback, CachedArtist, this.cacheManager.albums, spotifyCode, size, background, color)
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
