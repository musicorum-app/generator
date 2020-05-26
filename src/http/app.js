const chalk = require('chalk')
const morgan = require('morgan')
const express = require('express')
const cors = require('cors')
const app = express()
const Routers = require('./routers.js')
const Sentry = require('@sentry/node')
const cacheRouter = require('./cache.js')

Sentry.init({ dsn: 'https://71e513cd826c403a98df4e163b510f75@o379578.ingest.sentry.io/5214235' })

module.exports = class App {
  constructor (musicorum, port) {
    this.musicorum = musicorum
    this.port = port
    this.init()
  }

  init () {
    const routers = new Routers(this.musicorum)
    app.use(express.json())
    app.use(cors())
    app.use(morgan((t, q, s) => this.morganPattern(t, q, s)))
    // app.use(morgan(':method :url'))
    app.use(Sentry.Handlers.requestHandler())
    app.use(routers.router)
    app.use(cacheRouter(this.musicorum))
    app.use(Sentry.Handlers.errorHandler())
    app.listen(this.port, () =>
      console.log(chalk.greenBright(' SUCCESS ') + ' Web server started on port ' + chalk.blue(this.port)))
  }

  morganPattern (tokens, req, res) {
    const colors = {
      GET: 'green',
      POST: 'blue',
      PUT: 'yellow',
      DELETE: 'red',
      PATCH: 'magenta'
    }
    const color = colors[req.method] || 'white'

    return chalk[color].bold(` ${tokens.status(req, res)} ${tokens.method(req, res)}`) + ` ${tokens.url(req, res)} - ${tokens.res(req, res, 'content-length')} ms `
  }
}
