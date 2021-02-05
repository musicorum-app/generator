import { availableThemes } from '../constants'
import { themeJoi } from './themesJoi'

const Joi = require('joi')

const themeOptionsJoi = (value, helpers) => {
  const { theme } = helpers.state.ancestors[0]
  Joi.assert(value, themeJoi[theme])

  return value
}

export const generateEndpointJoi = Joi.object({
  user: Joi.string()
    .min(2)
    .max(15)
    .required(),

  theme: Joi.string()
    .valid(...availableThemes)
    .required(),

  story: Joi.bool()
    .required(),

  language: Joi.string(),

  hide_username: Joi.bool()
    .required(),

  options: Joi.object()
    .custom(themeOptionsJoi)
})
