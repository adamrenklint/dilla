# Dilla

[![npm](https://img.shields.io/npm/v/dilla.svg?style=flat-square)](https://www.npmjs.com/package/dilla) [![npm](https://img.shields.io/npm/dm/dilla.svg?style=flat-square)](https://www.npmjs.com/package/dilla) [![GitHub stars](https://img.shields.io/github/stars/adamrenklint/dilla.svg?style=flat-square)](https://github.com/adamrenklint/dilla/stargazers) [![GitHub forks](https://img.shields.io/github/forks/adamrenklint/dilla.svg?style=flat-square)](https://github.com/adamrenklint/dilla/network)

[![Travis branch](https://img.shields.io/travis/adamrenklint/dilla.svg?style=flat-square)](https://travis-ci.org/adamrenklint/dilla) [![Code Climate](https://img.shields.io/codeclimate/github/adamrenklint/dilla.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/dilla) [![Code Climate](https://img.shields.io/codeclimate/coverage/github/adamrenklint/dilla.svg?style=flat-square)](https://codeclimate.com/github/adamrenklint/dilla) [![David dependencies](https://img.shields.io/david/adamrenklint/dilla.svg?style=flat-square)](https://david-dm.org/adamrenklint/dilla) [![David devDependencies](https://img.shields.io/david/dev/adamrenklint/dilla.svg?style=flat-square)](https://david-dm.org/adamrenklint/dilla#info=devDependencies)

> Schedule looped playback of Web Audio notes at 96 ticks per beat

Based on [ditty](https://github.com/mmckegg/ditty) and [bopper](https://github.com/mmckegg/bopper). Named after one of [the greatest](http://en.wikipedia.org/wiki/J_Dilla) to ever touch a drum machine.

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

### Example

The "hello world" of audio libraries, the simple metronome: check out the [demo](http://adamrenklint.github.io/dilla) or [code](https://github.com/adamrenklint/dilla/blob/master/example.js).

```javascript
var high = {
  'position': '*.1.01',
  'freq': 440,
  'duration': 15
};
var low = { 'freq': 330, 'duration': 15 };

dilla.set('metronome', [
  high,
  ['*.>1.01', low]
]);

var oscillator, gainNode;
dilla.on('step', function (step) {
  if (step.event === 'start') {
    oscillator = step.context.createOscillator();
    gainNode = step.context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(step.context.destination);
    oscillator.frequency.value = step.args.freq;
    gainNode.gain.setValueAtTime(1, step.time);
    oscillator.start(step.time);
  }
  else if (step.event === 'stop' && oscillator) {
    gainNode.gain.setValueAtTime(1, step.time);
    gainNode.gain.linearRampToValueAtTime(0, step.time + 0.1);
    oscillator.stop(step.time + 0.1);
    oscillator = null;
    gainNode = null;
  }
});

dilla.start();
```

### Tutorials

- [Making a boombap beat with Dilla and the Web Audio API](http://adamrenklint.com/making-boombap-beat-with-dilla/)
- [Using expressions in Dilla](http://adamrenklint.com/using-expressions-in-dilla/)

### API

#### Playback controls

- **dilla.start()** start playback at current position
- **dilla.pause()** stop playback at current position
- **dilla.stop()** stop playback and set position to start of loop

#### Scheduling

- **dilla.set(id, notes)** schedule playback of array of *notes* on channel with *id*, clearing any previously scheduled notes on same channel. A note can be defined as a [note object](#note) (must contain position) or an array with position at index 0 and params in an object at index 1 (see metronome example above)
- **dilla.get(id)** returns an array of notes scheduled on channel with *id*
- **dilla.channels()** returns an array of all channel ids
- **dilla.clear(id)** clear notes for channel
- **dilla.clear()** clear notes for all channels

#### Position and options

- **dilla.position** returns current [position string](#position), ```"BAR.BEAT.TICK"```
- **dilla.setPosition(position)** set position to ```"BAR.BEAT.TICK"```
- **dilla.setTempo(bpm)** set playback tempo, default ```120```
- **dilla.setBeatsPerBar(beats)** change playback time signature, default ```4```
- **dilla.setLoopLength(bars)** change bars per loop, default ```2```

### Objects

#### Position

- A string in the format ```BAR.BEAT.TICK```
- Where each part is a (1-based index) number
- Tick values under 10 are padded with a leading zero
- Can contain [expressions](http://adamrenklint.com/using-expressions-in-dilla/) which are expanded by ```dilla.set()```

#### Note

- An object that must define ```position```
- Can define ```duration``` in ticks (optional) or any other other params, like frequency or playback rate

### Events

#### tick

Fires when the bar, beat or tick value of ```dilla.position()``` is updated.

```javascript
dilla.on('tick', function (tick) {
  console.log(tick.position) // "1.1.01"
});
```

#### step

Fires when a scheduled note should start or stop. For notes with undefined or falsy duration value (i.e. oneshots), no *stop* step event is triggered.

```javascript
dilla.on('step', function (step) {
  console.log(step.event); // "start" or "stop"
  console.log(step.time); // offset in seconds
  console.log(step.args); // note data originally passed to set()
});
```

## Develop

- ```make test```
- ```make coverage```
- ```make publish```

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
  - FIXED: Ambiguous use of the word "*event*" [#8](https://github.com/adamrenklint/dilla/issues/8)
- **1.2.0**
  - CHANGED: Note passed to ```dilla.set()``` can be an array with position at index 0, or a note object, and will be merged into a note object
  - NEW: Added lots of unit tests
- **1.3.0**
  - NEW: [Modulus operator](https://github.com/adamrenklint/dilla-expressions#modulus) expression
  - NEW: [Add custom matcher](https://github.com/adamrenklint/dilla-expressions#custom-matchers) with ```dilla.expressions.addMatcher```
- **1.3.1**
  - FIXED: Minifying dilla function names breaks everything
- **1.3.2**
  - FIXED: "step" event stops triggering when tab is put to background [#14](https://github.com/adamrenklint/dilla/issues/14)
  - FIXED: Metronome example is leaking, never stops oscillator [#15](https://github.com/adamrenklint/dilla/issues/15)
- **1.3.3**
  - DOCS: Added link to [expressions tutorial](http://adamrenklint.com/using-expressions-in-dilla/)
  - CHANGED: Improved code complexity and test coverage
- **1.3.4**
  - DOCS: Fix typos
- **1.3.5**
  - FIXED: Updated [dilla-expressions](https://github.com/adamrenklint/dilla-expressions) to solve [modulus by 1 issue](https://github.com/adamrenklint/dilla-expressions/commit/889be0251a9837c062abc8452328759627582903)
- **1.4.0**
  - ADDED: Define ```options.expandNote(note)``` to transform note after expression expansion
  - CHANGED: Use local version of Ditty with longer lookahead
  - CHANGED: Use dilla-expressions v1.2, with greater than and less than operators
- **1.5.0**
  - CHANGED: Use dilla-expressions v2.0, with 25-1500 times better performance
  - FIXED: Use prefixed AudioContext in Safari
- **1.6.0**
  - CHANGED: Reduce intensity of keepalive pings to improve CPU performance
  - CHANGED: Memoize expensive methods
- **1.7.0**
  - CHANGED: Use forked version of Bopper, with less object creation
- **1.8.0**
  - CHANGED: Memoize inner part of set method, for better performance and less allocation
  - CHANGED: Use meeemo 1.1.1, which uses Map instead of plain object when possible
  - CHANGED: Refactor ditty to avoid deoptimization of inner loop bodies
- **1.8.1**
  - FIXED: Drops notes when `beatsPerBar` is above 9 [#22](https://github.com/adamrenklint/dilla/issues/22)
- **1.8.2**
  - FIXED: Changing beats per bar leads to confusion in the order of the steps [#23](https://github.com/adamrenklint/dilla/issues/23)
- **1.8.3**
  - FIXED: Correct memoization key for dilla.getClockPositionFromPosition [#23](https://github.com/adamrenklint/dilla/issues/23)
- **1.8.4** (2017-12-14)
  - FIXED: setBeatsPerBar not working [#26](https://github.com/adamrenklint/dilla/issues/26)

## License

MIT © [Adam Renklint](http://adamrenklint.com)
