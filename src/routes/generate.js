import { authenticationMiddleware } from '../middlewares'
import { generateEndpointJoi } from '../joi/generate'
import messages from '../messages'
import { nanoid } from 'nanoid'
import themes from '../themes'
import { loadConfiguration } from '../utils'
import { DataTypes } from 'sequelize'

const config = loadConfiguration()

export default (ctx) => {
  const {
    router,
    database,
    applicationsController,
  } = ctx

  router.post('/generate', authenticationMiddleware(applicationsController, true), async (req, res) => {
    const start = new Date().getTime()
    const id = nanoid(24)

    try {
      const { body } = req
      const {
        value,
        error
      } = generateEndpointJoi.validate(body)

      if (error) {
        return res.status(400).json({
          success: false,
          ...messages.INVALID_OPTIONS,
          validation: error.details[0].message
        })
      }


      const {
        generation,
        worker
      } = await themes.grid.instance.generate(value, id, ctx)

      const duration = (new Date().getTime()) - start

      const result = {
        success: true,
        id,
        worker: {
          name: worker.name,
          engine: worker.engine,
          version: worker.version,
          scheme: worker.scheme
        },
        result: config.result_url + generation.file,
        total_duration: duration / 1000,
        render_duration: generation.duration
      }

      res.json(result)

      await database.insertGeneration({
        id,
        status: true,
        totalDuration: duration / 1000,
        renderDuration: generation.duration,
        file: generation.file,
        theme: value.theme,
        appId: req.meta.app.id
      })
    } catch (e) {
      const duration = (new Date().getTime()) - start
      await database.insertGeneration({
        id,
        status: true,
        totalDuration: duration / 1000,
        error: e,
        appId: req.meta.app.id
      })
      return res.status(500).json(messages.INTERNAL_ERROR)
    }
  })
}
