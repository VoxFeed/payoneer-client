'user strict';

var request = require('request');
var camelize = require('lodash/string/camelCase');
var parseXML = require('xml2js').parseString;
var PayoneerError = require('./errors/payoneer-error');

var endpoints = require('./endpoints');
var util = require('./utils');

var SANDBOX_URI = 'https://api.sandbox.payoneer.com/Payouts/HttpApi/API.aspx';
var PRODUCTION_URI = 'https://api.payoneer.com/Payouts/HttpApi/API.aspx';

var payoneerValidator = function(endpoint, options) {
  var required = endpoint.requiredKeys;

  return util.validateParams(required, options);
};

var handlePayoneerResponse = function(callback, error, response, body) {
  var parseConfig = {
    explicitRoot: false,
    explicitArray: false,
    tagNameProcessors: [camelize]
  };

  if (error) return callback(error);

  parseXML(body, parseConfig, function(error, result) {
    if (result.code && result.code !== '000') {
      error = new PayoneerError({
        code: result.code,
        description: result.description
      });
    }
    if (error) return callback(error);

    callback(error, result);
  });
};

var handlePaymentResponse = function(object) {
  Object.keys(object).forEach(function(key) {
    var payee = object[key].payee;
    object[key] = util.valueToArray(payee);

    object[key].forEach(function(element) {
      element.payments = util.valueToArray(element.payments.payment);
    });
  });

  return object;
};

function Payoneer(config) {
  var requiredKeys = [
    'username',
    'password',
    'partnerId'
  ];

  util.validateParams(requiredKeys, config);

  this.uri = config.sandbox ? SANDBOX_URI : PRODUCTION_URI;

  this.credentials = {
    p1: config.username,
    p2: config.password,
    p3: config.partnerId
  };

  this.config = config;
};

Payoneer.prototype.request = function(data, callback) {
  data = data || {};

  request({
    method: 'POST',
    uri: this.uri,
    qs: this.buildQuery(data)
  }, handlePayoneerResponse.bind(undefined, callback));
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

Payoneer.prototype.getAuthRedirectURL = function(options, callback) {
  var endpoint = endpoints.authUrl;
  var data;

  try {
    payoneerValidator(endpoint, options);
  } catch (error) {
    callback(error);
  }

  data = {
    mname: endpoint.name,
    p4: options.payeeId,
    p5: options.sessionId,
    p6: options.redirectUrl || options.redirectUri,
    p8: options.redirectTime,
    p9: options.testAccount ? 'True' : 'False',
    p10: 'True',
    p11: options.allowedMethods,
    p12: options.registrationMode
  };

  this.request(data, callback);
};

Payoneer.prototype.requestPayment = function(options, callback) {
  var endpoint = endpoints.requestPayment;
  var data;

  try {
    payoneerValidator(endpoint, options);
  } catch (error) {
    callback(error);
  }

  data = {
    mname: endpoint.name,
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
  var endpoint = endpoints.getUnclaimedPayments;
  var data = {
    mname: endpoint.name
  };

  this.request(data, callback);
};

Payoneer.prototype.cancelPayment = function(options, callback) {
  var endpoint = endpoints.cancelPayment;
  var data;

  try {
    payoneerValidator(endpoint, options);
  } catch (error) {
    callback(error);
  }

  data = {
    mname: endpoint.name,
    p4: options.paymentId
  };

  this.request(data, callback);
};

Payoneer.prototype.getPaymentStatus = function(options, callback) {
  var endpoint = endpoints.getPaymentStatus;
  var data;

  try {
    payoneerValidator(endpoint, options);
  } catch (error) {
    callback(error);
  }

  data = {
    mname: endpoint.name,
    p4: options.paymentId
  };

  this.request(data, callback);
};

Payoneer.prototype.getPayeePayments = function(options, callback) {
  var endpoint = endpoints.getPayeePayments;
  var data;

  try {
    payoneerValidator(endpoint, options);
  } catch (error) {
    callback(error);
  }

  data = {
    mname: endpoint.name,
    p4: options.payeeId
  };

  this.request(data, function(error, data) {
    callback(error, handlePaymentResponse(data));
  });
};

Payoneer.prototype.getPayeesReport = function(callback) {
  var endpoint = endpoints.getPayeesReport;
  var data = {
    mname: endpoint.name
  };

  this.request(data, function(error, data) {
    callback(error, handlePaymentResponse(data));
  });
};

Payoneer.prototype.getPayee = function(options, callback) {
  var endpoint = endpoints.getPayee;
  var data;

  try {
    payoneerValidator(endpoint, options);
  } catch (error) {
    callback(error);
  }

  data = {
    mname: endpoint.name,
    p4: options.payeeId
  };

  this.request(data, callback);
};

Payoneer.prototype.updatePayeeId = function(options, callback) {
  var endpoint = endpoints.updatePayeeId;
  var data;

  try {
    payoneerValidator(endpoint, options);
  } catch (error) {
    callback(error);
  }
  data = {
    mname: endpoint.name,
    p4: options.oldPayeeId,
    p5: options.newPayeeId
  };

  this.request(data, callback);
};

Payoneer.prototype.getBalance = function(callback) {
  var endpoint = endpoints.getBalance;
  var data = {
    mname: endpoint.name
  };

  this.request(data, callback);
};

Payoneer.prototype.echo = function(callback) {
  var data = {
    mname: endpoints.echo.name
  };

  this.request(data, callback);
};

Payoneer.prototype.getVersion = function(callback) {
  var data = {
    mname: endpoints.getVersion.name
  };

  this.request(data, callback);
};

Payoneer.prototype.buildQuery = function(data) {
  return Object.assign(this.credentials, data);
};

module.exports = Payoneer;
