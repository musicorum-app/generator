const createMessage = (error, message) => ({
  error, message
})

export default {
  NOT_FOUND: createMessage('NOT_FOUND', 'Endpoint not found.'),
  MISSING_PARAMS: createMessage('MISSING_PARAMS', 'Missing parameters.'),
  INTERNAL_ERROR: createMessage('INTERNAL_ERROR', 'Internal error.'),
  MISSING_AUTHENTICATION: createMessage('MISSING_AUTHENTICATION', 'Missing authentication header.'),
  INVALID_AUTHENTICATION: createMessage('INVALID_AUTHENTICATION', 'Invalid authentication header.')
}
