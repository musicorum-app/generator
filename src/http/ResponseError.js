const responses = require('./responses.js')

module.exports = class ResponseError extends Error {
  constructor (code, response) {
    super(response.error.error)
    this.code = code || 500
    this.response = response || responses.GENERIC_ERROR
  }
}
