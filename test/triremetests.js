var assert = require('assert');
var http = require('http');
var path = require('path');
var util = require('util');

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

describe('HTTP Server tests', function() {
  var PORT = 44444;
  var svr;

  // Start an HTTP server here in the process
  before(function(done) {
    svr = http.createServer(function(req, resp) {
      resp.end('Hello, World!');
    });
    svr.listen(PORT, done);
  });
  after(function(done) {
    svr.close(done);
  });

  // Make sure that it is functioning normally
  it('Verify server', function(done) {
    http.get(util.format('http://localhost:%d/', PORT), function(res) {
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        if (body === 'Hello, World!') {
          done();
        } else {
          done(new Error('Incorrect response body: %s', body));
        }
      });
    }).on('error', function(e) {
      done(e);
    });
  });

  // Call a Java module that will call it from inside a thread pool
  it('Call server from Java code', function(done) {
    var testMod = require('test-jar-module');
    testMod.httpGet(util.format('http://localhost:%d/', PORT),
      function(err, result) {
        if (err) {
          done(err);
        } else if (result === 'Hello, World!') {
          done();
        } else {
          done(new Error(util.format(
            'Result %s does not match expected', result)));
        }
      }
    );
  });
});
