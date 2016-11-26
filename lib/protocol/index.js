var api = require('./binaryTemplates/api');
var parser = require('./parser');
var definitions = require('./definitions');
var types = require('./types');
var Header = require('./binaryTemplates/header');

// Always leave room for the size (int32) at the start of the request
const REQUEST_OFFSET = types.INT32_SIZE;

module.exports = class Protocol {

  /**
  @param object     options
  */
  constructor(options) {
    this.options = options;
  }

  /**
  Packages an api request into a binary buffer
  @param  mixed    apiOpt
  @param  mixed    data
  @param  Buffer   buffer
  @param  function cb(err, result)
  @return mixed    Buffer or False
  */
  request(apiOpt, data, buffer, offset, cb) {
    try {
      var apiDef = this.apiDef(apiOpt);
    } catch(err) {
      cb(err);
      return false;
    }

    let startOffset = offset;

    try {
      offset = parser.encode({
        apiKey: definitions.getApiKey(apiDef.name),
        version: apiDef.version,
        correlationId: this.getCorrelationId(),
        clientId: this.options.clientId
      }, Header.request, buffer, offset + REQUEST_OFFSET);

      offset = parser.encode(data, apiDef.request, buffer, offset);

      // Add size to begining of buffer
      types.encodeInt32(offset, buffer, startOffset);
    } catch (err) {
      cb(err);
      return false;
    }

    this.setCorrelation((err, data) => {
      var offset = 0;
      var result;
      [result, offset] = parser.decode(apiDef.response, data, offset);
      cb(null, result);
    });

    return buffer.slice(startOffset, offset);
  }

  /**
  Grab responseHandler method for binding to "on data" events on tcp connection
  @return function responseHandler bound to class instance context
  */
  get response() {
    return this.responseHandler.bind(this);
  }


  /**
  Called for "on data" event for tcp connection
  Will invoke callback correlated with response from Kafka broker.
  @param buffer data
  */
  responseHandler(data) {
    if(this.build) {
      if(data.length + this.curResponse.accumulated > this.curResponse.size) {
        throw new Error('Ending response length did match reported size');
      } else {
        this.curResponse.data = Buffer.concat([this.curResponse.data, data]);
        this.curResponse.accumulated += data.length;
      }

      if(this.curResponse.accumulated === this.curResponse.size) {
        this.build = false;
        let correlationMethod = this.getCorrelation(this.curResponse.header.correlationId);
        correlationMethod(null, this.curResponse.data);
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
      this.curResponse = {
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
  Handle apiOpt parsing and pull correct api request/response templates
  @throws Error
  @param  mixed  apiOpt
  @return object apiDef  request/response binary templates
  */
  apiDef(apiOpt) {
    if(apiOpt == null) throw new Error('Api options must be defined');

    var apiName = null;
    var apiVersion = -1;

    if(typeof apiOpt === 'object') {
      if(apiOpt.name == null) throw new Error('Api option name must be defined');
      apiName = apiOpt.name;

      if(apiOpt.version != null) {
        apiVersion = apiOpt.version;
      }
    } else if(typeof apiOpt === 'string') {
      apiName = apiOpt;
    }

    if(!(apiName in api)) throw new Error('Unknown api name: ' + apiName);

    var apiDef;
    if(api[apiName].versions) {

      // if no apiVersion is specified use the latest one
      if(apiVersion === -1) apiVersion = api[apiName].versions.length - 1;

      apiDef = api[apiName].versions[apiVersion];
      apiDef.version = apiVersion;
      apiDef.name = apiName;
    } else {
      apiDef = api[apiName];
    }

    return apiDef;
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
};
