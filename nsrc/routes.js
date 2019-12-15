const { Router } = require('express')

const MiscController = require('./controllers/Misc')
const GeneratorController = require('./controllers/Generator')

const routes = Router()

routes.route('*')
  .all(MiscController.notfound)

routes.route('/generate')
  .post(GeneratorController.generate)
  .all(MiscController.invalid)

module.exports = routes
