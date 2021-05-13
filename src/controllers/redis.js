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

  async setTwitterTokenSecret (tokenId, tokenSecret) {
    await this.client.set(`auth:twitter:ti:${tokenId}`, tokenSecret)
    return this.client.expire(`auth:twitter:ti:${tokenId}`, 4 * 60 * 60)
  }

  getTwitterTokenSecret (tokenId) {
    return this.client.get(`auth:twitter:ti:${tokenId}`)
  }

  async getTwitterUserCache (id) {
    const exists = await this.client.exists(`user:twitter:${id}`)
    if (exists === 0) return null
    return this.client.hgetall(`user:twitter:${id}`)
  }

  async setTwitterUserCache (id, data) {
    await this.client.hmset(`user:twitter:${id}`, data)
    return this.client.expire(`user:twitter:${id}`, 4 * 60 * 60)
  }
}
