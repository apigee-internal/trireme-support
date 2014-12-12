var assert = require('assert');

var trireme = require('..');

describe('Trireme Node-Only tests', function() {
  it('Check not on Trireme', function() {
    assert.equal(trireme.isTrireme(), false);
  });
  it('Check that loadJars fails', function() {
    assert.throws(function() {
      trireme.loadJars('foo.jar');
    }, /Error/);
  });
});
