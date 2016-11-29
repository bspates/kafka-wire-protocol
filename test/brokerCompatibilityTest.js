var SimpleClient = require('../lib/simpleClient');
var assert = require('assert');
var async = require('async');
var _ = require('lodash');

describe('When using the API -> ', function() {
  var client;
  var leader;
  var topic = 'mocha-test';

  var clientOpts = {
    clientId: 'mocha-test-client',
    host: process.env.BOOTSTRAP_HOST,
    port: process.env.BOOTSTRAP_PORT,
    timeout: 1000,
    acks: 1
  };

  before(function(done) {
    this.timeout(30000);

    var retryOpts = {
      times: 4,
      interval: 2000
    };

    // Wait for kafka brokers to be fully up.
    async.retry(retryOpts, (cb) => {
      try {
        client = new SimpleClient(clientOpts, cb);
      } catch(err) {
        cb(err);
      }
    }, (err) => {
      if(err) return done(err);

      // Validate brokers are available
      async.retry(retryOpts, (cb) => {
        client.request({
          name: 'Metadata',
          version: 0
        }, {
          topics: [
            {
              topic: topic
            }
          ]
        }, (err, result) => {
          if(err) return done(err);
          if(result.topicMetadata[0].topicError.code !== 0) {
            return cb(new Error(result.topicMetadata[0].topicError.message));
          }

          // find the broker/leader for the test topic
          leader = result.topicMetadata[0].partitions[0].leader;
          var broker = _.find(result.brokers, { nodeId: leader });

          clientOpts.host = broker.host;
          clientOpts.port = broker.port;

          // Create new client that is pointed at leader for test topic
          client = new SimpleClient(clientOpts, cb);
        });
      }, done);
    });
  });

  describe('Metadata', function() {
    it('should retrieve metadata about the brokers and topic specified', (done) => {
      client.request({
        name: 'Metadata',
        version: 0
      }, {
        topics: [
          {
            topic: topic
          }
        ]
      }, (err, result) => {
        if(err) return done(err);
        // Make sure the leader matches the earlier recorded one for the test topic
        assert.equal(result.topicMetadata[0].partitions[0].leader, leader);
        done();
      });
    });
  });

  describe('Produce', function() {
    it('should recieve UNKNOWN_TOPIC error when publishing to new topic', (done) => {
      client.produce([
        {
          topic: 'nope',
          data: [
            {
              partition: 0,
              recordSet: [
                {
                  value: "0"
                }
              ]
            }
          ]
        }
      ], (err, result) => {
        if(err) return done(err);
        assert.deepEqual(result.responses[0].partitionResponses[0].error, {
          "name": "UNKNOWN_TOPIC_OR_PARTITION",
          "code": 3,
          "retry": true,
          "message": "This server does not host this topic-partition."
        });
        done();
      });
    });

    it('should publish first message to topic', (done) => {
      client.produce([
        {
          topic: topic,
          data: [
            {
              partition: 0,
              recordSet: [
                {
                  value: "0"
                }
              ]
            }
          ]
        }
      ], (err, result) => {
        if(err) return done(err);
        var expectedResult = {
          "responses": [
             {
               "topic": "mocha-test",
               "partitionResponses": [
                 {
                   "baseOffset": 0,
                   "error": {
                     "name": "NONE",
                     "code": 0,
                     "retry": false,
                     "message": ""
                   },
                   "partition": 0,
                   "timestamp": -1
                 }
               ]
             }
           ],
           "throttleTime": 0
        };
        assert.deepEqual(result, expectedResult);
        done();
      });
    });
  });
});
