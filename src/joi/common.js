import { availablePeriods, availableTypes } from '../constants'
import * as Joi from 'joi'

export const typesResolverJoi = Joi.string()
  .valid(...availableTypes)
  .required()

export const periodResolverJoi = [
  Joi.string()
    .valid(...availablePeriods)
    .required(),
  Joi.array()
    .items(Joi.number())
    .length(2)
    .required()
]
