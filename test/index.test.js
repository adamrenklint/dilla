var chai = require('chai');
var expect = chai.expect;
var Dilla = require('../index');
var MockAudioContext = require('./mocks/AudioContext');
var mockAudioContext = new MockAudioContext();

describe('Dilla (audioContext, options)', function () {

  var dilla;

  beforeEach(function () {
    dilla = new Dilla(mockAudioContext);
  });

  describe('when audioContext is not an object', function () {
    it('should throw an error', function () {
      expect(function () {
        new Dilla();
      }).to.throw(/invalid arguments/i);
    });
  });

  describe('when called without "new"', function () {
    it('should still return a new instance', function () {
      dilla = Dilla(mockAudioContext);
      expect(dilla).to.be.instanceOf(Dilla);
    });
  });

  describe('dilla.getDurationFromTicks (ticks)', function () {
    it('should return clock duration for ticks', function () {
      expect(dilla.getDurationFromTicks(48)).to.equal(0.5);
      expect(dilla.getDurationFromTicks(96)).to.equal(1);
    });
  });

  // describe('dilla.')
});