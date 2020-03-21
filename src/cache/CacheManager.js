const chalk = require('chalk')
const { CachedArtist, CachedAlbum } = require('./items')
const CacheFileManager = require('./CacheFileManager.js')
const MiscUtils = require('../utils/MiscUtils.js')
const path = require('path')

const nameFilter = n => n.toLowerCase().replace(/\s+/g, '')

const classes = {
  artists: CachedArtist,
  albums: CachedAlbum
}

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
      await this.loadItems('artists')
      await this.loadItems('albums')
      await this.loadItems('tracks')
    } catch (e) {
      console.log(chalk.red(' CACHE MANAGER ') + ' Error while loading cache from file in ' + (new Date().getTime() - start) + 'ms')
      console.error(e)
      return
    } finally {
      this.cacheLoaded = true
    }

    console.log(chalk.green(' CACHE MANAGER ') + ' Cache loaded from files in ' + (new Date().getTime() - start) + 'ms')
  }

  async loadItems (type) {
    console.log(chalk.blue(' CACHE MANAGER ') + ` Loading ${type} cache...`)
    const items = await CacheFileManager.loadCacheJSONFile(type + '.json')
    this[type] = items.map(i => new classes[type](i))
    const albumsSize = await CacheFileManager.getFileSize(type + '.json')
    console.log(chalk.blue(' CACHE MANAGER ') + ` Successfully loaded ${type} cache file using  ${chalk.blue(MiscUtils.humanReadSize(albumsSize))}`)
  }

  getArtist (artist) {
    const foundArtist = this.artists.find(a => nameFilter(a.name) === nameFilter(artist))
    return foundArtist || null
  }

  getAlbum (album, artist) {
    const foundAlbum = this.albums.find(a => nameFilter(a.name) === nameFilter(album) &&
      nameFilter(a.artist) === nameFilter(artist))
    return foundAlbum || null
  }

  async saveCacheTask () {
    console.log(chalk.blue(' CACHE MANAGER ') + ' Initialiazing cache json save task...')
    this.saveCacheArray(this.artists, 'artists.json')
    this.saveCacheArray(this.albums, 'albums.json')
    this.saveCacheArray(this.tracks, 'tracks.json')
  }

  async saveCacheArray (array, file) {
    console.log(chalk.blue(' CACHE MANAGER ') + ` Starting to save cache for ${file}...`)
    CacheFileManager.saveJSONFile(path.resolve(__dirname, '..', '..', 'cache', file), array)
  }
}
