const fetch = require('node-fetch')
const chalk = require('chalk')

module.exports = class ConstrolsAPI {
  constructor () {
    this.url = process.env.API_URL
  }

  async registerGeneration (theme, timestamp, duration, status, source) {
    try {
      await fetch(this.url + 'controls/generation', {
        method: 'post',
        body: JSON.stringify({ theme, timestamp, duration, status, source }),
        headers: { Authorization: process.env.API_ADMIN_TOKEN, 'Content-Type': 'application/json' }
      })
      console.log(chalk.green(' CONTROLS API ') + ' Successfully registered generation with ' +
        chalk.green(duration) + 'ms with status ' + chalk.green(status) + ' from source ' + chalk.green(source))
      return true
    } catch (e) {
      console.log(chalk.red(' CONTROLS API ') + 'Error while registering the generation: ' +
        chalk.red(e.message))
    }
  }
}
