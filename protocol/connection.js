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
      this.socket.write(data, 'binary', () => {
        this.forceFlush();
      });
    });
  }

  forceFlush(cb) {
    this.socket.write("\n\n\n\n", 'utf8', cb);
  }

  onData(data) {

    if(this.build) {
      if(data.length + this.response.accumulated > this.response.size) {
        throw new Error('Ending response length did match reported size');
      } else {
        this.response.data = Buffer.concat([this.response.data, data]);
        this.response.accumulated += data.length;
      }

      if(this.response.accumulated === this.response.size) {
        // console.log('done');
        this.build = false;
        this.requests[this.response.header.correlationId](null, this.response.data);
      }
      return;
    }

    var header, offset, size;

    [size, offset] = types.decodeInt32(data, 0);

    [header, offset] = parser.decode(Header.response, data, offset);

    if(this.requests.length < header.correlationId) {
      return this.onError(new Error('Unknown correlation id received from broker'));
    }

    if(size !== data.length - 4) {
      this.build = true;
      this.response = {
        header: header,
        size: size,
        accumulated: data.length - 4,
        data: data.slice(offset)
      };
    } else {
      this.build = false;
      this.requests[header.correlationId](null, data.slice(offset));
    }
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
