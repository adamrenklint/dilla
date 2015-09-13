var checkValid = require('./checkValid');
var memoize = require('meemo');

var positionHelper = {

  'normalizeNote': memoize(function nomalizeNote (params) {
    if (!params || !Array.isArray(params)) {
      throw new Error('Invalid argument: note params is not valid array');
    }
    var note = typeof params[1] === 'object' ? params[1] : typeof params[0] === 'object' ? params[0] : { position: '' };
    var position = typeof params[0] === 'string' && checkValid.positionString(params[0]) ? params[0] : typeof note.position === 'string' && checkValid.positionString(note.position) ? note.position : null;
    if (!position) {
      throw new Error('Invalid argument: position is not valid');
    }
    note.position = position;
    return note;
  }, function (params) { return JSON.stringify(params); }),

  'isPositionWithinBounds': memoize(function isPositionWithinBounds (position, barsPerLoop, beatsPerBar) {
    if (!checkValid.positionString(position)) {
      return false;
    }

    var fragments = position.split('.');
    var bars = parseInt(fragments[0], 10) - 1;
    var beats = parseInt(fragments[1], 10) - 1;
    var ticks = parseInt(fragments[2], 10) - 1;

    if (ticks < 0 || beats < 0 || bars < 0 || ticks >= 96 || beats >= beatsPerBar || bars >= barsPerLoop) {
      return false;
    }

    return true;
  }, function (position, barsPerLoop, beatsPerBar) {
    return position + '//' + barsPerLoop + '//' + beatsPerBar;
  })
};

module.exports = positionHelper;
