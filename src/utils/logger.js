import winston from 'winston'

const setupLogger = () => {
  const logger = winston.createLogger()
  const level = process.env.LOGGING_LEVEL || 'silly'

  if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.Console({ level }))
  } else {
    const getLabel = i => i ? ` [${i}]` : ''
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.level} ${getLabel(info.label)}| ${info.message}`
        )
      ),
      level
    }))
  }

  return logger
}

export default setupLogger
