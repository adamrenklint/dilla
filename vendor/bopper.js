var Stream = require('stream')
var Event = require('geval')

var inherits = require('util').inherits

module.exports = Bopper

function Bopper(audioContext){
  if (!(this instanceof Bopper)){
    return new Bopper(audioContext)
  }

  var self = this

  Stream.call(this)
  this.readable = true
  this.writable = false

  this.context = audioContext
  var processor = this._processor = audioContext.createScriptProcessor(512, 1, 1)

  var handleTick = bopperTick.bind(this)
  this._processor.onaudioprocess = handleTick

  var tempo = 120
  var cycleLength = (1 / audioContext.sampleRate) * this._processor.bufferSize

  this._state = {
    lastTo: 0,
    lastEndTime: 0,
    playing: false,
    bpm: tempo,
    beatDuration: 60 / tempo,
    increment: (tempo / 60) * cycleLength,
    cycleLength: cycleLength,
    preCycle: 4,
  }

  // frp version
  this.onSchedule = Event(function(broadcast){
    self.on('data', broadcast)
  })

  processor.connect(audioContext.destination)
}

inherits(Bopper, Stream)

var proto = Bopper.prototype


proto.start = function(){
  this._state.playing = true
  this.emit('start')
}

proto.stop = function(){
  this._state.playing = false
  this.emit('stop')
}

proto.schedule = function(duration) {
  var state = this._state
  var currentTime = this.context.currentTime

  var endTime = this.context.currentTime + duration
  var time = state.lastEndTime

  if (endTime >= time) {
    state.lastEndTime = endTime

    if (state.playing){
      var duration = endTime - time
      var length = duration / state.beatDuration

      var from = state.lastTo
      var to = from + length
      state.lastTo = to

      // skip if getting behind
      //if ((currentTime - (state.cycleLength*3)) < time){
        this._schedule(time, from, to)
      //}
    }
  }

}

proto.setTempo = function(tempo){
  var bps = tempo/60
  var state = this._state
  state.beatDuration = 60/tempo
  state.increment = bps * state.cycleLength
  state.bpm = tempo
  this.emit('tempo', state.bpm)
}

proto.getTempo = function(){
  return this._state.bpm
}

proto.isPlaying = function(){
  return this._state.playing
}

proto.setPosition = function(position){
  this._state.lastTo = parseFloat(position)
}

proto.setSpeed = function(multiplier){
  var state = this._state

  multiplier = parseFloat(multiplier) || 0

  var tempo = state.bpm * multiplier
  var bps = tempo/60

  state.beatDuration = 60/tempo
  state.increment = bps * state.cycleLength
}


proto.getPositionAt = function(time){
  var state = this._state
  var delta = state.lastEndTime - time
  return state.lastTo - (delta / state.beatDuration)
}

proto.getTimeAt = function(position){
  var state = this._state
  var positionOffset = this.getCurrentPosition() - position
  return this.context.currentTime - (positionOffset * state.beatDuration)
}

proto.getCurrentPosition = function(){
  return this.getPositionAt(this.context.currentTime)
}

proto.getNextScheduleTime = function(){
  var state = this._state
  return state.lastEndTime
}

proto.getBeatDuration = function(){
  var state = this._state
  return state.beatDuration
}

var __data = {
  from: 0,
  to: 0,
  time: 0,
  duration: 0,
  beatDuration: 0
}

proto._schedule = function(time, from, to){
  var state = this._state
  var duration = (to - from) * state.beatDuration
  __data.from = from;
  __data.to = to;
  __data.time = time;
  __data.duration = duration;
  __data.beatDuration = state.beatDuration;

  this.emit('data', __data);
}

function bopperTick(e){
  var state = this._state
  this.schedule(state.cycleLength * state.preCycle)
}
