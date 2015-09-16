var events = require('events');
var inherits = require('util').inherits;
var bopper = require('./vendor/bopper');
var ditty = require('./vendor/ditty');
var expr = require('dilla-expressions');
var memoize = require('meemo');

var checkValid = require('./lib/checkValid');
var positionHelper = require('./lib/positionHelper');

var loadTime = new Date().valueOf();

var memoSpacer = '//';

function Dilla (audioContext, options) {

  if (!(this instanceof Dilla)){
    return new Dilla(audioContext, options);
  }

  if (!audioContext || typeof audioContext !== 'object' || typeof audioContext.createScriptProcessor !== 'function') {
    throw new Error('Invalid arguments: cannot init without AudioContext');
  }

  events.EventEmitter.call(this);

  options = options || {};

  this.context = audioContext;
  this.clock = bopper(this.context);
  this.scheduler = ditty();

  this.expressions = expr;
  this.expandNote = options.expandNote;

  this.upstartWait = options.upstartWait || 250;
  this.setTempo(options.tempo || 120);
  this.setBeatsPerBar(options.beatsPerBar || 4);
  this.setLoopLength(options.loopLength || 2);

  this._position = '0.0.00';

  this.clock.on('data', this.updatePositionFromClock.bind(this));
  this.clock.pipe(this.scheduler).on('data', this.emitStep.bind(this));

  this._keepAlive = this._keepAlive.bind(this);
}

inherits(Dilla, events.EventEmitter);
var proto = Dilla.prototype;

proto.updatePositionFromClock = function updatePositionFromClock (step) {
  var position = this.getPositionFromTime(step.time);
  if (this._position !== position) {
    this._position = position;
    this.emit('tick', { 'position': this._position, 'context': this.context });
  }
};

proto.getPositionFromTime = function getPositionFromTime (time) {
  var offset = (this.clock._state.cycleLength * this.clock._state.preCycle) * 1;
  var position = this.clock.getPositionAt(time - offset);
  return this.getPositionFromClockPosition(position);
};

proto.getPositionFromClockPosition = function getPositionFromClockPosition (position) {
  checkValid.number('clockPosition', position);
  if (position < 0) {
    return '0.0.00';
  }
  var beatsPerLoop = this._loopLength * this._beatsPerBar;
  var loops = Math.floor(position / beatsPerLoop) || 0;
  position = position - (loops * beatsPerLoop);
  var bars = Math.floor(position / this._beatsPerBar);
  position = position - (bars * this._beatsPerBar);
  var beats = Math.floor(position);
  position = position - beats;
  var ticks = Math.floor(position * 96) + 1;
  if (ticks < 10) {
    ticks = '0' + ticks;
  }
  return (bars + 1) + '.' + (beats + 1) + '.' + ticks;
};

proto.getClockPositionFromPosition = memoize(function getClockPositionFromPosition (position) {
  var parts = position.split('.');
  var bars = parseInt(parts[0], 10) - 1;
  var beats = parseInt(parts[1], 10) - 1;
  var ticks = parseInt(parts[2], 10) - 1;
  return (bars * this._beatsPerBar) + beats + (ticks / 96);
});

proto.getPositionWithOffset = memoize(function getPositionWithOffset (position, offset) {
  if (!checkValid.positionString(position)) {
    throw new Error('Invalid argument: position is not a valid position string');
  }
  if (typeof offset !== 'number' || isNaN(offset) || offset % 1 !== 0) {
    throw new Error('Invalid argument: offset is not a valid number');
  }
  if (!offset) {
    return position;
  }
  var clockPosition = this.getClockPositionFromPosition(position);
  var clockOffset = offset / 96;
  return this.getPositionFromClockPosition(clockPosition + clockOffset);
}, function (position, offset) {
  return position + memoSpacer + offset;
});

proto.getDurationFromTicks = function getDurationFromTicks (ticks) {
  checkValid.positiveNumber('ticks', ticks);
  return (1 / 96) * ticks;
};

proto.emitStep = function emitStep (step) {
  var offset = step.offset = (this.clock._state.cycleLength * this.clock._state.preCycle) * 1;
  var note = step.args;
  step.time = step.time + offset;
  step.clockPosition = step.position;
  step.position = step.event === 'start' ? note.position : note.duration ?  this.getPositionWithOffset(note.position, note.duration) : note.position;
  if (step.event === 'stop'  && step.position === note.position) {
    return;
  }
  step.context = this.context;
  this.emit('step', step);
};

