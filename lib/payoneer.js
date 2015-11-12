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

var handleRequest = function(callback, error, response, body) {
  var parseConfig = {
    explicitArray: false,
    explicitRoot: false
  };

  if (error) return callback(error);
  parseXML(body, parseConfig, function(error, result) {
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

Payoneer.prototype.request = function(method, data, callback) {
  data = data || {};

  request({
    method: method,
    uri: this.uri,
    qs: this.buildQuery(data)
  }, handleRequest.bind(this, callback));
};

Payoneer.prototype.echo = function(callback) {
  this.request('POST', { mname: ECHO }, callback);
};

Payoneer.prototype.getToken = function(payeeID, callback) {
  var data = {
    mname: GET_TOKEN,
    p4: payeeID,
    p9: 'True',
    p6: 'example.com'
  };

  this.request('POST', data, callback);
};

Payoneer.prototype.getVersion = function(callback) {
  this.request('POST', { mname: GET_VERSION }, callback);
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
  // var data = {
  //   mname: 'PerformPayoutPayment',
  //   p4: this.config.programID,
  //   p5: options.paymentID,
  //   p6: options.payeeID,
  //   p7: options.amount,
  //   p8: options.description,
  //   p9: options.date
  // };

  this.request('POST', data, callback);
};

// Payoneer.prototype.translateStatusCode = function(code) {
//   return {
//     code: codes[code]
//   };
// };
//

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
