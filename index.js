var events = require('events');
var inherits = require('util').inherits;
var bopper = require('bopper');
var ditty = require('ditty');
var expr = require('dilla-expressions');

var loadTime = new Date().valueOf();

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

  this.upstartWait = options.upstartWait || 250;
  this.setTempo(options.tempo || 120);
  this.setBeatsPerBar(options.beatsPerBar || 4);
  this.setLoopLength(options.loopLength || 2);

  this._position = '0.0.00';

  this.clock.on('data', this.updatePositionFromClock.bind(this));
  this.clock.pipe(this.scheduler).on('data', this.emitStep.bind(this));
}

inherits(Dilla, events.EventEmitter);
var proto = Dilla.prototype;

proto.updatePositionFromClock = function updatePositionFromClock (step) {
  var position = this.getPositionFromTime(step.time);
  if (this._position !== position) {
    this._position = position;
    this.emit('tick', { 'position': this._position, 'context': this.context });
  }
}

proto.getPositionFromTime = function getPositionFromTime (time) {
  var offset = (this.clock._state.cycleLength * this.clock._state.preCycle) * 1;
  var position = this.clock.getPositionAt(time - offset);
  return this.getPositionFromClockPosition(position);
}

proto.getPositionFromClockPosition = function getPositionFromClockPosition (position) {
  if (typeof position !== 'number' || isNaN(position)) throw new Error('Invalid argument: clockPosition is not a valid number');
  if (position < 0) return '0.0.00';
  var beatsPerLoop = this._loopLength * this._beatsPerBar;
  var loops = Math.floor(position / beatsPerLoop) || 0;
  position = position - (loops * beatsPerLoop);
  var bars = Math.floor(position / this._beatsPerBar);
  position = position - (bars * this._beatsPerBar);
  var beats = Math.floor(position);
  position = position - beats;
  var ticks = Math.floor(position * 96) + 1;
  if (ticks < 10) ticks = '0' + ticks;
  return (bars + 1) + '.' + (beats + 1) + '.' + ticks;
}

proto.getClockPositionFromPosition = function getClockPositionFromPosition (position) {
  var parts = position.split('.');
  var bars = parseInt(parts[0], 10) - 1;
  var beats = parseInt(parts[1], 10) - 1;
  var ticks = parseInt(parts[2], 10) - 1;
  return (bars * this._beatsPerBar) + beats + (ticks / 96);
}

proto.getPositionWithOffset = function getPositionWithOffset (position, offset) {
  if (!this.isValidPositionString(position)) throw new Error('Invalid argument: position is not a valid position string');
  if (typeof offset !== 'number' || isNaN(offset) || offset % 1 !== 0) throw new Error('Invalid argument: offset is not a valid number');
  if (!offset) return position;
  var clockPosition = this.getClockPositionFromPosition(position);
  var clockOffset = offset / 96;
  return this.getPositionFromClockPosition(clockPosition + clockOffset);
}

proto.getDurationFromTicks = function getDurationFromTicks (ticks) {
  if (typeof ticks !== 'number' || ticks < 0 || isNaN(ticks)) throw new Error('Invalid argument: ticks is not a valid number');
  return (1 / 96) * ticks;
}

proto.emitStep = function emitStep (step) {
  var offset = step.offset = (this.clock._state.cycleLength * this.clock._state.preCycle) * 1;
  var note = step.args = step.args[0];
  step.time = step.time + offset;
  step.clockPosition = step.position;
  step.position = step.event === 'start' ? note.position : this.getPositionWithOffset(note.position, note.duration || 0);
  if (step.event === 'stop'  && step.position === note.position) return;
  step.context = this.context;
  this.emit('step', step);
}

proto.normalizeNote = function normalizeNote (params) {
  if (!params || !Array.isArray(params)) throw new Error('Invalid argument: note params is not valid array');
  var note = typeof params[1] === 'object' ? params[1] : typeof params[0] === 'object' ? params[0] : {};
  var position = typeof params[0] === 'string' && this.isValidPositionString(params[0]) ? params[0] : typeof note.position === 'string' && this.isValidPositionString(note.position) ? note.position : null;
  if (!position) throw new Error('Invalid argument: position is not valid');
  note.position = position;
  return note;
}

