var chai = require('chai');
var expect = chai.expect;
var Dilla = require('../index');
var MockAudioContext = require('./mocks/AudioContext');
var audioContext = new MockAudioContext();

describe('Dilla (audioContext, options)', function () {

  var dilla;

  beforeEach(function () {
    dilla = new Dilla(audioContext);
  });

  describe('when audioContext is not an object', function () {
    it('should throw an error', function () {
      expect(function () {
        new Dilla();
      }).to.throw(/invalid argument/i);
    });
  });

  describe('when called without "new"', function () {
    it('should still return a new instance', function () {
      dilla = Dilla(audioContext);
      expect(dilla).to.be.instanceOf(Dilla);
    });
  });

  describe('when options are defined', function () {
    it('should set the tempo', function () {
      dilla = new Dilla(audioContext, {
        'tempo': 122
      });
      expect(dilla.tempo()).to.equal(122);
    });
    it('should set the beatsPerBar', function () {
      dilla = new Dilla(audioContext, {
        'beatsPerBar': 7
      });
      expect(dilla.beatsPerBar()).to.equal(7);
    });
    it('should set the loopLength', function () {
      dilla = new Dilla(audioContext, {
        'loopLength': 3
      });
      expect(dilla.loopLength()).to.equal(3);
    });
  });

  describe('dilla.getDurationFromTicks (ticks)', function () {
    describe('when "ticks" is not a number', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.getDurationFromTicks();
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.getDurationFromTicks('foo');
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.getDurationFromTicks({});
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.getDurationFromTicks(true);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "ticks" is a negative number', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.getDurationFromTicks(-10);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "ticks" is a positive number', function () {
      it('should return clock duration for ticks', function () {
        expect(dilla.getDurationFromTicks(48)).to.equal(0.5);
        expect(dilla.getDurationFromTicks(96)).to.equal(1);
      });
    });
  });

  describe('dilla.setLoopLength (bars)', function () {
    describe('when "bars" is not a number', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.setLoopLength();
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setLoopLength('foo');
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setLoopLength({});
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setLoopLength(true);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "bars" is a negative number', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.setLoopLength(-10);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "bars" is a positive number', function () {
      it('should set the loop length', function () {
        dilla.setLoopLength(5);
        expect(dilla.loopLength()).to.equal(5);
      });
    });
  });

  describe('dilla.setBeatsPerBar (beats)', function () {
    describe('when "beats" is not a number', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.setBeatsPerBar();
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setBeatsPerBar('foo');
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setBeatsPerBar({});
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setBeatsPerBar(true);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "beats" is a negative number', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.setBeatsPerBar(-10);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "beats" is a positive number', function () {
      it('should set the loop length', function () {
        dilla.setBeatsPerBar(3);
        expect(dilla.beatsPerBar()).to.equal(3);
      });
    });
  });

  describe('dilla.tempo ()', function () {
    it('should return the current tempo', function () {
      expect(dilla.tempo()).to.equal(120);
    });
  });

  describe('dilla.setTempo (bpm)', function () {
    describe('when "bpm" is not a number', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.setTempo();
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setTempo('foo');
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setTempo({});
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setTempo(true);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "bpm" is a negative number', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.setTempo(-10);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "bpm" is a positive number', function () {
      it('should set the loop length', function () {
        dilla.setTempo(92);
        expect(dilla.tempo()).to.equal(92);
      });
    });
  });

  describe('dilla.setPosition (position)', function () {
    describe('when an invalid position is passed', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.setPosition();
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setPosition(10);
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setPosition(true);
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when the position is out of bounds', function () {
      it('should throw an error', function () {
        expect(function () {
          dilla.setPosition('1.1.97');
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setPosition('1.8.01');
        }).to.throw(/invalid argument/i);
        expect(function () {
          dilla.setPosition('4.1.01');
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when a valid position is passed', function () {
      it('should set the clock position', function () {
        dilla.setPosition('1.3.45');
        expect(dilla.position()).to.equal('1.3.45');
      });
    });
  });

  describe('dilla.isValidPositionString (position)', function () {
    describe('when position is not valid format', function () {
      it('should return false', function () {
        expect(dilla.isValidPositionString()).to.equal(false);
        expect(dilla.isValidPositionString(1)).to.equal(false);
        expect(dilla.isValidPositionString('hjkasd')).to.equal(false);
        expect(dilla.isValidPositionString('1.1')).to.equal(false);
        expect(dilla.isValidPositionString('1.1.a')).to.equal(false);
      });
    });
    describe('when position is valid format', function () {
      it('should return true', function () {
        expect(dilla.isValidPositionString('1.1.01')).to.equal(true);
        expect(dilla.isValidPositionString('1.1.1')).to.equal(true);
        expect(dilla.isValidPositionString('1.1.96')).to.equal(true);
      });
    });
  });

  describe('dilla.isPositionWithinBounds (position)', function () {
    describe('when position is out of bounds', function () {
      it('should return false', function () {
        expect(dilla.isPositionWithinBounds('0.0.01')).to.equal(false);
        expect(dilla.isPositionWithinBounds('3.1.01')).to.equal(false);
        expect(dilla.isPositionWithinBounds('2.5.01')).to.equal(false);
        expect(dilla.isPositionWithinBounds('1.2.98')).to.equal(false);
      });
    });
    describe('when position is within bounds', function () {
      it('should return true', function () {
        expect(dilla.isPositionWithinBounds('1.1.01')).to.equal(true);
        expect(dilla.isPositionWithinBounds('2.4.96')).to.equal(true);
      });
    });
  });
});