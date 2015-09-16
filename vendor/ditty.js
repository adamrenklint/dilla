module.exports = Ditty

var Stream = require('stream')
var inherits = require('util').inherits

function Ditty(){

  if (!(this instanceof Ditty)){
    return new Ditty()
  }

  Stream.call(this)

  this.readable = true
  this.writable = true

  this._state = {
    loops: {},
    lengths: {},
    ids: [],
    queue: []
  }
}

inherits(Ditty, Stream)

var proto = Ditty.prototype

proto.set = function(id, events, length){
  var state = this._state
  if (events){
    if (!state.loops[id]){
      state.ids.push(id)
    }
    state.loops[id] = events
    state.lengths[id] = length || 8
  } else {
    var index = state.ids.indexOf(id)
    if (~index){
      state.ids.splice(index, 1)
    }
    state.loops[id] = null
  }

  if (state.loops[id]){
    this.emit('change', {
      id: id,
      events: state.loops[id],
      length: state.lengths[id]
    })
  } else {
    this.emit('change', {
      id: id
    })
  }
}

proto.get = function(id){
  return this._state.loops[id]
}

proto.getLength = function(id){
  return this._state.lengths[id]
}

proto.getIds = function(){
  return this._state.ids
}

proto.getDescriptors = function(){
  var state = this._state
  var result = []
  var id
  for (var i=0,len=state.ids.length;i<len;i++){
    id = state.ids[i]
    if (state.loops[id]){
      result.push({
        id: id,
        length: state.lengths[id],
        events: state.loops[id]
      })
    }
  }
  return result
}

proto.update = function(descriptor){
  this.set(descriptor.id, descriptor.events, descriptor.length)
}

proto.push = function(data){
  this.emit('data', data)
}

proto.write = function(obj){
  this._transform(obj)
}

proto._updateItemProperties = function(i, item, obj) {
  var state = this._state
  var from = obj.from
  var to = obj.to
  var time = obj.time
  var nextTime = obj.time + obj.duration
  var beatDuration = obj.beatDuration
  var queue = state.queue

  if (to > item.position || shouldSendImmediately(item, state.loops[item.id])){
    if (to > item.position){
      var delta = (item.position - from) * beatDuration
      item.time = time + delta
    } else {
      item.time = time
      item.position = from
    }
    queue.splice(i, 1)
    this.push(item)
  }
};

proto._queueEvent = function(event, id, localQueue, loopLength, obj) {
  var from = obj.from
  var to = obj.to
  var time = obj.time
  var beatDuration = obj.beatDuration
  var startPosition = getAbsolutePosition(event[0], from, loopLength)
  var endPosition = startPosition + event[1]

  if (startPosition >= from && startPosition < to){

    var delta = (startPosition - from) * beatDuration
    var duration = event[1] * beatDuration
    var startTime = time + delta
    var endTime = startTime + duration

    localQueue.push({
      id: id,
      event: 'start',
      position: startPosition,
      args: event[4],
      time: startTime
    })

    if (duration) {
      localQueue.push({
        id: id,
        event: 'stop',
        position: endPosition,
        args: event[4],
        time: endTime
      })
    }
  }
}

proto._transform = function(obj){
  var begin = window.performance.now()
  var endAt = begin + (obj.duration * 5000)

  var state = this._state
  var from = obj.from
  var to = obj.to
  var time = obj.time
  var nextTime = obj.time + obj.duration
  var beatDuration = obj.beatDuration
  var ids = state.ids
  var queue = state.queue
  var localQueue = []
  var id, events, loopLength, item;

  for (var i=queue.length-1;i>=0;i--){
    this._updateItemProperties(i, queue[i], obj);
  }

  for (var j=0,jLen=ids.length;j<jLen;j++){
    id = ids[j]
    events = state.loops[id]
    loopLength = state.lengths[id]

    for (var k=0,kLen=events.length;k<kLen;k++){
      this._queueEvent(events[k], id, localQueue, loopLength, obj);
    }
  }

  // ensure events stream in time sequence
  // localQueue.sort(compare)
  for (var l=0,lLen=localQueue.length;l<lLen;l++){
    item = localQueue[l]
    if (item.time < nextTime){
      // if (window.performance.now() < endAt){
        this.push(item)
      // }
    } else {
      // queue event for later
      queue.push(item)
    }
  }
}

function compare(a,b){
  return a.time-b.time
}

function getAbsolutePosition(pos, start, length){
  var localPos = pos % length
  var micro = start % length
  var position = start+localPos-micro
  if (position < start){
    return position + length
  } else {
    return position
  }
}

function shouldSendImmediately(message, loop){
  return message.event === 'stop' && (!loop || !loop.length)
}
