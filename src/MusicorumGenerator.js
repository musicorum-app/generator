require('dotenv').config()
const { App, LastFM } = require('./')
const themes = require('./themes/')

module.exports = class MusicorumGenerator {
  init () {
    this.themes = themes
    this.app = new App(this, process.env.PORT)
    this.setupApis()
  }

  setupApis () {
    this.lastfm = new LastFM(process.env.LASTFM_KEY)
  }
}
