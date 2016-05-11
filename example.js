var Dilla = require('./index');
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var dilla = new Dilla(audioContext);

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

function draw () {
  document.body.textContent = dilla.position();
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
