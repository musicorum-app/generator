import HTTPErrorMessage from '../utils/HTTPErrorMessage'
import messages from '../messages'
import LastfmAPI from '../apis/lastfm'
import { defaultUserImage } from '../constants'

export default class Theme {
  constructor (name, ctx) {
    this.ctx = ctx
    this.name = name
  }

  async getWorkerData (data, id) {
    this.ctx.logger.error(`The 'getWorkerData' method from the ${this.constructor.name} theme wasn't implemented.`)
    throw new HTTPErrorMessage(messages.NOT_IMPLEMENTED)
  }

  async getUserData (username) {
    const cache = await this.ctx.redis.getLastfmUserCache(username)
    if (!cache) return cache

    const _user = await LastfmAPI.getUserInfo(username)
    const user = {
      username: _user.name,
      name: _user.realname,
      scrobbles: _user.playcount,
      image: _user.image[3]['#text'] || defaultUserImage
    }

    this.ctx.redis.setLastfmUserCache(username, user)
    return user
  }

  async generate (data, id) {
    const worker = this.ctx.workersController.getWorkerByTheme(this.name)

    if (this.ctx.themes[this.name].needsUserData) {
      data.userData = await this.getUserData(data.user)
    }

    const {
      result,
      correctPeriod
    } = await this.getWorkerData(data, id)

    if (data.userData) {
      result.user = data.userData
    }

    return {
      generation: await worker.generate(this.name, result),
      worker,
      correctPeriod
    }
  }
}
