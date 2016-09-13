var net = require('net');
var EventEmitter = require('events');

module.exports = class Connection extends EventEmitter {

  constructor(options, cb) {
    super();
    this.options = options;

    this.socket = Connection.connect(this.options.host, this.options.port, (socket) => {
      this.socket = socket;
      console.log('connected');
      cb();
    });

    this.socket.on('data', this.onData.bind(this));
    this.socket.on('error', this.onError.bind(this));
    this.socket.on('end', this.onEnd.bind(this));
    this.socket.on('drain', () => console.log('drain'));
    this.socket.on('close', () => console.log('close'));
  }

  send(data) {
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
    this.emit('data', data);
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
