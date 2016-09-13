var api = require('./api');
var parser = require('./parser');
var definitions = require('./definitions');
var types = require('./types');
var Header = require('./api/header');

// Always leave room for the size (int32) at the start of the request
const REQUEST_OFFSET = 4;
const DEFAULT_BUFFER_SIZE = 10000;

module.exports = class Protocol {

  constructor(conn, options) {
    this.client = conn;
    this.client.on('data', this.handleResponse.bind(this));
    this.options = options;
  }

  handleResponse(data) {

    if(this.build) {
      if(data.length + this.response.accumulated > this.response.size) {
        throw new Error('Ending response length did match reported size');
      } else {
        this.response.data = Buffer.concat([this.response.data, data]);
        this.response.accumulated += data.length;
      }

      if(this.response.accumulated === this.response.size) {
        this.build = false;
        let correlationMethod = this.getCorrelation(this.response.header.correlationId);
        correlationMethod(null, this.response.data);
      }
      return;
    }

    var header, offset, size;

    [size, offset] = types.decodeInt32(data, 0);

    [header, offset] = parser.decode(Header.response, data, offset);

    if(this.requestCount < header.correlationId) {
      return this.onError(new Error('Unknown correlation id received from broker'));
    }

    let bufLength = data.length - types.INT32_SIZE;
    if(size !== bufLength) {
      this.build = true;
      this.response = {
        header: header,
        size: size,
        accumulated: bufLength,
        data: data.slice(offset)
      };
    } else {
      this.build = false;
      let correlationMethod = this.getCorrelation(header.correlationId);
      correlationMethod(null, data.slice(offset));
    }
  }

  /**
  @param  function cb(err, result)
  @return int      correlationId
  */
  setCorrelation(cb) {
    if(!this.requests) {
      this.requests = new Array(10);
      this.requestCount = 0;
    }

    this.requests[this.requestCount % 10] = cb;
    this.requestCount++;
    return this.requestCount - 1;
  }

  /**
  @param  int      correlationId
  @return function
  */
  getCorrelation(correlationId) {
    return this.requests[correlationId % 10];
  }

  /**
  @return int current correlationId
  */
  getCorrelationId() {
    return this.requestCount;
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
        correlationId: this.getCorrelationId(),
        clientId: this.options.clientId
      }, api.Header.request, buffer, offset + REQUEST_OFFSET);

      offset = parser.encode(data, apiDef.request, buffer, offset);

      // Add size to begining of buffer
      types.encodeInt32(offset, buffer, startOffset);
    } catch (err) {
      return cb(err);
    }

    this.setCorrelation((err, data) => {
      var offset = 0;
      var result;
      [result, offset] = parser.decode(apiDef.response, data, offset);
      cb(null, result);
    });

    this.client.send(buffer.slice(startOffset, offset));
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
