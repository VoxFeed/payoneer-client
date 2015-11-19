function InvalidInputError(message) {
  this.name = 'InvalidInputError';
  this.message = message || 'Invalid Input Data';
  this.stack = (new Error()).stack;
};

InvalidInputError.prototype = Object.create(Error.prototype);
InvalidInputError.prototype.constructor = InvalidInputError;

module.exports = InvalidInputError;
