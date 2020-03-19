const fetch = require('node-fetch')
const { loadImage } = require('canvas')

module.exports = class SpotifyAPI {
  // constructor (tokens) {

  // }

  static async getSpotifyCode (uri, background = '000000', color = 'white', width = '640', format = 'svg') {
    const url = `https://scannables.scdn.co/uri/plain/${format}/${background}/${color}/${width}/${uri}`
    return loadImage(url)
  }
}
