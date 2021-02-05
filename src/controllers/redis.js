import { Tedis } from 'tedis'

export default class RedisController {
  constructor ({ logger }) {
    this.logger = logger
    this.connect()
  }

  connect () {
    this.client = new Tedis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASS
    })

    this.client.on('connect', () => {
      this.logger.info('Redis: client connected!')
    })
    this.client.on('error', e => {
      this.logger.error('Redis: client error: ' + e)
    })
  }

  setApplication ({
    id,
    key,
    name,
    secret
  }) {
    return this.client.hmset(`app:key:${key}`, {
      id,
      name,
      secret
    })
  }

  getApplicationByKey (key) {
    return this.client.hgetall(`app:key:${key}`)
  }
}
