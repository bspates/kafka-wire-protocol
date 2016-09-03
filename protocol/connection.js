var net = require('net');
var Header = require('./api/header');
var types = require('./types');
var parser = require('./parser');

module.exports = class Connection {

  constructor(options, cb) {
    this.options = options;

    // TODO: Don't continually add to array for every request
    this.requests = [];
    this.socket = Connection.connect(this.options.host, this.options.port, (socket) => {
      this.socket = socket;
      console.log('connected');
      cb(socket);
    });

    this.socket.on('data', this.onData.bind(this));
    this.socket.on('error', this.onError.bind(this));
    this.socket.on('end', this.onEnd.bind(this));
    this.socket.on('drain', () => console.log('drain'));
    this.socket.on('close', () => console.log('close'));
  }

  send(data, cb) {
    this.requests.push(cb);
    setImmediate(() => {
      this.socket.write(data, 'utf8', () => {
        console.log('written out');
        this.forceFlush(() => console.log('and done'));
      });
    });
  }

  forceFlush(cb) {
    this.socket.write("\n\n\n\n", 'utf8', cb);
  }

  onData(data) {
    setImmediate(() => {
      console.log('data');
      var header, offset, size;
      [size, offset] = types.decodeInt32(data, 0);

      if(size <= 0) {
        console.log('empty response');
        return;
      }

      [header, offset] = parser.decode(Header.response, data, offset);

      if(this.requests.length < header.correlationId) {
        return this.onError(new Error('Unknown correlation id received from broker'));
      }

      this.requests[header.correlationId](null, data.slice(offset));
    });
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
