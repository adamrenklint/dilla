var events = require('events');
var inherits = require('util').inherits
var bopper = require('bopper');
var ditty = require('ditty');

var loadTime = new Date().valueOf();

function Dilla (audioContext, options) {

  if (!(this instanceof Dilla)){
    return new Dilla(audioContext, options);
  }

  events.EventEmitter.call(this);

  options = options || {};

  this.upstartWait = options.upstartWait || 250;
  this.tempo = options.tempo || 120;
  this.beatsPerBar = options.beatsPerBar || 4;
  this.loopLength = options.loopLength || 2;
  this._position = '0.0.00';
  
  this.context = audioContext;
  this.clock = bopper(this.context);
  this.scheduler = ditty();

  this.clock.setTempo(this.tempo);
  this.clock.on('data', updatePositionFromClock.bind(this));
  this.clock.pipe(this.scheduler).on('data', emitStep.bind(this));
}

inherits(Dilla, events.EventEmitter);

function updatePositionFromClock (step) {
  var position = this.getPositionFromTime(step.time);
  if (this._position !== position) {
    this._position = position;
    this.emit('tick', { 'position': this._position, 'context': this.context });
  }
}

function getPositionFromTime (time) {
  var offset = (this.clock._state.cycleLength * this.clock._state.preCycle) * 1;
  var position = this.clock.getPositionAt(time - offset);
  if (position < 0) return '0.0.00';
  var beatsPerLoop = this.loopLength * this.beatsPerBar;
  var loops = Math.floor(position / beatsPerLoop) || 0;
  position = position - (loops * beatsPerLoop);
  var bars = Math.floor(position / this.beatsPerBar);
  position = position - (bars * this.beatsPerBar);
  var beats = Math.floor(position);
  position = position - beats;
  var ticks = Math.floor(position * 96) + 1;
  if (ticks < 10) ticks = '0' + ticks;
  return ++bars + '.' + ++beats + '.' + ticks;
}

function getClockPositionFromPosition (position) {
  var parts = position.split('.');
  var bars = parseInt(parts[0], 10) - 1;
  var beats = parseInt(parts[1], 10) - 1;
  var ticks = parseInt(parts[2], 10) - 1;
  return (bars * this.beatsPerBar) + beats + (ticks / 96 * 100);
}

function getDurationFromTicks (ticks) {
  return (1 / 96) * ticks;
}

function emitStep (step) {
  var offset = step.offset = (this.clock._state.cycleLength * this.clock._state.preCycle) * 1;
  step.time = step.time + offset;
  step.clockPosition = step.position;
  step.position = this.getPositionFromTime(step.time);
  step.context = this.context;
  this.emit('step', step);
}

function set (id, events) {
  var self = this;
  events = events.filter(function (event) {
    var parts = event[0].split('.');
    var bars = parseInt(parts[0], 10) - 1;
    var beats = parseInt(parts[1], 10) - 1;
    var ticks = parseInt(parts[2], 10) - 1;
    if (ticks >= 96 || beats >= self.beatsPerBar || bars >= self.loopLength) return false;
    return true;
  }).map(function (event) {
    return [self.getClockPositionFromPosition(event[0]), self.getDurationFromTicks(event[1]), null, null, event[0], event[1]].concat(event.slice(2));
  });
  this.scheduler.set(id, events, this.beatsPerBar * this.loopLength);
}

function get (id) {
  return this.scheduler.get(id);
}

function channels () {
  return this.scheduler.getIds();
}

function clear (id) {
  var self = this;
  if (id) {
    this.set(id, []);
  }
  else {
    this.scheduler.getIds().forEach(function (id) {
      self.clear(id);
    });
  }
}

function start () {
  var now = new Date().valueOf();
  var waited = now - loadTime;
  if (waited < this.upstartWait) {
    return setTimeout(start.bind(this), this.upstartWait - waited);
  }

  if (!this.clock._state.playing) {
    this.clock.start();
  }
}

function pause () {
  if (this.clock._state.playing) {
    this.clock.stop();
  }
}

function stop () {
  if (this.clock._state.playing) {
    this.clock.stop();
    this.clock.setPosition(0);
    this._position = '0.0.00';
  }
}

function position () {
  return this._position;
}

function setPosition (position) {
  this.clock.setPosition(this.getClockPositionFromPosition(position));
}

function setTempo (tempo) {
  this.clock.setTempo(tempo);
}

function setBeatsPerBar (beats) {
  this.beatsPerBar = beats;
}

function setLoopLength (bars) {
  this.loopLength = bars;
}

var proto = Dilla.prototype;
[set, get, clear, start, stop, pause, getPositionFromTime, setTempo, setPosition, getClockPositionFromPosition, getDurationFromTicks, setBeatsPerBar, setLoopLength, channels, position].forEach(function (fn) {
  proto[fn.name] = fn;
});

module.exports = Dilla;