var chai = require('chai');
var expect = chai.expect;
var checkValid = require('../lib/checkValid');

describe('lib/checkValid', function () {

  describe('isValidPositionString (position)', function () {
    describe('when position is not valid format', function () {
      it('should return false', function () {
        expect(checkValid.positionString()).to.equal(false);
        expect(checkValid.positionString(1)).to.equal(false);
        expect(checkValid.positionString('hjkasd')).to.equal(false);
        expect(checkValid.positionString('1.1')).to.equal(false);
        expect(checkValid.positionString('1.1.a')).to.equal(false);
      });
    });
    describe('when position is valid format', function () {
      it('should return true', function () {
        expect(checkValid.positionString('1.1.01')).to.equal(true);
        expect(checkValid.positionString('1.1.1')).to.equal(true);
        expect(checkValid.positionString('1.1.96')).to.equal(true);
        expect(checkValid.positionString('1.10.96')).to.equal(true);
        expect(checkValid.positionString('11.1.96')).to.equal(true);
      });
    });
  });
});
