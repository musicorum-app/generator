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
    return this.ctx.lastfm.getCachedUserInfo(username)
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
