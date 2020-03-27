const { loadImage } = require('canvas')
const Spotify = require('node-spotify-api')

const BASE_URL = 'https://api.spotify.com/v1'

module.exports = class SpotifyAPI extends Spotify {
  request (query, ...args) {
    return super.request(/* typeof query === 'string' ? `${BASE_URL}${query}` : */ query, ...args)
  }

  static async getSpotifyCode (uri, background = '000000', color = 'white', width = '640', format = 'svg') {
    const url = `https://scannables.scdn.co/uri/plain/${format}/${background}/${color}/${width}/${uri}`
    return loadImage(url)
  }
}
