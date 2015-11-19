'user strict';

var request = require('request');
var endpoints = require('./endpoints');
var util = require('./utils');

var SANDBOX_URI = 'https://api.sandbox.payoneer.com/Payouts/HttpApi/API.aspx';
var PRODUCTION_URI = 'https://api.payoneer.com/Payouts/HttpApi/API.aspx';

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

var Payoneer = function(config) {
  var requiredKeys = [
    'username',
    'password',
    'partnerId'
  ];

  if (typeof config !== 'object') {
    throw new Error('config must be an object');
  }

  this.uri = config.sandbox ? SANDBOX_URI : PRODUCTION_URI;

  this.credentials = {
    p1: config.username,
    p2: config.password,
    p3: config.partnerId
  };

  this.config = config;

  util.validateParams(requiredKeys, config);
};

Payoneer.prototype.request = function(data, callback) {
  data = data || {};

  request({
    method: 'POST',
    uri: this.uri,
    qs: this.buildQuery(data)
  }, util.handleXmlRequest.bind(this, callback));
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
  var data;

  if (!options.payeeId) {
    throw new Error('payeeId is required');
  }

  data = {
    mname: endpoints.authUrl,
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
  var data;

  var requiredKeys = [
    'programId',
    'payeeId',
    'amount',
    'description',
    'date'
  ];

  try {
    util.validateParams(requiredKeys, options);
  } catch (error) {
    return callback(error, error.message);
  }

  data = {
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
  var data;

  if (!paymentId) {
    throw new Error('paymentId is required');
  }

  data = {
    mname: endpoints.cancelPayment,
    p4: paymentId
  };

  this.request(data, callback);
};

Payoneer.prototype.getPaymentStatus = function(paymentId, callback) {
  var data;

  if (!paymentId) {
    throw new Error('paymentId is required');
  }

  data = {
    mname: endpoints.getPaymentStatus,
    p4: paymentId
  };

  this.request(data, callback);
};

Payoneer.prototype.getPayeePayments = function(payeeId, callback) {
  var data;

  if (!payeeId) {
    throw new Error('payeeId is required');
  }

  data = {
    mname: endpoints.getPayeePayments,
    p4: payeeId
  };

  this.request(data, function(error, data) {
    callback(error, handlePaymentResponse(data));
  });
};

Payoneer.prototype.getPayeesReport = function(callback) {
  var data = {
    mname: endpoints.getPayeesReport
  };

  this.request(data, function(error, data) {
    callback(error, handlePaymentResponse(data));
  });
};

Payoneer.prototype.getPayee = function(payeeId, callback) {
  var data;

  if (!payeeId) {
    throw new Error('payeeId is required');
  }

  data = {
    mname: endpoints.getPayee,
    p4: payeeId
  };

  this.request(data, callback);
};

Payoneer.prototype.updatePayeeId = function(oldId, newId, callback) {
  var data;

  if (!oldId || !newId) {
    throw new Error('oldId and newId are required');
  }

  data = {
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

module.exports = Payoneer;
