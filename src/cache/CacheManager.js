const chalk = require('chalk')
const path = require('path')
const { loadImage } = require('canvas')
const CacheFileManager = require('./CacheFileManager.js')
const MiscUtils = require('../utils/MiscUtils.js')
const fetch = require('node-fetch')

module.exports = class CacheManager {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.cacheLoaded = false
    this.artists = []
    this.albums = []
    this.tracks = []
    this.init()
  }

  async init () {
    console.log(chalk.blue(' CACHE MANAGER ') + ' Starting to load cache from local file...')
    const start = new Date().getTime()

    try {
      console.log(chalk.blue(' CACHE MANAGER ') + ' Loading artists cache...')
      this.artists = await CacheFileManager.loadCacheJSONFile('artists.json')
      const artistsSize = await CacheFileManager.getFileSize('artists.json')
      console.log(chalk.blue(' CACHE MANAGER ') + ' Artists cache file loaded using ' + chalk.blue(MiscUtils.humanReadSize(artistsSize)))

      console.log(chalk.blue(' CACHE MANAGER ') + ' Loading albums cache...')
      this.albums = await CacheFileManager.loadCacheJSONFile('albums.json')
      const albumsSize = await CacheFileManager.getFileSize('albums.json')
      console.log(chalk.blue(' CACHE MANAGER ') + ' Albums cache file loaded using ' + chalk.blue(MiscUtils.humanReadSize(albumsSize)))

      console.log(chalk.blue(' CACHE MANAGER ') + ' Loading tracks cache...')
      this.tracks = await CacheFileManager.loadCacheJSONFile('tracks.json')
      const tracksSize = await CacheFileManager.getFileSize('tracks.json')
      console.log(chalk.blue(' CACHE MANAGER ') + ' Tracks cache file loaded using ' + chalk.blue(MiscUtils.humanReadSize(tracksSize)))
    } catch (e) {
      console.log(chalk.red(' CACHE MANAGER ') + ' Error while loading cache from file in ' + (new Date().getTime() - start) + 'ms')
      console.error(e)
      return
    } finally {
      this.cacheLoaded = true
    }

    console.log(chalk.green(' CACHE MANAGER ') + ' Cache loaded from files in ' + (new Date().getTime() - start) + 'ms')
  }

  async getArtist (artist) {
    const filterName = artist.toLowerCase().replace(/\s+/g, '')
    const foundArtist = this.artists.find(a => a.name.toLowerCase().replace(/\s+/g, '') === filterName)
    console.log(foundArtist)
  }

  static async getImageFromCache (fileName, fallbackUrl) {
    if (!fallbackUrl) throw new Error('Missing image url while fallbacking to url')
    const pathName = path.resolve(__dirname, '..', '..', 'cache', fileName)
    return loadImage(pathName)
      .then(i => i)
      .catch(async () => {
        console.log(chalk.yellow(' DOWNLOADING IMAGE ') + 'from ' + fallbackUrl)
        const res = await fetch(fallbackUrl)
        const buffer = await res.buffer()
        CacheFileManager.saveImage(pathName, buffer)
        return loadImage(buffer)
      })
  }
}
