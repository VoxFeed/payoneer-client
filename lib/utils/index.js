'use strict';

var InvalidInputError = require('../errors').InvalidInputError;

var validateParams = function(required, config) {
  var invalid = [];

  if (!Array.isArray(required) || typeof config !== 'object') {
    throw new InvalidInputError('required and config must be objects');
  }
  required.forEach(function(key) {
    if (!config[key]) {
      invalid.push(key);
    }
  });

  if (invalid.length) {
    throw new InvalidInputError(invalid.join(', ') + ' config must be included');
  }
};

var valueToArray = function(value) {
  return [].concat(value);
};

module.exports = {
  valueToArray: valueToArray,
  validateParams: validateParams
};
