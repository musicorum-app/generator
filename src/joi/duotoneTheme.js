import Joi from 'joi'
import { periodResolverJoi, typesResolverJoi } from './common'

export const duotoneThemeJoi = Joi.object({
  period: periodResolverJoi,

  type: typesResolverJoi,

  palette: Joi.string()
    .valid(...[
      'PURPLISH',
      'NATURAL',
      'DIVERGENT',
      'SUN',
      'YELLISH',
      'HORROR',
      'SEA',
      'REEN',
      'NEON'
    ])
    .required()
})
