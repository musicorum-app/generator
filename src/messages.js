export const createMessage = (code, error, message) => ({
  code,
  error,
  message
})

export default {
  NOT_FOUND: createMessage(404, 'NOT_FOUND', 'Endpoint not found.'),
  MISSING_PARAMS: createMessage(400, 'MISSING_PARAMS', 'Missing parameters.'),
  INTERNAL_ERROR: createMessage(500, 'INTERNAL_ERROR', 'Internal error.'),
  MISSING_AUTHENTICATION: createMessage(401, 'MISSING_AUTHENTICATION', 'Missing authentication header.'),
  INVALID_AUTHENTICATION: createMessage(401, 'INVALID_AUTHENTICATION', 'Invalid authentication header.'),
  INVALID_GENERATION_ID: createMessage(400, 'INVALID_GENERATION_ID', 'Invalid generation id.'),
  INVALID_OPTIONS: createMessage(400, 'INVALID_OPTIONS', 'Invalid theme options. See \'validation\' for more.'),
  NO_AVAILABLE_WORKER: createMessage(503, 'NO_AVAILABLE_WORKER', 'There is no available worker for that theme.'),
  INVALID_TOKEN_ID: createMessage(400, 'INVALID_TOKEN_ID', 'Invalid token id.'),
  INVALID_TOKENS: createMessage(400, 'INVALID_TOKENS', 'Invalid authentication tokens.'),
  NOT_IMPLEMENTED: createMessage(501, 'NOT_IMPLEMENTED', 'This action wasn\'t implemented.')
}
