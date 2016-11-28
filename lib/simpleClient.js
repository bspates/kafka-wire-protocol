var net = require('net');

var Protocol = require('./protocol');
var api = require('./protocol/binaryTemplates/api');
var Message = require('./protocol/binaryTemplates/message');

const DEFAULT_BUFFER_SIZE = 64000;
const MESSAGE_VERSION = 1;

module.exports = class SimpleClient {

  constructor(options, cb) {
    this.options = options;
    this.options.acks = this.options.acks || 1;
    this.options.timeout = this.options.timeout || 1000;
    this.options.minFetchBytes = this.options.minFetchBytes || 64;
    this.options.clientId = this.options.clientId || 'simple-kafka-protocol';

    this.socket = net.connect({
      host: this.options.host,
      port: this.options.port
    }, () => {
      this.protocol = new Protocol(options);
      this.socket.on('data', this.protocol.response);
      this.socket.on('error', () => console.log('error'));
      this.socket.on('end', () => console.log('end'));
      this.socket.on('drain', () => console.log('drain'));
      this.socket.on('close', () => console.log('close'));
      cb();
    });
  }

  request(apiName, data, cb) {
    var reqBuf = this.protocol.request(apiName, data, Buffer.alloc(DEFAULT_BUFFER_SIZE), 0, cb);
    if(!reqBuf) return;
    setImmediate(() => {
      this.socket.write(reqBuf, 'binary', () => {
        this.socket.write("\n\n\n\n", 'utf8');
      });
    });
  }

  produce(topics, cb) {
    var request = {
      acks: this.options.acks,
      timeout: this.options.timeout,
      topics: topics.map((topic) => {
        topic.data = topic.data.map((data) => {
          data.recordSet = data.recordSet.map((message) => {
            return {
              magicByte: MESSAGE_VERSION,
              attributes: 0, // TODO: let this be passed in through message
              timestamp: new Date().getTime(),
              key: null,
              value: message.value
            };
          });
          return data;
        });
        return topic;
      })
    };

    this.request(api.Produce.name, request, cb);
  }

  fetch(topics, cb) {
    var request = {
      replicaId: -1,
      maxWaitTime: this.options.timeout,
      minBytes: this.options.minFetchBytes,
      topics: topics
    };

    this.request({
      name: api.Fetch.name,
      version: 0
    }, request, (err, result) => {
      if(err) return cb(err);
      cb(null, result);
    });
  }
};
