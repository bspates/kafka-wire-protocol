var net = require('net');
var Header = require('../api/header');
var types = require('../types');
var parser = require('../parser');

module.exports = class Connection {

  constructor(options) {
    this.options = options;
    // TODO: Don't continually add to array for every request
    this.requests = [];
    this.socket = null
  }

  connect(cb) {
    if(this.socket == null) {
      this.socket = Connection.connect(this.options.host, this.options.port, (socket) => {
        console.log('connected');
        cb(socket);
      });

      this.socket.on('data', this.onData.bind(this));
      this.socket.on('error', this.onError.bind(this));
      this.socket.on('end', this.onEnd.bind(this));

    } else {
      setImmediate(() => {
        cb(this.socket);
      });
    }
  }

  send(data, cb) {
    this.connect((socket) => {
      this.requests.push(cb);
      socket.write(data);
    });
  }

  onData(data) {
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
