# dilla
schedule looped playback of Web Audio events at 96 ticks per beat

Based on [ditty](https://github.com/mmckegg/ditty) and [bopper](https://github.com/mmckegg/bopper).

## Install

```
$ npm install --save dilla
```

## Usage

```
var Dilla = require('dilla');
var audioContext = new AudioContext();
var dilla = new Dilla(audioContext, options);
```

#### Options and defaults

```
{
  'tempo': 120,
  'beatsPerBar': 4,
  'loopLength': 2 // bars
}
```

### API

#### dilla.start()
#### dilla.pause()
#### dilla.stop()

#### dilla.position()

#### dilla.set(id, events)
#### dilla.clear(id)
#### dilla.get(id)

#### dilla.setTempo(tempo)
#### dilla.setBeatsPerBar(beats)
#### dilla.setLoopLength(bars)

### Events

#### tick

```
dilla.on('tick', function (data) {
  //fires as close to when the tick is actually updated, as possible
  data.bar, data.beat, data.tick
  data.position:string
});
```

#### step

```
dilla.on('step', function (data) {
  // piped through scheduler, fired with scheduled events
  data.event (start/stop), data.time, data.length, data.args
});
```

### Example: metronome

```
example for metronome, also in examples/metronome.html/js
```