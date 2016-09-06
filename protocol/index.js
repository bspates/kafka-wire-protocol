var Connection = require('./connection');
var api = require('./api');
var parser = require('./parser');
var definitions = require('./definitions');
var types = require('./types');

// Always leave room for the size (int32) at the start of the request
const REQUEST_OFFSET = 4;
const DEFAULT_BUFFER_SIZE = 2048;

module.exports = class Protocol {

  constructor(options, cb) {
    this.client = new Connection(options, cb);
    this.options = options;
  }

  send(data, apiDef, cb, options) {
    var buffer, offset;
    if(options) {
      buffer = options.buffer;
      offset = options.offset;
    } else {
      offset = 0;
      buffer = Buffer.alloc(DEFAULT_BUFFER_SIZE);
    }

    let startOffset = offset;

    try {
      offset = parser.encode({
        apiKey: definitions.getApiKey(apiDef.name),
        version: apiDef.version,
        correlationId: this.client.requests.length,
        clientId: this.options.clientId
      }, api.Header.request, buffer, offset + REQUEST_OFFSET);

      offset = parser.encode(data, apiDef.request, buffer, offset);

      // Add size to begining of buffer
      types.encodeInt32(offset, buffer, startOffset);
    } catch (err) {
      return cb(err);
    }

    this.client.send(buffer.slice(startOffset, offset), (err, data) => {
      var offset = 0;
      var result;
      [result, offset] = parser.decode(apiDef.response, data, offset);
      cb(null, result);
    });
  }

  metadata(topics, cb, options) {
    this.send(topics, api.Metadata, cb, options);
  }

  produce(topics, cb, options) {
    var request = {
      acks: this.options.acks,
      timeout: this.options.timeout,
      topics: topics
    };
    this.send(request, api.Produce, cb, options);
  }

  fetch(topics, cb, options) {
    var request = {
      replicaId: -1,
      maxWaitTime: this.options.timeout,
      minBytes: 2048,
      topics: topics
    };

    this.send(request, api.Fetch, (err, result) => {
      if(err) return cb(err);
      cb(null, result);
    }, options);
  }
};
