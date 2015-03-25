var chai = require('chai');
var expect = chai.expect;
var Dilla = require('../index');
var MockAudioContext = require('./mocks/AudioContext');
var audioContext = new MockAudioContext();

var dilla;

beforeEach(function () {
  dilla = new Dilla(audioContext);
});

describe('Dilla (audioContext, options)', function () {

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
      expect(function () {
        dilla.getDurationFromTicks(parseInt('foo', 10));
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
      expect(function () {
        dilla.setLoopLength(parseInt('foo', 10));
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
      expect(function () {
        dilla.setBeatsPerBar(parseInt('foo', 10));
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
      expect(function () {
        dilla.setTempo(parseInt('foo', 10));
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

describe('dilla.getPositionFromClockPosition (clockPosition)', function () {
  describe('when clockPosition is not a valid number', function () {
    it('should throw an error', function () {
      expect(function () {
        dilla.getPositionFromClockPosition();
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.getPositionFromClockPosition('foo');
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.getPositionFromClockPosition(parseInt('foo', 10));
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.getPositionFromClockPosition(true);
      }).to.throw(/invalid argument/i);
    });
  });
  describe('when clockPosition is negative', function () {
    it('should return 0.0.00', function () {
      expect(dilla.getPositionFromClockPosition(-0.1)).to.equal('0.0.00');
    });
  });
  describe('when clockPosition is positive', function () {
    it('should return the correct position', function () {
      expect(dilla.getPositionFromClockPosition(0)).to.equal('1.1.01');
      expect(dilla.getPositionFromClockPosition(1)).to.equal('1.2.01');
      expect(dilla.getPositionFromClockPosition(0.5)).to.equal('1.1.49');
      expect(dilla.getPositionFromClockPosition(3.75)).to.equal('1.4.73');
    });
  });
});

describe('dilla.getPositionWithOffset (position, offset)', function () {
  describe('when position is not a valid position string', function () {
    it('should throw an error', function () {
      expect(function () {
        dilla.getPositionWithOffset('1.1.a', 96);
      }).to.throw(/invalid argument/i);
    });
  });
  describe('when offset is not a valid number', function () {
    it('should throw an error', function () {
      expect(function () {
        dilla.getPositionWithOffset('1.1.01', '96');
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.getPositionWithOffset('1.1.01', true);
      }).to.throw(/invalid argument/i);
    });
  });
  describe('when offset is a float', function () {
    it('should throw an error', function () {
      expect(function () {
        dilla.getPositionWithOffset('1.1.01', 1.1);
      }).to.throw(/invalid argument/i);
    });
  });
  describe('when valid arguments are passed', function () {
    it('it should return a position string with the correct offset', function () {
      expect(dilla.getPositionWithOffset('1.1.01', 0)).to.equal('1.1.01');
      expect(dilla.getPositionWithOffset('1.1.01', 96)).to.equal('1.2.01');
      expect(dilla.getPositionWithOffset('1.3.73', 72)).to.equal('1.4.49');
    });
  });
});

describe('dilla.set (id, notes)', function () {
  describe('when id is not a valid id string', function () {
    it('should throw an error', function () {
      expect(function () {
        dilla.set(null, []);
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.set(1, []);
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.set({}, []);
      }).to.throw(/invalid argument/i);
    });
  });
  describe('when notes is not an array', function () {
    it('should throw an error', function () {
      expect(function () {
        dilla.set('foo', {});
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.set('foo', null);
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.set('foo', true);
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.set('foo', 123);
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.set('foo', '1.1.01');
      }).to.throw(/invalid argument/i);
    });
  });
  describe('when notes are out of bounds', function () {
    it('should filter out these notes', function () {
      dilla.set('foo', [
        ['1.1.01', { 'foo': 'bar' }],
        ['5.1.01']
      ]);
      var notes = dilla.get('foo');
      expect(notes.length).to.equal(1);
      expect(notes[0].position).to.equal('1.1.01');
      expect(notes[0].foo).to.equal('bar');
    });
  });
  describe('when re-using a channel id', function () {
    it('should overwrite previously registered notes', function () {
      dilla.set('foo', [
        ['1.1.01', { 'foo': 'bar' }]
      ]);
      dilla.set('foo', [
        ['1.2.01', { 'foo': 'bar' }]
      ]);
      var notes = dilla.get('foo');
      expect(notes.length).to.equal(1);
      expect(notes[0].position).to.equal('1.2.01');
      expect(notes[0].foo).to.equal('bar');
    });
  });
});

describe('dilla.get (id)', function () {
  describe('when id is not a valid id string', function () {
    it('should throw an error', function () {
      expect(function () {
        dilla.get();
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.get(3);
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.get(true);
      }).to.throw(/invalid argument/i);
    });
  });
  describe('when no channel with id exists', function () {
    it('should return an empty array', function () {
      var returned = dilla.get('foobar');
      expect(returned).to.be.a('array');
      expect(returned.length).to.equal(0);
    });
  });
  describe('when a channel with registered note exists', function () {
    it('should return an array of note objects', function () {
      dilla.set('foozle', [
        ['1.1.01'],
        { 'position': '1.2.02' }
      ]);
      var returned = dilla.get('foozle');
      expect(returned).to.be.a('array');
      expect(returned.length).to.equal(2);
      expect(returned[0].position).to.equal('1.1.01');
      expect(returned[1].position).to.equal('1.2.02');
    });
  });
});

describe('dilla.clear (id)', function () {
  describe('when id is not a valid id string', function () {
    it('should throw an error', function () {
      expect(function () {
        dilla.clear(3);
      }).to.throw(/invalid argument/i);
      expect(function () {
        dilla.clear(true);
      }).to.throw(/invalid argument/i);
    });
  });
  describe('when no channel with id exists', function () {
    it('should do nothing', function () {
      expect(function () {
        dilla.clear('foo');
      }).not.to.throw(Error);
    });
  });
  describe('when a channel with registered note exists', function () {
    it('should unregister all notes on that channel', function () {
      dilla.set('foo', [['1.1.01'], ['1.1.02']]);
      var returned = dilla.clear('foo');
      var notes = dilla.get('foo');
      expect(notes).to.be.a('array');
      expect(notes.length).to.equal(0);
    });
  });
});

describe('dilla.clear ()', function () {
  describe('when a channel with registered note exists', function () {
    it('should unregister all notes on all channels', function () {
      dilla.set('foo', [['1.1.01'], ['1.1.02']]);
      dilla.set('boo', [['2.1.01'], ['2.1.02']]);
      dilla.clear();
      expect(dilla.get('foo').length).to.equal(0);
      expect(dilla.get('boo').length).to.equal(0);
    });
  });
});
