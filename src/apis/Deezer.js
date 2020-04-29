const fetch = require('node-fetch')

const Sentry = require('@sentry/node')

Sentry.init({ dsn: 'https://71e513cd826c403a98df4e163b510f75@o379578.ingest.sentry.io/5214235' })

module.exports = class DeezerAPI {
  static async searchArtist (artistName) {
    console.log('making request ' + artistName)
    return fetch(`https://api.deezer.com/search/artist?q=${encodeURI(artistName)}`)
      .then(r => r.json())
      .catch(e => Sentry.captureException(e))
  }
}
