function PayoneerError(errorObject) {
  this.name = 'PayoneerError';
  this.originalError = errorObject;
  this.message = 'Payoneer Error, read the Payoneer documentation for details';
  this.stack = (new Error()).stack;
};

PayoneerError.prototype = Object.create(Error.prototype);
PayoneerError.prototype.constructor = PayoneerError;

module.exports = PayoneerError;
