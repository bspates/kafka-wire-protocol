var SimpleClient = require('../lib/simpleClient');
var assert = require('assert');

var metadataResp = {
  "brokers": [
    {
      "nodeId": 1,
      "host": "broker1",
      "port": 9092
    },
    {
      "nodeId": 0,
      "host": "broker0",
      "port": 9092
    }
  ],
  "topicMetadata": [
    {
      "topicError": {
        "name": "NONE",
        "code": 0,
        "retry": false,
        "message": ""
      },
      "topic": "mocha-test",
      "partitions": [
        {
          "partitionErrCode": 0,
          "partitionId": 0,
          "leader": 0,
          "replicas": 1,
          "isr": 0
        }
      ]
    }
  ]
};

describe('When using the API -> ', () => {
  var client;

  before((done) => {
    client = new SimpleClient({
      clientId: 'mocha-test-client',
      host: process.env.BOOTSTRAP_HOST,
      port: process.env.BOOTSTRAP_PORT,
      timeout: 1000,
      acks: 1
    }, done);
  });

  describe('Metadata', () => {
    it('should retrieve metadata about the brokers and topic specified', (done) => {
      client.request({
        name: 'Metadata',
        version: 0
      }, {
        topics: [
          {
            topic: 'mocha-test'
          }
        ]
      }, (err, result) => {
        if(err) return done(err);
        assert.deepEqual(result, metadataResp);
        done();
      });
    });
  });

  describe('Produce', () => {
    it('should recieve UNKNOWN_TOPIC error when publishing to new topic', () => {
      client.produce([
        {
          topic: 'nope',
          data: [
            {
              partition: 0,
              recordSet: [
                {
                  value: "0"
                },
                {
                  value: "1"
                },
                {
                  value: "2"
                }
              ]
            }
          ]
        }
      ], (err, result) => {
        if(err) return done(err);
        assert.deepEqual(result, {
          "responses": [
            {
              "topic": "woot",
              "partitionResponses": [
                {
                  "partition": 0,
                  "error": {
                    "name": "UNKNOWN_TOPIC_OR_PARTITION",
                    "code": 3,
                    "retry": true,
                    "message": "This server does not host this topic-partition."
                  },
                  "offset": -1,
                  "timestamp": -1
                }
              ]
            }
          ],
          "throttleTime": 0
        });
        done();
      });
    });
  });
});
