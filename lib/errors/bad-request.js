var util = require('util');

function BadRequestError(message) {
  this.name = 'BAD_REQUEST';
  this.message = message;
  Error.captureStackTrace(this, BadRequestError);
};

util.inherits(BadRequestError, Error);

module.exports = BadRequestError;
