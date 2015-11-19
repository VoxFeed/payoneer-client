'user strict';

var request = require('request');
var camelize = require('lodash/string/camelCase');
var parseXML = require('xml2js').parseString;
var endpoints = require('./endpoints');

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
  if (response.request.uri.query.indexOf(endpoints.authUrl) > -1) callback(error, body);

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

  this.uri = config.sandbox ?
    'https://api.sandbox.payoneer.com/Payouts/HttpApi/API.aspx' :
    'https://api.payoneer.com/Payouts/HttpApi/API.aspx';

  this.credentials = {
    p1: config.username,
    p2: config.password,
    p3: config.partnerId
  };

  this.config = config;

  this.validateConfig(config);
};

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
    mname: endpoints.authUrl,
    p4: payeeId,
    // Allows us to create a Payee in sandbox, ignored in production anyway
    p9: 'True'
  };

  this.request(data, callback);
};

Payoneer.prototype.requestPayment = function(options, callback) {
  var data = {
    mname: endpoints.requestPayment,
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
    mname: endpoints.getUnclaimedPayments
  };

  this.request(data, callback);
};

Payoneer.prototype.cancelPayment = function(paymentId, callback) {
  var data = {
    mname: endpoints.cancelPayment,
    p4: paymentId
  };

  this.request(data, callback);
};

Payoneer.prototype.getPaymentStatus = function(paymentId, callback) {
  var data = {
    mname: endpoints.getPaymentStatus,
    p4: paymentId
  };

  this.request(data, callback);
};

Payoneer.prototype.getPayeePayments = function(payeeId, callback) {
  var data = {
    mname: endpoints.getPayeePayments,
    p4: payeeId
  };

  this.request(data, function(error, data) {
    callback(error, handlePayment(data));
  });
};

Payoneer.prototype.getPayeesReport = function(callback) {
  var data = {
    mname: endpoints.getPayeesReport
  };

  this.request(data, function(error, data) {
    callback(error, handlePayment(data));
  });
};

Payoneer.prototype.getPayee = function(payeeId, callback) {
  var data = {
    mname: endpoints.getPayee,
    p4: payeeId
  };

  this.request(data, callback);
};

Payoneer.prototype.updatePayeeId = function(oldId, newId, callback) {
  var data = {
    mname: endpoints.updatePayeeId,
    p4: oldId,
    p5: newId
  };

  this.request(data, callback);
};

Payoneer.prototype.getBalance = function(callback) {
  var data = {
    mname: endpoints.getBalance
  };

  this.request(data, callback);
};
// Payoneer.prototype.translateStatusCode = function(code) {
//   return {
//     code: codes[code]
//   };
// };

Payoneer.prototype.echo = function(callback) {
  var data = {
    mname: endpoints.echo
  };

  this.request(data, callback);
};

Payoneer.prototype.getVersion = function(callback) {
  var data = {
    mname: endpoints.getVersion
  };

  this.request(data, callback);
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
