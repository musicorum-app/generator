import { periodResolverJoi, typesResolverJoi } from './common'

const Joi = require('joi')

export const gridThemeJoi = Joi.object({
  rows: Joi.number()
    .min(3)
    .max(20)
    .required(),

  columns: Joi.number()
    .min(3)
    .max(20)
    .required(),

  show_names: Joi.bool()
    .required(),

  show_playcount: Joi.bool()
    .required(),

  period: periodResolverJoi,

  type: typesResolverJoi,

  style: Joi.string()
    .valid(...['DEFAULT', 'CAPTION', 'SHADOW'])
    .required()
})
