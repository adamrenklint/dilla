var Dilla = require('./index');
var audioContext = new AudioContext();
var dilla = new Dilla(audioContext);

var duration = 15;
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

function draw () {
  document.body.innerText = dilla.position();
  window.requestAnimationFrame(draw);
}
draw();

var oscillator, gainNode;

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