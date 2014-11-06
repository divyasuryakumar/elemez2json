var minimist = require('minimist'),
    request = require('request'),
    async = require('async'),
    LineByLineReader = require('line-by-line'),
    _ = require('lodash');

function getOptions(lastKey, token) {
  var options = {
    url: 'https://elemez.com/raw/1',
    json: true,
    headers: {
      token: token
    }
  };

  if (lastKey) {
    options.qs = {
      lastkey: lastKey,
      limit: 1000
    };
  }

  return options;
}

function get(token, startKey, endKey, epochTrue, done) {
  var lastKey, terminator = '';
  console.log('[');

  lastKey = endKey;

  function getFirehose(cb) {

    return request.get(getOptions(lastKey, token), function(e, res, body) {
      if (e) {        
        // ignore errors, sleep a bit and try again...
        return setTimeout(cb, 20000);
      }

      var startKeyString, lastKeyString;
      if (startKey) {
        startKeyString = new Buffer(startKey, 'base64').toString('ascii');
      }

      lastKey = body.lastKey
      if (lastKey) {
        lastKeyString = new Buffer(lastKey, 'base64').toString('ascii');
      }

    var lastRun = false;
    if (lastKeyString <= startKeyString) {
      lastRun = true;
    }
    if (!lastKeyString) {
      lastRun = true;
    }

    _.each(body.events, function(event) {
      if (!lastRun || new Buffer(event.key, 'base64').toString('ascii') > startKeyString) {

        if (epochTrue) {
          event.received = new Date(event.received).getTime();
          event.raised = new Date(event.raised).getTime();
        } else {
          event.received = new Date(event.received).toISOString();
          event.raised = new Date(event.raised).toISOString();
        }

        if(!event.schemeid) {
          return cb('NULL!', JSON.stringify(event));
        }

        console.log(terminator + JSON.stringify(event));
        terminator = ',';
      }
    });

    return cb();
    });
  }

  function finished(e) {
    if (!lastKey) {
      return false;
    }

    if (!startKey) {
      return true;
    }

    if (new Buffer(lastKey, 'base64').toString('ascii') < new Buffer(startKey, 'base64').toString('ascii')) {
      return false;
    }

    return true;
  }

  return async.doWhilst(getFirehose, finished, function() {
    process.stdout.write(lastKey + ' ' + startKey + '\n')
    return done();
  });
}

module.exports = function(argv, done) {
  var parsedArgs = minimist(argv.slice(2));

  if (!parsedArgs.token) {
    return done('you must pass a token using --token');
  }

  var startKey;
  if (parsedArgs.start) {
    if (isNaN(new Date(parsedArgs.start).getTime())) {
      return done('start is not a valid date');
    }
    startKey = new Buffer(new Date(parsedArgs.start).toISOString().substr(0,19)+"Z0000000000000000").toString('base64');
  }

  var endKey;
  if (parsedArgs.end) {
    if (isNaN(new Date(parsedArgs.end).getTime())) {
      return done('end is not a valid date');
    }
    endKey = new Buffer(new Date(parsedArgs.end).toISOString().substr(0,19)+"Z0000000000000000").toString('base64');
  }

  console.log('[');

  var lr;
  if (parsedArgs.append) {
    lr = new LineByLineReader(parsedArgs.append);
    var lineNumber = 1;
    lr.on('line', function(line) {
      if (lineNumber==1) {
        lineNumber++;
      } else {
        if (lineNumber==2) {
          lr.pause();
          lineNumber++;
          var parsedObject = JSON.parse(line);
          get(parsedArgs.token, parsedObject.key, endKey, parsedArgs.e, function() {
            console.log(","+line);
            lr.resume();
          });
        } else {
          console.log(line);
        }
      }
    });
  } else {
    get(parsedArgs.token, startKey, endKey, parsedArgs.e, function() {
      console.log(']');
    });
  }
}
