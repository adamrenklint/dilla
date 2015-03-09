# dilla
Schedule looped playback of Web Audio events at 96 ticks per beat

Based on [ditty](https://github.com/mmckegg/ditty) and [bopper](https://github.com/mmckegg/bopper).

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

- **dilla.set(id, events)** schedule playback of array of *events* on channel with *id*, clearing any previously scheduled events on same channel
- **dilla.get(id)** returns an array of events scheduled on channel with *id*
- **dilla.channels()** returns an array of all channel ids
- **dilla.clear(id)** clear events for channel
- **dilla.clear()** clear events for all channels

#### Position and options

- **dilla.position** returns current position string, ```"BAR.BEAT.TICK"```
- **dilla.setPosition(position)** set position to ```"BAR.BEAT.TICK"```
- **dilla.setTempo(bpm)** set playback tempo, default ```120```
- **dilla.setBeatsPerBar(beats)** change playback time signature, default ```4```
- **dilla.setLoopLength(bars)** change bars per loop, default ```2```

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
  console.log(step.args); // data originally passed to set()
});
```

### Example: metronome

The "hello world" of audio libraries, the simple metronome: check out the [demo](http://adamrenklint.github.io/dilla) or [code](https://github.com/adamrenklint/dilla/blob/master/example.js).

```javascript
var duration = 15;
var oscillator, gainNode;

dilla.set('metronome', [
  ['1.1.01', duration, 440],
  ['1.2.01', duration, 330],
  ['1.3.01', duration, 330],
  ['1.4.01', duration, 330],
  ['2.1.01', duration, 440],
  ['2.2.01', duration, 330],
  ['2.3.01', duration, 330],
  ['2.4.01', duration, 330]
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
  - Fixed: getClockPositionFromPosition returns incorrect value for ticks [4](https://github.com/adamrenklint/dilla/issues/4)

## License

MIT © [Adam Renklint](http://adamrenklint.com)