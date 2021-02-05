import express from 'express'
import setupLogger from './utils/logger'
import cors from 'cors'
import routes from './routes'
import { version } from '../package.json'
import messages from './messages'
import chalk from 'chalk'

const logger = setupLogger()

logger.info(`Starting Musicorum Generator gateway ${version}`)

const app = express()
app.use(express.json())
app.use(cors())

app.use((_, res, next) => {
  res.append('Musicorum-Generator-Version', version)
  next()
})

const loadRoutes = async () => {
  const router = express.Router()
  for (const route of routes) {
    route({
      router,
      logger
    })
  }

  return router
}

const port = process.env.PORT || 80

loadRoutes()
  .then(router => app.use(router))
  .then(() => {
    app.use((req, res) => {
      res.json(messages.NOT_FOUND)
    })

    app.listen(port, () => {
      logger.info(`Server listening on port ${chalk.cyan(':' + port)}`)
    })
  })
