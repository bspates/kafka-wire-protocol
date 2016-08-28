var net = require('net');
var Header = require('../api/header');

module.exports = class Connection {

  constructor(options, cb) {
    this.requests = [];
    this.socket = Connection.connect(options.host, options.port, (socket) => {
      console.log('connected');
      cb(socket);
    });

    this.socket.on('data', this.onData.bind(this));
    this.socket.on('error', this.onError.bind(this));
    this.socket.on('end', this.onEnd.bind(this));
  }

  send(data, cb) {
    this.requests.push((data) => {
      cb(null, data);
    });
    this.socket.write(data);
  }

  onData(data) {
    console.log('data');
    var header, offset;
    [header, offset] = Header.decodeResponse(data);
    if(this.requests.length < header.correlationId) {
      return this.onError(new Error('No correlation id found'));
    }

    this.requests[header.correlationId](data);
  }

  onError(err) {
    console.log(err);
  }

  onEnd() {
    console.log('end');
  }

  static connect(brokerHost, brokerPort, cb) {
    var socket;
    return socket = net.connect({
      host: brokerHost,
      port: brokerPort
    }, () => {
      cb(socket);
    });
  }
};
