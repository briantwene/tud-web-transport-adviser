'use strict'

const logger = require('../../logger')
const BaseError = require('./BaseError')

//error handling middleware

const logError = (err) => {
  logger.error(err)
}

const logErrorMiddleware = (err, req, res, next) => {
  logError(err)
  next(err)
}

const returnError = (err, req, res, next) => {
  res.status(err.statusCode || 500).send(err.message)
}

const isOperationalError = (error) => {
  if (error instanceof BaseError) {
    return error.isOperational
  }
  return false
}

module.exports = {
  logError,
  logErrorMiddleware,
  returnError,
  isOperationalError,
}
