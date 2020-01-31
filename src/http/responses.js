module.exports = {
  ENDPOINT_NOT_FOUND: {
    error: {
      code: 'G#404#001',
      message: 'Endpoint not found.',
      error: 'ENDPOINT_NOT_FOUND'
    }
  },

  THEME_NOT_FOUND: {
    error: {
      code: 'G#404#002',
      message: 'Theme not found.',
      error: 'THEME_NOT_FOUND'
    }
  },

  MISSING_PARAMS: {
    error: {
      code: 'G#400#003',
      message: 'Missing parameters.',
      error: 'MISSING_PARAMS'
    }
  },

  MISSING_USER: {
    error: {
      code: 'G#400#004',
      message: 'Missing user.',
      error: 'MISSING_USER'
    }
  },

  INVALID_PARAMS: {
    error: {
      code: 'G#400#005',
      message: 'Invalid parameters.',
      error: 'INVALID_PARAMS'
    }
  },

  GENERIC_ERROR: {
    error: {
      code: 'G#500#006',
      message: 'An unexpected error ocorrured.',
      error: 'GENERIC_ERROR'
    }
  },

  METHOD_NOT_ALLOWED: {
    error: {
      code: 'G#405#007',
      message: 'Method not allowed.',
      error: 'METHOD_NOT_ALLOWED'
    }
  },

  USER_NOT_FOUND: {
    error: {
      code: 'G#404#008',
      message: 'User not found.',
      error: 'USER_NOT_FOUND'
    }
  }
}
