var assert = require('assert');
var path = require('path');

var trireme = require('..');

describe('Trireme Support', function() {
  it('Validate Trireme', function() {
    assert(trireme.isTrireme());
  });
});

describe('JAR loading', function() {
  var testMod;

  before('Load jars', function() {
    trireme.loadJars([
      path.join(__dirname, 'resources/testjar.jar'),
      path.join(__dirname, 'resources/depjar.jar')
    ]);
  });

  it('Test jar module', function() {
    var testMod = require('test-jar-module');

    assert.equal(testMod.getValue(), null);
    testMod.setValue('Hello');
    assert.equal(testMod.getValue(), 'Hello');

    assert.equal(testMod.getSharedValue(), 0);
    testMod.setSharedValue(123);
    assert.equal(testMod.getSharedValue(), 123);
  });

  it('Test Binding module', function() {
    var testMod = process.binding('test-jar-module-internal');

    assert.equal(testMod.getValue(), 'Initial Value');
    testMod.setValue('Hello');
    assert.equal(testMod.getValue(), 'Hello');
  });

  it('Test Script module', function() {
    var testMod = require('test-script-module');

    assert.equal(testMod.getValue(), 'Script Module');
    testMod.setValue('Goodbye');
    assert.equal(testMod.getValue(), 'Goodbye');
  });
});

describe('Interface tests', function() {
  it('Missing args', function() {
    assert.throws(function() {
      trireme.loadJars();
    });
  });
  it('Just one string', function() {
    trireme.loadJars(path.join(__dirname, 'resources/depjar.jar'));
  });
  it('Invalid array contents', function() {
    assert.throws(function() {
      trireme.loadJars([{
        foo: 'bar'
      }, 123]);
    });
  });
  it('Can\'t find file', function() {
    assert.throws(function() {
      trireme.loadJars('notfound.jar');
    });
  });
});
