# dilla

[![NPM version](https://badge.fury.io/js/dilla.png)](http://badge.fury.io/js/dilla) [![Code Climate](https://codeclimate.com/github/adamrenklint/dilla.png)](https://codeclimate.com/github/adamrenklint/dilla) [![Dependency Status](https://david-dm.org/adamrenklint/dilla.png?theme=shields.io)](https://david-dm.org/adamrenklint/dilla-expressions)


> Schedule looped playback of Web Audio notes at 96 ticks per beat

Based on [ditty](https://github.com/mmckegg/ditty) and [bopper](https://github.com/mmckegg/bopper). Named after one of [the greatest to ever touch a drum machine](http://en.wikipedia.org/wiki/J_Dilla).

## Install

```
$ npm install --save dilla
```

## Usage

```javascript
var Dilla = require('dilla');
var audioContext = new AudioContext();
var dilla = new Dilla(audioContext, options);
```

#### Options and defaults

```json
{
  "tempo": 120,
  "beatsPerBar": 4,
  "loopLength": 2
}
```

Note that ```loopLength``` is measured in bars, i.e. the default loop length above is 8 beats.

### API

#### Playback controls

- **dilla.start()** start playback at current position
- **dilla.pause()** stop playback at current position
- **dilla.stop()** stop playback and set position to start of loop

#### Scheduling

- **dilla.set(id, notes)** schedule playback of array of *[notes](#note)* on channel with *id*, clearing any previously scheduled notes on same channelpassed in ```step.args```
- **dilla.get(id)** returns an array of notes scheduled on channel with *id*
- **dilla.channels()** returns an array of all channel ids
- **dilla.clear(id)** clear notes for channel
- **dilla.clear()** clear notes for all channels

#### Position and options

- **dilla.position** returns current position string, ```"BAR.BEAT.TICK"```
- **dilla.setPosition(position)** set position to ```"BAR.BEAT.TICK"```
- **dilla.setTempo(bpm)** set playback tempo, default ```120```
- **dilla.setBeatsPerBar(beats)** change playback time signature, default ```4```
- **dilla.setLoopLength(bars)** change bars per loop, default ```2```

### Objects

#### Position

- A string in the format ```BAR.BEAT.TICK```
- Where each part is a (1-based index) number
- Tick values under 10 are padded with a leading zero
- Can contain [expressions](https://github.com/adamrenklint/dilla-expressions) which are expanded by ```dilla.set()```

#### Note

- An array
- At index 0, a position string or expression (required)
- At index 1, duration is defined in ticks (optional)
- From index 2 and beyond, define arbitrary arguments, like playback rate or oscillator frequency

### Events

#### tick

Fires when the bar, beat or tick value of ```dilla.position()``` is updated.

```javascript
dilla.on('tick', function (tick) {
  console.log(tick.position) // "1.1.01"
});
```

#### step

Fires when a scheduled event should start or stop.

```javascript
dilla.on('step', function (step) {
  console.log(step.event); // "start" or "stop"
  console.log(step.time); // offset in seconds
  console.log(step.args); // note data originally passed to set()
});
```

### Example: metronome

The "hello world" of audio libraries, the simple metronome: check out the [demo](http://adamrenklint.github.io/dilla) or [code](https://github.com/adamrenklint/dilla/blob/master/example.js).

```javascript
var duration = 15;
var oscillator, gainNode;

dilla.set('metronome', [
  ['*.1.01', duration, 440],
  ['*.2.01', duration, 330],
  ['*.3.01', duration, 330],
  ['*.4.01', duration, 330]
]);

dilla.on('step', function (step) {
  if (step.event === 'start') {
    oscillator = step.context.createOscillator();
    gainNode = step.context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(step.context.destination);
    oscillator.frequency.value = step.args[2];
    gainNode.gain.setValueAtTime(1, step.time);
    oscillator.start(step.time);
  }
  else if (step.event === 'stop' && oscillator) {
    gainNode.gain.setValueAtTime(1, step.time);
    gainNode.gain.linearRampToValueAtTime(0, step.time + 0.1);
    oscillator = null;
    gainNode = null;
  }
});

dilla.start();
```

## Changelog

- **0.1.0**
  - Initial release, ported from **bap** project
- **1.0.0**
  - Improved release for metronome example oscillator
  - Warn in console when events provided to ```dilla.set()``` is out of bounds
- **1.0.1**
  - FIXED: ```dilla.getClockPositionFromPosition()``` returns incorrect value for ticks [#4](https://github.com/adamrenklint/dilla/issues/4)
  - FIXED: ```step.position``` is incorrect [#1](https://github.com/adamrenklint/dilla/issues/1)
- **1.0.2**
  - FIXED: ```dilla.getPositionWithOffset()``` returns incorrect position when offset is falsy [#5](https://github.com/adamrenklint/dilla/issues/5)
  - FIXED: ```"stop"``` fires for events with falsy duration (oneshots) [#3](https://github.com/adamrenklint/dilla/issues/3)
- **1.1.0**
  - NEW: Use [expressions](https://www.npmjs.com/package/dilla-expressions) to insert repeating events [#2](https://github.com/adamrenklint/dilla/issues/2)
  - FIXED: "Out of bounds" warning does not say which channel [#6](https://github.com/adamrenklint/dilla/issues/6)
- **1.1.1**
  - FIXED: Ambiguous use of the word "*events*" [#8](https://github.com/adamrenklint/dilla/issues/8)

## License

MIT © [Adam Renklint](http://adamrenklint.com)
