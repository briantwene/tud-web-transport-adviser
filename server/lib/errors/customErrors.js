const BaseError = require("./BaseError");
const httpStatusCodes = require("./httpStatusCode");

class HTTP400Error extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.BAD_REQUEST,
    description = "BAD_REQUEST",
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class HTTP404Error extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.NOT_FOUND,
    description = "NOT_FOUND",
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

class HTTP500Error extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.INTERNAL_SERVER,
    description = "INTERNAL_SERVER",
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = { HTTP400Error, HTTP404Error, HTTP500Error };
