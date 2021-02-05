import messages from './messages'

export default function authenticationMiddleware (req, res, next) {
  const { authentication } = req.headers
  if (!authentication) return res.status(401).json(messages.MISSING_AUTHENTICATION)

  const split = authentication.split(' ')
  if (split.length !== 2) return res.status(401).json(messages.INVALID_AUTHENTICATION)

  const [prefix, value] = split

  if (prefix.toLowerCase() !== 'key') return res.status(401).json(messages.INVALID_AUTHENTICATION)
}
