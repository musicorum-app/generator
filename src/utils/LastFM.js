const fetch = require('node-fetch')

const REGEX = /\/([0-9sx]+)\//g

module.exports = class LastFM {
  constructor (apiKey) {
    this.apiKey = apiKey
  }

  async getUserTop (user, top, period, limit) {
    const params = { user, period, limit }
    return this.request('user.gettop' + top, params)
  }

  async request (method, params) {
    const urlParams = new URLSearchParams(params)
    return fetch(`http://ws.audioscrobbler.com/2.0/?method=${method}&api_key=${this.apiKey}&format=json&${urlParams.toString()}`).then(r => r.json())
  }

  static getBestImage (images, size) {
    console.log(images[0]['#text'].replace(REGEX, `/${size}x${size}/`))
    return images[0]['#text'].replace(REGEX, `/${size}x${size}/`)
  }
}
