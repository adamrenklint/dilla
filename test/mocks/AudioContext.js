function MockAudioContext () {

  this.createScriptProcessor = function () {
    return {
      'onaudioprocess': function () {},
      'connect': function () {}
    }
  }
}

module.exports = MockAudioContext;