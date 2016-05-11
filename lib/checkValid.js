var checkValid = {

  'number': function checkValidNumber (name, value) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Invalid argument: ' + name + ' is not a valid number');
    }
  },

  'positiveNumber': function checkValidPositiveNumber (name, value) {
    checkValid.number(name, value);
    if (value < 0) {
      throw new Error('Invalid argument: ' + name + ' is not a valid positive number');
    }
  },

  'positionString': function checkValidPositionString (position) {
    return typeof position === 'string' && !!position.match(/\d+\.\d+\.\d+/);
  }
};

module.exports = checkValid;