proto.notesForSet = memoize(function notesForSet (id, notes, beatsPerBar, loopLength) {

  var self = this;
  notes.forEach(function (note, index) {
    if (!Array.isArray(note) && typeof note === 'object' && !!note.position) {
      notes[index] = [note.position, note];
    }
  });

  notes = self.expressions(notes, {
    'beatsPerBar': beatsPerBar,
    'barsPerLoop': loopLength
  });

  var filtered = false;

  notes.forEach(function (note, index) {
    if (positionHelper.isPositionWithinBounds(note[0], loopLength, beatsPerBar)) {
      if (self.expandNote) {
        note = self.expandNote(note);
      }
      var normal = positionHelper.normalizeNote(note);
      notes[index] = [self.getClockPositionFromPosition(normal.position), self.getDurationFromTicks(normal.duration || 0), null, null, normal];
    }
    else {
      notes[index] = null;
      filtered = true;
    }
  });

  if (filtered) {
    return notes.filter(function (note) { return !!note; });
  }

  return notes;
}, function (id, notes, beatsPerBar, loopLength) {
  return id + memoSpacer + JSON.stringify(notes) + memoSpacer + beatsPerBar + memoSpacer + loopLength;
});

proto.set = function set (id, notes) {
  var self = this;
  if (typeof id !== 'string') {
    throw new Error('Invalid argument: id is not a valid string');
  }
  if (!notes || !Array.isArray(notes)) {
    throw new Error('Invalid argument: notes is not a valid array');
  }

  this.scheduler.set(id, this.notesForSet(id, notes, this.beatsPerBar(), this.loopLength()), this.beatsPerBar() * this.loopLength());
};

proto.get = function get (id) {
  if (typeof id !== 'string') {
    throw new Error('Invalid argument: id is not a valid string');
  }
  return (this.scheduler.get(id) || []).map(function (note) {
    return note[4];
  });
};

proto.channels = function channels () {
  return this.scheduler.getIds();
};

proto.clear = function clear (id) {
  var self = this;
  if (id) {
    if (typeof id !== 'string') {
      throw new Error('Invalid argument: id is not a valid string');
    }
    this.set(id, []);
  }
  else {
    this.scheduler.getIds().forEach(function (id) {
      self.clear(id);
    });
  }
};

proto._keepAlive = function _keepAlive () {
  if (this.clock._state.playing) {
    window.__lastDillaPosition = this._position;
    setTimeout(window.requestAnimationFrame.bind(null, this._keepAlive), 100);
  }
};

proto.start = function start () {
  var now = new Date().valueOf();
  var waited = now - loadTime;
  if (waited < this.upstartWait) {
    return setTimeout(start.bind(this), this.upstartWait - waited);
  }

  if (!this.clock._state.playing) {
    this.clock.start();
    this._keepAlive();
    this.emit('playing');
  }
};

proto.pause = function pause () {
  if (this.clock._state.playing) {
    this.clock.stop();
    this.emit('paused');
  }
};

proto.stop = function stop () {
  if (this.clock._state.playing) {
    this.clock.stop();
    this.emit('paused');
    this.clock.setPosition(0);
    this._position = '0.0.00';
  }
};

proto.position = function position () {
  return this._position;
};

proto.setPosition = function setPosition (position) {
  if (!positionHelper.isPositionWithinBounds(position, this.loopLength(), this.beatsPerBar())) {
    throw new Error('Invalid argument: position is not valid');
  }
  this._position = position;
  this.clock.setPosition(this.getClockPositionFromPosition(position));
};

proto.tempo = function tempo () {
  return this.clock.getTempo();
};

proto.setTempo = function setTempo (tempo) {
  if (typeof tempo !== 'number' || tempo < 0 || isNaN(tempo)) {
    throw new Error('Invalid argument: tempo is not a valid number');
  }
  this.clock.setTempo(tempo);
};

proto.beatsPerBar = function beatsPerBar () {
  return this._beatsPerBar;
};

proto.setBeatsPerBar = function setBeatsPerBar (beats) {
  checkValid.positiveNumber('beats', beats);
  this._beatsPerBar = beats;
};

proto.loopLength = function loopLength () {
  return this._loopLength;
};

proto.setLoopLength = function setLoopLength (bars) {
  checkValid.positiveNumber('bars', bars);
  this._loopLength = bars;
};

module.exports = Dilla;
