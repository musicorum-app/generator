require('dotenv').config()
const { App, LastFM } = require('./')
const themes = require('./themes/')
const Spotify = require('node-spotify-api')

module.exports = class MusicorumGenerator {
  init () {
    this.themes = themes
    this.app = new App(this, process.env.PORT)
    this.setupApis()
  }

  setupApis () {
    this.lastfm = new LastFM(this, process.env.LASTFM_KEY)
    this.spotify = new Spotify({
      id: process.env.SPOTIFY_ID,
      secret: process.env.SPOTIFY_SECRET
    })
  }
}
