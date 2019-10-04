require('dotenv').config()
const { MiscUtils, App } = require('./')
const LFM = require('last-fm')

module.exports = class MusicorumGenerator {
  init () {
    this.loadThemes()
    this.themes = []
    this.app = new App(process.env.PORT)
  }

  setupApis () {
    this.lastfm = new LFM(process.env.LASTFM_KEY, { userAgent: 'MusicorumGenerator/1.0.0 (http://musicorum.xyz)' })
  }

  loadThemes () {
    const themes = MiscUtils.readdir('./src/themes')

    for (const Theme in themes) {
      this.themes.push(new Theme(this))
    }
  }
}
