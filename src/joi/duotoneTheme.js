import Joi from 'joi'
import { periodResolverJoi, typesResolverJoi } from './common'
import { loadConfiguration } from '../utils'

const config = loadConfiguration().themes.duotone

export const duotoneThemeJoi = Joi.object({
  period: periodResolverJoi,

  type: typesResolverJoi,

  palette: Joi.string()
    .valid(...Object.keys(config.palettes))
    .required()
})
