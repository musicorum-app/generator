const RequestSource = require('./RequestSource.js')
const chalk = require('chalk')
const crypto = require('crypto')

module.exports = class RequestQueue {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.queue = {}
    this.processingRequests = {}
    this.init()
  }

  init () {
    Object.keys(RequestSource).forEach(s => {
      this.queue[s] = new Map()
      this.processingRequests[s] = new Map()
    })
    setInterval(this.tick.bind(this), 1000)
  }

  getRandomId () {
    return crypto.randomBytes(8).toString('hex').toUpperCase()
  }

  request (source, fn) {
    return new Promise((resolve, reject) => {
      this.queue[source].set(this.getRandomId(), {
        fn,
        resolve,
        reject,
        source
      })
    })
  }

  tick () {
    Object.keys(RequestSource).forEach(source => {
      const limit = process.env[`${source}_REQS_PS`] || 3
      const sourceQueue = this.queue[source]
      const processingRequests = this.processingRequests[source]
      const ableToDo = limit - processingRequests.size
      if (sourceQueue.size > 0) {
        console.log(chalk.cyan(source + ' QUEUE: ' + sourceQueue.size))
      }

      if (sourceQueue.size <= ableToDo) {
        sourceQueue.forEach((i, k) => {
          processingRequests.set(k, i)
          this.doRequest(k, i)
        })
        sourceQueue.clear()
      } else {
        const iterator = sourceQueue.entries()
        const reqs = []
        for (let i = 0; i < ableToDo; i++) {
          reqs.push(iterator.next().value)
        }
        reqs.forEach(([k, v]) => {
          this.doRequest(k, v)
          sourceQueue.delete(k)
        })
      }
    })
  }

  doRequest (key, item) {
    console.log(chalk.blue(`Doing request for ${item.source} item`))
    const { fn, resolve, reject, source } = item
    fn().then(r => {
      // console.log(chalk.green(`request for ${source} completed!`))
      resolve(r)
      this.processingRequests[source].delete(key)
    }).catch(r => {
      reject(r)
      this.processingRequests[source].delete(key)
    })
  }
}
