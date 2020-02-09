const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')

module.exports = class Theme {
  constructor (musicorum) {
    this.musicorum = musicorum
  }

  async preGenerate (options) {
    try {
      if (!options.user) throw new ResponseError(400, responses.MISSING_USER)
      return this.generate(options)
    } catch (e) {
      if (e instanceof ResponseError) throw e
      console.error(e)
      throw new ResponseError(500, responses.GENERIC_ERROR)
    }
  }

  async generate (options) {
    throw new Error('Missing theme generate function')
  }
}