proto.set = function set (id, notes) {
  var self = this;
  if (typeof id !== 'string') throw new Error('Invalid argument: id is not a valid string');
  if (!notes || !Array.isArray(notes)) throw new Error('Invalid argument: notes is not a valid array');

  notes = this.expressions(notes.map(function (note) {
    if (!Array.isArray(note) && typeof note === 'object' && !!note.position) {
      return [note.position, note];
    }
    return note;
  }), {
    'beatsPerBar': this.beatsPerBar(),
    'barsPerLoop': this.loopLength()
  }).filter(function (note) {
    return self.isPositionWithinBounds(note[0]);
  }).map(function (note) {
    var normal = self.normalizeNote(note);
    return [self.getClockPositionFromPosition(normal.position), self.getDurationFromTicks(normal.duration || 0), null, null, normal];
  });

  this.scheduler.set(id, notes, this.beatsPerBar() * this.loopLength());
}

proto.get = function get (id) {
  if (typeof id !== 'string') throw new Error('Invalid argument: id is not a valid string');
  return (this.scheduler.get(id) || []).map(function (note) {
    return note[4];
  });
}

proto.channels = function channels () {
  return this.scheduler.getIds();
}

proto.clear = function clear (id) {
  var self = this;
  if (id) {
    if (typeof id !== 'string') throw new Error('Invalid argument: id is not a valid string');
    this.set(id, []);
  }
  else {
    this.scheduler.getIds().forEach(function (id) {
      self.clear(id);
    });
  }
}

proto.start = function start () {
  var now = new Date().valueOf();
  var waited = now - loadTime;
  if (waited < this.upstartWait) {
    return setTimeout(start.bind(this), this.upstartWait - waited);
  }

  if (!this.clock._state.playing) {
    this.clock.start();
    this.emit('playing');
  }
}

proto.pause = function pause () {
  if (this.clock._state.playing) {
    this.clock.stop();
    this.emit('paused');
  }
}

proto.stop = function stop () {
  if (this.clock._state.playing) {
    this.clock.stop();
    this.emit('paused');
    this.clock.setPosition(0);
    this._position = '0.0.00';
  }
}

proto.position = function position () {
  return this._position;
}

proto.setPosition = function setPosition (position) {
  if (!this.isPositionWithinBounds(position)) throw new Error('Invalid argument: position is not valid');
  this._position = position;
  this.clock.setPosition(this.getClockPositionFromPosition(position));
}

proto.isValidPositionString = function isValidPositionString (position) {
  return typeof position === 'string' && !!position.match(/\d\.\d\.\d+/);
}

proto.isPositionWithinBounds = function isPositionWithinBounds (position) {
  if (!this.isValidPositionString(position)) {
    return false;
  }

  var fragments = position.split('.');
  var bars = parseInt(fragments[0], 10) - 1;
  var beats = parseInt(fragments[1], 10) - 1;
  var ticks = parseInt(fragments[2], 10) - 1;

  if (ticks < 0 || beats < 0 || bars < 0 || ticks >= 96 || beats >= this.beatsPerBar() || bars >= this.loopLength()) {
    return false;
  }

  return true;
}

proto.tempo = function tempo () {
  return this.clock.getTempo();
}

proto.setTempo = function setTempo (tempo) {
  if (typeof tempo !== 'number' || tempo < 0 || isNaN(tempo)) throw new Error('Invalid argument: tempo is not a valid number');
  this.clock.setTempo(tempo);
}

proto.beatsPerBar = function beatsPerBar () {
  return this._beatsPerBar;
}

proto.setBeatsPerBar = function setBeatsPerBar (beats) {
  if (typeof beats !== 'number' || beats < 0 || isNaN(beats)) throw new Error('Invalid argument: beats is not a valid number');
  this._beatsPerBar = beats;
}

proto.loopLength = function loopLength () {
  return this._loopLength;
}

proto.setLoopLength = function setLoopLength (bars) {
  if (typeof bars !== 'number' || bars < 0 || isNaN(bars)) throw new Error('Invalid argument: bars is not a valid number');
  this._loopLength = bars;
}

module.exports = Dilla;
