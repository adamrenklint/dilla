var Dilla = require('./index');
var audioContext = new AudioContext();
var dilla = new Dilla(audioContext);

var duration = 10;
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

// dilla.on('tick', function (tick) {
//   document.body.innerText = tick.position;
// });

function draw () {
  document.body.innerText = dilla.position;
  window.requestAnimationFrame(draw);
}
draw();

var oscillator = null;

dilla.on('step', function (step) {
  if (step.event === 'start') {
    oscillator = step.context.createOscillator();
    oscillator.connect(step.context.destination);
    oscillator.frequency.value = step.args[2];
    oscillator.start(step.time);
  }
  else if (step.event === 'stop' && oscillator) {
    oscillator.stop(step.time);
    oscillator = null;
  }
});

dilla.start();

window.d = dilla;