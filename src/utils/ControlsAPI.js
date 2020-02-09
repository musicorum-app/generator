const fetch = require('node-fetch')

module.exports = class ConstrolsAPI {
  constructor () {
    this.url = process.env.API_URL
  }

  async registerGeneration (theme, timestamp, duration, status, source) {
    return fetch(this.url + 'controls/generation', {
      method: 'post',
      body: JSON.stringify({ theme, timestamp, duration, status, source }),
      headers: { Authorization: process.env.API_ADMIN_TOKEN, 'Content-Type': 'application/json' }
    })
  }
}
