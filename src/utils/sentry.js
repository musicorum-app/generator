import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import messages from '../messages'

const sentryEnabled = !!process.env.SENTRY_DSN

export const initSentry = (app, logger) => {
  if (!sentryEnabled) return

  logger.info('Initializing sentry handler.')

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app })
    ],

    tracesSampleRate: 1.0
  })

  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())
}

export const postSentryHandler = (app) => {
  if (!sentryEnabled) return

  app.use(Sentry.Handlers.errorHandler())

  app.use((error, req, res) => {
    Sentry.captureException(error)
    return res.status(500).json({
      ...messages.INTERNAL_ERROR,
      e: error.toString()
    })
  })
}
