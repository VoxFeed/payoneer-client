'use strict';

var parseXML = require('xml2js').parseString;
var camelize = require('lodash/string/camelCase');
var InvalidInputError = require('./errors').InvalidInputError;

var validateParams = function(required, config) {
  var invalid = [];

  required.forEach(function(key) {
    if (!config[key]) {
      invalid.push(key);
    }
  });

  if (invalid.length) {
    throw new InvalidInputError(invalid.join(', ') + ' config must be included');
  }
};

var handleXmlRequest = function(callback, error, response, body) {
  var parseConfig = {
    explicitRoot: false,
    explicitArray: false,
    tagNameProcessors: [camelize]
  };

  if (error) return callback(error);

  parseXML(body, parseConfig, function(error, result) {
    if (error) return callback(error);

    callback(error, result);
  });
};

var valueToArray = function(value) {
  return [].concat(value);
};

module.exports = {
  valueToArray: valueToArray,
  handleXmlRequest: handleXmlRequest,
  validateParams: validateParams
};
