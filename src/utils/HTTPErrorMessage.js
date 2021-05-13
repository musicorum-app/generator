export default class HTTPErrorMessage extends Error {
  constructor (err) {
    super()
    this.code = err.code
    this.err = err
  }
}
