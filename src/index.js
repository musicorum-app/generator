import express from 'express'
import setupLogger from './utils/logger'
import cors from 'cors'
import routes from './routes'
import { version } from '../package.json'
import messages from './messages'
import chalk from 'chalk'
import LastFm from 'lastfm-node-client'
import DatabaseController from './controllers/database'
import RedisController from './controllers/redis'
import ApplicationsController from './controllers/applications'
import WorkersController from './controllers/workers'
import TwitterAuthController from './controllers/twitter'
import UsersController from './controllers/users'

const logger = setupLogger()
const database = new DatabaseController({ logger })
const redis = new RedisController({ logger })
const lastfm = new LastFm(process.env.LASTFM_KEY)

const ctx = {
  logger,
  database,
  redis,
  lastfm
}

ctx.applicationsController = new ApplicationsController(ctx)
ctx.workersController = new WorkersController(ctx)
ctx.twitterController = new TwitterAuthController(ctx)
ctx.usersController = new UsersController(ctx)

logger.info(`Starting Musicorum API ${version}`)

const app = express()
app.use(express.json())
app.use(cors())

app.use((_, res, next) => {
  res.append('Musicorum-API-Version', version)
  next()
})

const loadRoutes = async () => {
  const router = express.Router()
  for (const route of routes) {
    route({
      ...ctx,
      router
    })
  }
  return router
}

const port = process.env.PORT || 80

loadRoutes()
  .then(router => app.use(router))
  .then(() => {
    app.use((req, res) => {
      res.status(404).json(messages.NOT_FOUND)
    })

    app.listen(port, () => {
      logger.info(`Server listening on port ${chalk.cyan(':' + port)}`)
    })
  })
