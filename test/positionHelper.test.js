var chai = require('chai');
var expect = chai.expect;
var positionHelper = require('../lib/positionHelper');

describe('lib/positionHelper', function () {
  describe('normalizeNote (noteParams)', function () {
    describe('when "note" is not an array', function () {
      it('should throw an error', function () {
        expect(function () {
          positionHelper.normalizeNote();
        }).to.throw(/invalid argument/i);
        expect(function () {
          positionHelper.normalizeNote(false);
        }).to.throw(/invalid argument/i);
        expect(function () {
          positionHelper.normalizeNote({});
        }).to.throw(/invalid argument/i);
        expect(function () {
          positionHelper.normalizeNote('1.1.01');
        }).to.throw(/invalid argument/i);
      });
    });
    describe('when "note" is an array', function () {
      describe('when no valid position is passed', function () {
        it('should throw an error', function () {
          expect(function () {
            positionHelper.normalizeNote([]);
          }).to.throw(/invalid argument/i);
          expect(function () {
            positionHelper.normalizeNote(['1.1.asd']);
          }).to.throw(/invalid argument/i);
          expect(function () {
            positionHelper.normalizeNote([true]);
          }).to.throw(/invalid argument/i);
          expect(function () {
            positionHelper.normalizeNote([123]);
          }).to.throw(/invalid argument/i);
        });
      });
      describe('when index 0 is a valid position string', function () {
        it('should return a note object', function () {
          expect(positionHelper.normalizeNote(['1.1.01'])).to.be.a('object');
        });
        it('should use index 0 as position', function () {
          expect(positionHelper.normalizeNote(['1.1.01']).position).to.equal('1.1.01');
        });
        describe('when index 1 is a note object', function () {
          it('should extend the note object with position', function () {
            var note = { 'foo': 'bar' };
            var returned = positionHelper.normalizeNote(['1.2.23', note]);
            expect(returned.foo).to.equal('bar');
            expect(returned.position).to.equal('1.2.23');
          });
          describe('when position is already defined on the note object', function () {
            it('should overwrite the position with index 0', function () {
              var note = { 'foo': 'bar', 'position': '1.2.32' };
              var returned = positionHelper.normalizeNote(['1.2.23', note]);
              expect(returned.foo).to.equal('bar');
              expect(returned.position).to.equal('1.2.23');
            });
          });
        });
      });
      describe('when index 0 is a note object', function () {
        describe('when note object does not have a valid position', function () {
          it('should throw an error', function () {
            expect(function () {
              positionHelper.normalizeNote({});
            }).to.throw(/invalid argument/i);
            expect(function () {
              positionHelper.normalizeNote({ 'foo': 'bar' });
            }).to.throw(/invalid argument/i);
            expect(function () {
              positionHelper.normalizeNote({ 'position': 12 });
            }).to.throw(/invalid argument/i);
            expect(function () {
              positionHelper.normalizeNote({ 'position': '1.2.asd' });
            }).to.throw(/invalid argument/i);
          });
        });
        describe('when note object has a valid position', function () {
          it('should return a note object', function () {
            var note = { 'foo': 'bar', 'position': '1.2.32' };
            var returned = positionHelper.normalizeNote([note]);
            expect(returned.foo).to.equal('bar');
            expect(returned.position).to.equal('1.2.32');
          });
        });
      });
    });
  });

  describe('isPositionWithinBounds (position, barsPerLoop, beatsPerBar)', function () {
    describe('when position is out of bounds', function () {
      it('should return false', function () {
        expect(positionHelper.isPositionWithinBounds('0.0.01', 2, 4)).to.equal(false);
        expect(positionHelper.isPositionWithinBounds('3.1.01', 2, 4)).to.equal(false);
        expect(positionHelper.isPositionWithinBounds('2.5.01', 2, 4)).to.equal(false);
        expect(positionHelper.isPositionWithinBounds('1.2.98', 2, 4)).to.equal(false);
        expect(positionHelper.isPositionWithinBounds('1.2.43', 2, 1)).to.equal(false);
      });
    });
    describe('when position is within bounds', function () {
      it('should return true', function () {
        expect(positionHelper.isPositionWithinBounds('1.1.01'), 2, 4).to.equal(true);
        expect(positionHelper.isPositionWithinBounds('2.4.96'), 2, 4).to.equal(true);
      });
    });
  });
});
