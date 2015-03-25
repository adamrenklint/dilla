var checkValid = {

  'number': function (name, value) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Invalid argument: ' + name + ' is not a valid number');
    }
  },

  'positiveNumber': function (name, value) {
    checkValid.number(name, value);
    if (value < 0) {
      throw new Error('Invalid argument: ' + name + ' is not a valid positive number');
    }
  },

  'positionString': function (position) {
    return typeof position === 'string' && !!position.match(/\d\.\d\.\d+/);
  }
};

module.exports = checkValid;
