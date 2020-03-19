const { App, LastFM } = require('./')
const themeList = require('./themes/')
const Spotify = require('node-spotify-api')
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
  }

  setupApis () {
    this.lastfm = new LastFM(this, process.env.LASTFM_KEY)
    this.spotify = new Spotify({
      id: process.env.SPOTIFY_ID,
      secret: process.env.SPOTIFY_SECRET
    })
    this.controlsAPI = new ControlsAPI()
    setTimeout(async () => {
      console.log(await this.cacheManager.getArtist('cageThe elephant'))
    }, 1000)
  }

  getThemes () {
    const themes = {}
    Object.keys(themeList).forEach(Theme => {
      themes[Theme] = new themeList[Theme](this)
    })
    return themes
  }
}
