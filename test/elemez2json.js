var _ = require('lodash'),
    expect = require('chai').expect,
    request = require('request'),
    sinon = require('sinon'),
    elemez2json = require('../lib/elemez2json');

describe('elemez2json', function() {
  var argv;
  beforeEach(function() {
    argv = ['node', 'elemez2json', '--token', 'TOKEN'];
  });

  it('should return error if you do not provide token', function(done) {
    argv.splice(2, 2);
    elemez2json(argv, function(e) {
      expect(e).to.equal('you must pass a token using --token');
      return done();
    });
  });

  describe('params start', function() {

    beforeEach(function() {
      sinon.stub(request, 'get');

      var response = {
        lastKey: null,
      events: []
      };
      request.get.onCall(0).yields(null, null, response);
    });

    afterEach(function() {
      request.get.restore();
    });

    it('should accept an optional start date parsable by JavaScript new Date constructor', function(done) {
      argv = ['node', 'elemez2json', '--token', 'TOKEN', '--start', '2014-09-09'];
      elemez2json(argv, function(e) {
        expect(e).to.not.be.a.null;
        return done();
      });
    });

    it('should error if the start date is not parsable', function(done) {
      argv = ['node', 'elemez2json', '--token', 'TOKEN', '--start', 'clearly-not-a-date'];
      elemez2json(argv, function(e) {
        expect(e).to.equal('start is not a valid date');
        return done();
      });
    });

  });

  describe('params end', function() {

    beforeEach(function() {
      sinon.stub(request, 'get');

      var response = {
        lastKey: null,
      events: []
      };
      request.get.onCall(0).yields(null, null, response);
    });

    afterEach(function() {
      request.get.restore();
    });

    it('should accept an optional end date parsable by JavaScript new Date constructor', function(done) {
      argv = ['node', 'elemez2json', '--token', 'TOKEN', '--end', '2014-09-09'];
      elemez2json(argv, function(e) {
        expect(e).to.not.be.a.null;
        return done();
      });
    });

    it('should error if the end date is not parsable', function(done) {
      argv = ['node', 'elemez2json', '--token', 'TOKEN', '--end', 'clearly-not-a-date'];
      elemez2json(argv, function(e) {
        expect(e).to.equal('end is not a valid date');
        return done();
      });
    });

  });

  describe('with one page of data', function() {
    beforeEach(function() {
      sinon.stub(console, 'log');
      sinon.stub(request, 'get');
      var events = _.map(_.range(0, 5), function(i) {
        return {
          key: new Buffer(new Date(2014, i, 1).toISOString().substr(0,19)+"Z0000000000000000").toString('base64'),
          scheme: 'sch' + i,
          schemeid: 'sid' + i,
          received: Date.UTC(2014, i, 1),
          raised: Date.UTC(2014, i, 2),
          sender: 'sdr' + i,
          source: 'src' + i,
          type: 't' + i,
          data: {
            a: i
          }
        };
      });

      var response0 = {
        lastKey: new Buffer(new Date('2014-01-01').toISOString().substr(0,19)+"Z0000000000000000").toString('base64'),
        events: events
      };
      var response1 = {
        lastKey: null,
        events: []
      };
      request.get.onCall(0).yields(null, null, response0);
      request.get.onCall(1).yields(null, null, response1);
    });

    afterEach(function() {
      console.log.restore();
      request.get.restore();
    });

    it('should call request correctly', function(done) {
      return elemez2json(argv, function() {
        var options0 = {
          url: 'https://elemez.com/raw/1',
             json: true,
             headers: {
               token: 'TOKEN'
             }
        };
        expect(request.get.args[0][0]).to.deep.equal(options0);
        var options1 = {
          url: 'https://elemez.com/raw/1',
             json: true,
             headers: {
               token: 'TOKEN'
             },
             qs: {
               lastkey: 'X',
             limit: 1000
             }
        };
        return done();
      });
    });

    it('should console.log the data as json', function(done) {
      return elemez2json(argv, function() {
        expect(console.log.callCount).to.equal(7);
        expect(console.log.args[0][0]).to.equal('[');
        expect(console.log.args[1][0]).to.deep.equal("{\"key\":\"MjAxNC0wMS0wMVQwMDowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch0\",\"schemeid\":\"sid0\",\"received\":\"2014-01-01T00:00:00.000Z\",\"raised\":\"2014-01-02T00:00:00.000Z\",\"sender\":\"sdr0\",\"source\":\"src0\",\"type\":\"t0\",\"data\":{\"a\":0}}");
        expect(console.log.args[2][0]).to.deep.equal(",{\"key\":\"MjAxNC0wMi0wMVQwMDowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch1\",\"schemeid\":\"sid1\",\"received\":\"2014-02-01T00:00:00.000Z\",\"raised\":\"2014-02-02T00:00:00.000Z\",\"sender\":\"sdr1\",\"source\":\"src1\",\"type\":\"t1\",\"data\":{\"a\":1}}");
        expect(console.log.args[3][0]).to.deep.equal(",{\"key\":\"MjAxNC0wMy0wMVQwMDowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch2\",\"schemeid\":\"sid2\",\"received\":\"2014-03-01T00:00:00.000Z\",\"raised\":\"2014-03-02T00:00:00.000Z\",\"sender\":\"sdr2\",\"source\":\"src2\",\"type\":\"t2\",\"data\":{\"a\":2}}");
        expect(console.log.args[4][0]).to.deep.equal(",{\"key\":\"MjAxNC0wMy0zMVQyMzowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch3\",\"schemeid\":\"sid3\",\"received\":\"2014-04-01T00:00:00.000Z\",\"raised\":\"2014-04-02T00:00:00.000Z\",\"sender\":\"sdr3\",\"source\":\"src3\",\"type\":\"t3\",\"data\":{\"a\":3}}");
        expect(console.log.args[5][0]).to.deep.equal(",{\"key\":\"MjAxNC0wNC0zMFQyMzowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch4\",\"schemeid\":\"sid4\",\"received\":\"2014-05-01T00:00:00.000Z\",\"raised\":\"2014-05-02T00:00:00.000Z\",\"sender\":\"sdr4\",\"source\":\"src4\",\"type\":\"t4\",\"data\":{\"a\":4}}");
        expect(console.log.args[6][0]).to.equal(']');
        return done();
      });
    });

    it('should console.log the data as far in time as specified by start parameter', function(done) {
      argv.push('--start');
      argv.push('2014-03-02');
      return elemez2json(argv, function() {
        expect(console.log.callCount).to.equal(4);
        expect(console.log.args[0][0]).to.equal('[');
        expect(console.log.args[1][0]).to.deep.equal("{\"key\":\"MjAxNC0wMy0zMVQyMzowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch3\",\"schemeid\":\"sid3\",\"received\":\"2014-04-01T00:00:00.000Z\",\"raised\":\"2014-04-02T00:00:00.000Z\",\"sender\":\"sdr3\",\"source\":\"src3\",\"type\":\"t3\",\"data\":{\"a\":3}}");
        expect(console.log.args[2][0]).to.deep.equal(",{\"key\":\"MjAxNC0wNC0zMFQyMzowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch4\",\"schemeid\":\"sid4\",\"received\":\"2014-05-01T00:00:00.000Z\",\"raised\":\"2014-05-02T00:00:00.000Z\",\"sender\":\"sdr4\",\"source\":\"src4\",\"type\":\"t4\",\"data\":{\"a\":4}}");
        expect(console.log.args[3][0]).to.equal(']');
        return done();
      });
    });

    it('should format raised and receveid times using epoch time if the -e flag is passed', function(done) {
      argv.push('-e');
      return elemez2json(argv, function() {
        expect(console.log.callCount).to.equal(7);
        expect(console.log.args[0][0]).to.equal('[');
        expect(console.log.args[1][0]).to.deep.equal("{\"key\":\"MjAxNC0wMS0wMVQwMDowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch0\",\"schemeid\":\"sid0\",\"received\":1388534400000,\"raised\":1388620800000,\"sender\":\"sdr0\",\"source\":\"src0\",\"type\":\"t0\",\"data\":{\"a\":0}}");
        expect(console.log.args[2][0]).to.deep.equal(",{\"key\":\"MjAxNC0wMi0wMVQwMDowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch1\",\"schemeid\":\"sid1\",\"received\":1391212800000,\"raised\":1391299200000,\"sender\":\"sdr1\",\"source\":\"src1\",\"type\":\"t1\",\"data\":{\"a\":1}}");
        expect(console.log.args[3][0]).to.deep.equal(",{\"key\":\"MjAxNC0wMy0wMVQwMDowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch2\",\"schemeid\":\"sid2\",\"received\":1393632000000,\"raised\":1393718400000,\"sender\":\"sdr2\",\"source\":\"src2\",\"type\":\"t2\",\"data\":{\"a\":2}}");
        expect(console.log.args[4][0]).to.deep.equal(",{\"key\":\"MjAxNC0wMy0zMVQyMzowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch3\",\"schemeid\":\"sid3\",\"received\":1396310400000,\"raised\":1396396800000,\"sender\":\"sdr3\",\"source\":\"src3\",\"type\":\"t3\",\"data\":{\"a\":3}}");
        expect(console.log.args[5][0]).to.deep.equal(",{\"key\":\"MjAxNC0wNC0zMFQyMzowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch4\",\"schemeid\":\"sid4\",\"received\":1398902400000,\"raised\":1398988800000,\"sender\":\"sdr4\",\"source\":\"src4\",\"type\":\"t4\",\"data\":{\"a\":4}}");
        expect(console.log.args[6][0]).to.equal(']');
        return done();
      });
    });

    it.skip('should read lastKey from a given file, and print the whole file after the firehose', function(done) {
      argv.push('--append');
      argv.push('fixtures/sample-file');
      return elemez2json(argv, function() {

        process.stdout.write('HERE\n')
        expect(console.log.callCount).to.equal(5);
        expect(console.log.args[0][0]).to.equal('[');
        expect(console.log.args[1][0]).to.deep.equal("{\"key\":\"MjAxNC0wMy0wMVQwMDowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch2\",\"schemeid\":\"sid2\",\"received\":\"2014-03-01T00:00:00.000Z\",\"raised\":\"2014-03-02T00:00:00.000Z\",\"sender\":\"sdr2\",\"source\":\"src2\",\"type\":\"t2\",\"data\":{\"a\":42}}");
        expect(console.log.args[2][0]).to.deep.equal(",{\"key\":\"MjAxNC0wMy0zMVQyMzowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch3\",\"schemeid\":\"sid3\",\"received\":\"2014-04-01T00:00:00.000Z\",\"raised\":\"2014-04-02T00:00:00.000Z\",\"sender\":\"sdr3\",\"source\":\"src3\",\"type\":\"t3\",\"data\":{\"a\":3}}");
        expect(console.log.args[3][0]).to.deep.equal(",{\"key\":\"MjAxNC0wNC0zMFQyMzowMDowMFowMDAwMDAwMDAwMDAwMDAw\",\"scheme\":\"sch4\",\"schemeid\":\"sid4\",\"received\":\"2014-05-01T00:00:00.000Z\",\"raised\":\"2014-05-02T00:00:00.000Z\",\"sender\":\"sdr4\",\"source\":\"src4\",\"type\":\"t4\",\"data\":{\"a\":4}}");
        expect(console.log.args[4][0]).to.equal(']');
        return done();
      });

    });

  });

});
