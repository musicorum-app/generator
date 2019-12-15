module.exports = {
  notfound (_, res) {
    res.status(404).send({
      error: {
        code: 404,
        message: 'Not found.'
      }
    })
  },

  invalid (_, res) {
    res.status(405).send({
      error: {
        code: 405,
        message: 'Method not allowed'
      }
    })
  }
}
