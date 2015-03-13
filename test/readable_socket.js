var zmq = require('..')
  , should = require('should')
  , semver = require('semver');

if (!semver.gte(process.version, '0.10.0')) {
  return console.warn('Test requires Node >= 0.10.0');
}

describe('ReadableSocket', function () {
  it('should expose ReadableSocket', function () {
    zmq.ReadableSocket.should.exist;
  });

  it('should expose createReadableSocket', function () {
    zmq.createReadableSocket.should.exist;
  });

  it('should not support pub, xpub, req, xreq, rep, xrep, push, dealer, router, pair, stream socket type', function () {
    ['pub', 'xpub', 'req', 'xreq', 'rep', 'xrep', 'push', 'dealer', 'router', 'pair', 'stream'].forEach(function (type) {
      (function () {
        var sock = new zmq.ReadableSocket(type);
      }).should.throw();
    });
  });

  it('should support sub, xsub and pull socket type', function () {
    ['sub', 'xsub', 'pull'].forEach(function (type) {
      (function () {
        // check for supported types, xsub not supported in 0mq 2-x
        if (!zmq.types[type]) {
          return;
        }

        var sock = new zmq.ReadableSocket(type);
      }).should.not.throw();
    });
  });

  it('should not implement send', function(){
    (function () {
      var sock = new zmq.ReadableSocket('pull');
      sock.send()
    }).should.throw('Can not send using ReadableSocket.');
  });

  it('should emit data on message arrival', function (done) {
    var sender = zmq.socket('push')
      , receiver = new zmq.ReadableSocket('pull');

    receiver.bind('inproc://ReadableSocketTest');

    receiver.on('bind', function(){
      sender.connect('inproc://ReadableSocketTest');
      sender.send('hello');
    });

    receiver.on('data', function () {
      receiver.close();
      sender.close();
      done();
    });
  });
});