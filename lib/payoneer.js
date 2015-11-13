'user strict';

var request = require('request');
var parseXML = require('xml2js').parseString;

var ECHO = 'Echo';
var GET_TOKEN = 'GetToken';
var GET_VERSION = 'GetVersion';

var requiredKeys = [
  'username',
  'password',
  'partnerID',
  'programID'
];

// var codes = {
//   '000': 200,
//   '006': 500,
//   '000FFF0': 403,
//   'A00B556F': 401,
//   '4B501FF5': 404
// };

var handleRequest = function(callback, forceArray, error, response, body) {
  var parseConfig = {
    explicitArray: forceArray,
    explicitRoot: false
  };

  if (error) return callback(error);

  parseXML(body, parseConfig, function(error, result) {
    // TODO bad way of handling the case when the response is not an XML
    if (error) {
      error = null;
      result = body;
    }
    callback(error, result);
  });
};

var Payoneer = function(config) {
  if (typeof config !== 'object') {
    throw new Error('config must be an object');
  }

  this.uri = config.uri;

  this.credentials = {
    p1: config.username,
    p2: config.password,
    p3: config.partnerID
  };

  this.config = config;

  this.validateConfig(config);
};

// TODO Gotta find a better way to send configuration to the request
// TODO We need a few conditions to force Arrays in certain fields
Payoneer.prototype.request = function(method, data, forceArray, callback) {
  data = data || {};

  request({
    method: method,
    uri: this.uri,
    qs: this.buildQuery(data)
  }, handleRequest.bind(this, callback, forceArray));
};

Payoneer.prototype.getAPIStatus = function(callback) {
  this.echo(function(error, status) {
    if (error) return callback(error);
    this.getVersion(function(error, version) {
      if (error) return callback(error);
      callback(null, Object.assign(status, version));
    });
  }.bind(this));
};

Payoneer.prototype.getAuthRedirectURL = function(payeeID, callback) {
  var data = {
    mname: GET_TOKEN,
    p4: payeeID,
    // Allows us to create a Payee in sandbox, ignored in production anyway
    p9: 'True'
  };

  this.request('POST', data, false, callback);
};

Payoneer.prototype.requestPayment = function(options, callback) {
  var data = {
    mname: 'PerformPayoutPayment',
    p4: this.config.programID,
    p5: options.paymentID,
    p6: options.payeeID,
    p7: options.amount,
    p8: options.description,
    p9: options.date
  };

  this.request('POST', data, false, callback);
};

Payoneer.prototype.getUnclaimedPayments = function(callback) {
  var data = {
    mname: 'GetUnclaimedPaymentsXML'
  };

  this.request('POST', data, true, callback);
};

Payoneer.prototype.getPayee = function(payeeID, callback) {
  var data = {
    mname: 'GetPayeeDetails'
  };

  this.request('POST', data, true, callback);
};
// Payoneer.prototype.translateStatusCode = function(code) {
//   return {
//     code: codes[code]
//   };
// };

Payoneer.prototype.echo = function(callback) {
  this.request('POST', { mname: ECHO }, false, callback);
};

Payoneer.prototype.getVersion = function(callback) {
  this.request('POST', { mname: GET_VERSION }, false, callback);
};

Payoneer.prototype.buildQuery = function(data) {
  return Object.assign(this.credentials, data);
};

Payoneer.prototype.validateConfig = function(config) {
  requiredKeys.forEach(function(key) {
    if (!config[key]) {
      throw new Error(key + ' config must be included');
    }
  });
};

module.exports = Payoneer;
