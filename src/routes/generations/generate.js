import { authenticationMiddleware } from '../../middlewares'
import { generateEndpointJoi } from '../../joi/generate'
import messages from '../../messages'
import { nanoid } from 'nanoid'
import { loadConfiguration } from '../../utils'
import HTTPErrorMessage from '../../utils/HTTPErrorMessage'
import * as Sentry from '@sentry/node'

const config = loadConfiguration()

export default (ctx) => {
  const {
    logger,
    router,
    database,
    applicationsController
  } = ctx

  router.post('/generations/generate', authenticationMiddleware(applicationsController, true), async (req, res) => {
    const start = new Date().getTime()
    const id = nanoid(24)
    let _generation = null
    let _theme = null

    try {
      const { body } = req
      const {
        value,
        error
      } = generateEndpointJoi.validate(body)

      _theme = value.theme

      if (error) {
        return res.status(400).json({
          success: false,
          ...messages.INVALID_OPTIONS,
          validation: error.details[0].message
        })
      }

      const {
        generation,
        worker,
        correctPeriod
      } = await ctx.themes[value.theme].instance.generate(value, id, ctx)

      if (!generation) {
        throw new HTTPErrorMessage(messages.INTERNAL_ERROR)
      }

      if (generation.error) {
        return res.status(generation.code).json({
          ...generation,
          from_worker: true
        })
      }

      if (!generation.file) {
        throw new HTTPErrorMessage(messages.INTERNAL_ERROR)
      }

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
        render_duration: generation.duration,
        correct_period: correctPeriod
      }

      _generation = {
        id,
        status: true,
        total_duration: duration / 1000,
        render_duration: generation.duration,
        file: generation.file,
        theme: _theme,
        app_id: req.meta.app.id
      }

      res.json(result)
    } catch (e) {
      if (e instanceof HTTPErrorMessage) {
        return res.status(e.code).json(e.err)
      }

      Sentry.captureException(e, {
        contexts: {
          generation: {
            ID: id,
            Theme: req.body.theme
          }
        }
      })

      res.status(500).json(messages.INTERNAL_ERROR)
      const duration = (new Date().getTime()) - start
      _generation = {
        ..._generation,
        id,
        theme: _theme,
        status: false,
        total_duration: duration / 1000,
        error: e.toString(),
        app_id: req.meta.app.id
      }

      logger.error('Generation error:', e)
    }

    await database.insertGeneration({
      ..._generation,
      created_at: new Date().getTime().toString(),
      updated_at: new Date().getTime().toString()
    })
  })
}
