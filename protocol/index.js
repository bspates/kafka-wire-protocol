Connection = require('./connection');
api = require('./api');

module.exports = class Protocol {

  constructor(options) {
    this.client = new Connection(options);
    this.options = options;
  }

  metadata(topics, cb) {
    var metaDataReq = api.Metadata.encodeRequest(this.client.requests.length, this.options.clientId, topics);
    this.client.send(metaDataReq, (data) => {
      var metaDataRes = api.Metadata.decodeResponse(data);
      cb(null, metaDataRes);
    });
  }
};
