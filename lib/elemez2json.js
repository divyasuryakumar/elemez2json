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

function get(token, epochTrue, done) {
  var lastKey, terminator = '';

  var dateFormatter = epochTrue ? "getTime" : "toISOString";

  function getFirehose(cb) {

    return request.get(getOptions(lastKey, token), function(e, res, body) {
      if (e || res.statusCode !== 200) {
        // ignore errors, sleep a bit and try again...
        return setTimeout(cb, 5000);
      }

      lastKey = body.lastKey

      _.each(body.events, function(event) {
        event.received = new Date(event.received)[dateFormatter]();
        event.raised = new Date(event.raised)[dateFormatter]();

        if (!event.schemeid) {
          return cb('NULL!', JSON.stringify(event));
        }

        console.log(terminator + JSON.stringify(event));
        terminator = ',';
      });

      return cb();
    });
  }

  function notfinished(e) {
    return lastKey;
  }

  return async.doWhilst(getFirehose, notfinished, done);
}

module.exports = function(argv, done) {
  var parsedArgs = minimist(argv.slice(2));

  if (!parsedArgs.token) {
    return done('you must pass a token using --token');
  }

  console.log('[');

  return get(parsedArgs.token, parsedArgs.e, function() {
    console.log(']');
    done();
  });
}
