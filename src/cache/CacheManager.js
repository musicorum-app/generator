const chalk = require('chalk')
const { CachedArtist } = require('./items')
const CacheFileManager = require('./CacheFileManager.js')
const MiscUtils = require('../utils/MiscUtils.js')

const classes = {
  artists: CachedArtist
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
    const filterName = artist.toLowerCase().replace(/\s+/g, '')
    const foundArtist = this.artists.find(a => a.name.toLowerCase().replace(/\s+/g, '') === filterName)
    return foundArtist || null
  }
}
