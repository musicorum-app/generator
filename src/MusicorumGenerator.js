const { App, LastFM } = require('./')
const themeList = require('./themes/')
const Spotify = require('./apis/Spotify')
const ControlsAPI = require('./utils/ControlsAPI.js')
const CacheManager = require('./cache/CacheManager.js')
const DataManager = require('./managers/DataManager.js')

module.exports = class MusicorumGenerator {
  init () {
    this.themes = this.getThemes()
    this.app = new App(this, process.env.PORT)
    this.cacheManager = new CacheManager(this)
    this.dataManager = new DataManager(this)
    this.setupApis()
    this.setupTasks()
  }

  setupApis () {
    this.lastfm = new LastFM(this, process.env.LASTFM_KEY)
    this.spotify = new Spotify({
      id: process.env.SPOTIFY_ID,
      secret: process.env.SPOTIFY_SECRET
    })
    this.controlsAPI = new ControlsAPI()
  }

  setupTasks () {
    setInterval(() => {
      this.cacheManager.saveCacheTask()
    }, process.env.CACHE_SAVE_INTERVAL)
  }

  getThemes () {
    const themes = {}
    Object.keys(themeList).forEach(Theme => {
      themes[Theme] = new themeList[Theme](this)
    })
    return themes
  }
}
