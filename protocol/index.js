Connection = require('./connection');
api = require('./api');

module.exports = class Protocol {

  constructor(options) {
    this.client = null;
    this.options = options;
  }

  connect(cb) {
    if(this.client == null) {
      this.client = new Connection(this.options, cb);
    } else {
      cb(this.client);
    }
  }

  metadata(topics, cb) {
    this.connect((client) => {
      console.log('one');
      var metaDataReq = api.Metadata.encodeRequest(this.client.requests.length, this.options.clientId, topics);
      this.client.send(metaDataReq, (err, data) => {
        console.log('two');

        var metaDataRes = api.Metadata.decodeResponse(data);
        cb(null, metaDataRes);
      });
    });
  }
};
