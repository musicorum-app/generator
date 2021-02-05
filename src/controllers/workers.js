import fetch from 'node-fetch'
import { handleURL } from '../utils'
import Worker from '../models/Worker'

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
        return null
      })

    if (!metadata) return

    this.logger.info(`Worker '${metadata.name}' using '${metadata.engine} ${metadata.version}' setup done!`)
    this.workers.push(new Worker(url, metadata))
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
    return this.themeWorkers[theme][0]
  }
}
