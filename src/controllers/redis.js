import { Tedis } from 'tedis'

export default class RedisController {
  constructor () {
    this.connect()
  }

  connect () {
    this.client = new Tedis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASS
    })
  }
}
