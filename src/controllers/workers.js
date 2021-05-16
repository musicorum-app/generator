import fetch from 'node-fetch'
import { handleURL } from '../utils'
import Worker from '../models/Worker'
import HTTPErrorMessage from '../utils/HTTPErrorMessage'
import messages from '../messages'

export default class WorkersController {
  constructor ({ logger }) {
    this.workers = []
    this.themeWorkers = {}

    this.logger = logger
    this.setupWorkers()
      .then(() => {
        this.setupThemes()
        logger.info('Workers setup done!')
      })
  }

  async setupWorkers () {
    const workersURL = process.env.WORKERS
    if (!workersURL) {
      this.logger.error('\'WORKERS\' environment variable required but not defined.')
    }

    for (const w of workersURL.split(';')) {
      await this.setupWorker(w)
    }
  }

  async setupWorker (workerURL) {
    const url = handleURL(workerURL)

    const metadata = await fetch(url + 'metadata', {
      header: {
        'content-type': 'application/json'
      }
    })
      .then(r => r.json())
      .catch(e => {
        this.logger.warn(`Not possible to connect to worker url '${workerURL}' due to ` + e)
        this.logger.warn('Attempting to connect again to worker.')
        this.startLoopLookup(workerURL)
        return null
      })

    if (!metadata) return

    this.logger.info(`Worker '${metadata.name}' using '${metadata.engine} ${metadata.version}' setup done!`)
    this.workers.push(new Worker(url, metadata))
  }

  async startLoopLookup (workerURL) {
    const url = handleURL(workerURL)

    const interval = setInterval(async () => {
      this.logger.debug(`Trying again to connect to worker at ${url}.`)

      const metadata = await fetch(url + 'metadata', {
        header: {
          'content-type': 'application/json'
        }
      })
        .then(r => r.json())
        .catch(() => {
          this.logger.debug(`Could not connect to worker at ${url}. Trying again in 5 minutes.`)
          return null
        })

      if (metadata) {
        clearInterval(interval)
        await this.setupWorker(url)
        this.setupThemes()
      }
    }, 5 * 60 * 1000)
  }

  setupThemes () {
    for (const worker of this.workers) {
      for (const theme of worker.themes) {
        if (!this.themeWorkers[theme]) {
          this.themeWorkers[theme] = []
        }
        this.themeWorkers[theme].push(worker)
      }
    }
  }

  getWorkerByTheme (theme) {
    if (!this.themeWorkers[theme] || this.themeWorkers[theme].length === 0) throw new HTTPErrorMessage(messages.NO_AVAILABLE_WORKER)
    return this.themeWorkers[theme][0]
  }
}
