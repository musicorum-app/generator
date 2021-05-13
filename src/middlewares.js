import messages from './messages'

export const authenticationMiddleware = (applicationsController, showSuccess = false) => async (req, res, next) => {
  const s = new Date().getTime()
  const handleResponse = e => showSuccess ? {
    ...e,
    success: false
  } : e

  const { authorization } = req.headers
  if (!authorization) return res.status(401).json(handleResponse(messages.MISSING_AUTHENTICATION))

  const split = authorization.split(' ')
  if (split.length !== 2) return res.status(401).json(handleResponse(messages.INVALID_AUTHENTICATION))

  const [prefix, value] = split

  if (prefix.toLowerCase() !== 'key') return res.status(401).json(handleResponse(messages.INVALID_AUTHENTICATION))

  const app = await applicationsController.getApplicationByKey(value)

  if (!app) return res.status(401).json(handleResponse(messages.INVALID_AUTHENTICATION))

  if (!req.meta) req.meta = {}
  req.meta.app = app
  req.meta.authType = prefix

  next()
  console.log('Authentication middleware took ' + ((new Date().getTime()) - s) + 'ms.')
}
