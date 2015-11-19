'user strict';

var request = require('request');
var camelize = require('lodash/string/camelCase');
var parseXML = require('xml2js').parseString;

var ECHO = 'Echo';
var GET_TOKEN = 'GetToken';
var GET_VERSION = 'GetVersion';

var requiredKeys = [
  'username',
  'password',
  'partnerId'
];

var handleRequest = function(callback, error, response, body) {
  var parseConfig = {
    explicitRoot: false,
    explicitArray: false,
    tagNameProcessors: [camelize]
  };

  if (error) return callback(error);
  if (response.request.uri.query.indexOf(GET_TOKEN) > -1) callback(error, body);

  parseXML(body, parseConfig, function(error, result) {
    if (error) return callback(error);

    callback(error, result);
  });
};

var arrayify = function(value) {
  return [].concat(value);
};

var handlePayment = function(object) {
  Object.keys(object).forEach(function(key) {
    var payee = object[key].payee;
    object[key] = arrayify(payee);

    object[key].forEach(function(element) {
      element.payments = arrayify(element.payments.payment);
    });
  });

  return object;
};

var Payoneer = function(config) {
  if (typeof config !== 'object') {
    throw new Error('config must be an object');
  }

  this.uri = config.uri;

  this.credentials = {
    p1: config.username,
    p2: config.password,
    p3: config.partnerId
  };

  this.config = config;

  this.validateConfig(config);
};

// TODO Gotta find a better way to send configuration to the request
// TODO We need a few conditions to force Arrays in certain fields
Payoneer.prototype.request = function(data, callback) {
  data = data || {};

  request({
    method: 'POST',
    uri: this.uri,
    qs: this.buildQuery(data)
  }, handleRequest.bind(this, callback));
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

Payoneer.prototype.getAuthRedirectURL = function(payeeId, callback) {
  var data = {
    mname: GET_TOKEN,
    p4: payeeId,
    // Allows us to create a Payee in sandbox, ignored in production anyway
    p9: 'True'
  };

  this.request(data, callback);
};

Payoneer.prototype.requestPayment = function(options, callback) {
  var data = {
    mname: 'PerformPayoutPayment',
    p4: options.programId,
    p5: options.paymentId,
    p6: options.payeeId,
    p7: options.amount,
    p8: options.description,
    p9: options.date
  };

  this.request(data, callback);
};

Payoneer.prototype.getUnclaimedPayments = function(callback) {
  var data = {
    mname: 'GetUnclaimedPaymentsXML'
  };

  this.request(data, callback);
};

Payoneer.prototype.cancelPayment = function(paymentId, callback) {
  var data = {
    mname: 'CancelPayment',
    p4: paymentId
  };

  this.request(data, callback);
};

Payoneer.prototype.getPaymentStatus = function(paymentId, callback) {
  var data = {
    mname: 'GetPaymentStatus',
    p4: paymentId
  };

  this.request(data, callback);
};

Payoneer.prototype.getPayeePayments = function(payeeId, callback) {
  var data = {
    mname: 'GetSinglePayeeReport',
    p4: payeeId
  };

  this.request(data, function(error, data) {
    callback(error, handlePayment(data));
  });
};

Payoneer.prototype.getPayeesReport = function(callback) {
  var data = {
    mname: 'GetPayeesReport'
  };

  this.request(data, function(error, data) {
    callback(error, handlePayment(data));
  });
};

Payoneer.prototype.getPayee = function(payeeId, callback) {
  var data = {
    mname: 'GetPayeeDetails',
    p4: payeeId
  };

  this.request(data, callback);
};

Payoneer.prototype.updatePayeeId = function(oldId, newId, callback) {
  var data = {
    mname: 'ChangePayeeID',
    p4: oldId,
    p5: newId
  };

  this.request(data, callback);
};

Payoneer.prototype.getBalance = function(callback) {
  var data = {
    mname: 'GetAccountDetails'
  };

  this.request(data, callback);
};
// Payoneer.prototype.translateStatusCode = function(code) {
//   return {
//     code: codes[code]
//   };
// };

Payoneer.prototype.echo = function(callback) {
  this.request({ mname: ECHO }, callback);
};

Payoneer.prototype.getVersion = function(callback) {
  this.request({ mname: GET_VERSION }, callback);
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
