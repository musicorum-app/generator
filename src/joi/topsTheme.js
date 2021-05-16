import Joi from 'joi'
import { periodResolverJoi, typesResolverJoi } from './common'

export const topsThemeJoi = Joi.object({
  period: periodResolverJoi,

  mod1: typesResolverJoi,

  mod2: typesResolverJoi
})
