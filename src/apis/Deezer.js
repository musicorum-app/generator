const fetch = require('node-fetch')

module.exports = class DeezerAPI {
  static async searchArtist (artistName) {
    return fetch(`https://api.deezer.com/search/artist?q=${encodeURI(artistName)}`).then(r => r.json())
  }
}
