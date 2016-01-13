'use strict';

var PayoneerError = require('./payoneer-error');
var InvalidInputError = require('./invalid-input-error');
var BadRequestError = require('./bad-request');
var PayoneerAPIError = require('./payoneer-api-error');

var makeError = function(result) {
  var code = result.code || result.result || result.status;
  switch (code) {
    case '001':
      return new BadRequestError(result.description);
    case '005':
    case '006':
    case '008':
      return new PayoneerAPIError(result.description);
    default:
      return new PayoneerError({
        code: result.code,
        description: result.description
      });
  }
};

module.exports = {
  InvalidInputError: InvalidInputError,
  PayoneerError: PayoneerError,
  makeAPIError: makeError
};
