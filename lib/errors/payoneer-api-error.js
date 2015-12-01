var util = require('util');

function PayoneerAPIError(message) {
  this.name = 'PAYONEER_API_ERROR';
  this.message = message;
  Error.captureStackTrace(this, PayoneerAPIError);
};

util.inherits(PayoneerAPIError, Error);

module.exports = PayoneerAPIError;
