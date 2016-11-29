[![Build Status](https://travis-ci.org/bspates/kafkaesq.svg?branch=master)](https://travis-ci.org/bspates/kafkaesq)


kafka-wire-protocol
===================

A pure JS (ES6) implementation of the Kafka wire protocol as described [here](https://kafka.apache.org/protocol).

`npm install --save kafka-wire-protocol`

**This is not full Kafka client, just an implementation of the base tcp wire protocol**. This library focuses on supporting all APIs and all versions described in the wire protocol. The purpose of this library is to create a common building block for JS Kafka clients and as a general Kafka utility. This library does not work with Zookeeper directly.

Library Goals
-------------
* Use pure JS (ES6).
* Have as few external dependencies as possible
  * Currently only dependencies are a CRC32 library and a library to handle 64 bit integers in JS.
* Support all versions of Kafka APIs
  * Since there is no Zookeeper support in this library certain operations are not possible in older versions of Kafka that required communication with Zookeeper.
* Only implement the wire protocol. (Avoid scope creep).
  * Allow these decisions to be made independently of this library
      * Memory management
      * Connection management
      * ...

Examples
--------
### Using the protocol directly with your own tcp socket

```javascript
var net = require('net');
var { Protocol } = require('kafka-wire-protocol');

var protocol = new Protocol({
  clientId: 'my-test-kafka-client'
});

var socket = net.connect({
  host: 'localhost', // assuming your running Kafka locally
  port: 9092 // default Kafka port
}, () => {

  // Attach the protocol.response handler method to the
  // on 'data' event to accumulate and parse API responses
  socket.on('data', protocol.response);
  socket.on('error', () => console.log('error'));

  // Build Metadata request buffer
  var reqBuf = protocol.request(
    'Metadata', // Name of API
    { // data structured as specified by wire protocol docs
      // to be parsed into binary message format
      topics: [
        // Assuming you've created this topic already
        { topic: 'my-test-topic' }
      ]
    },
    Buffer.alloc(2400), // Buffer to parse data into
    0, // Starting offset to use in buffer provided

    // Callback to invoke once entire response is received
    // and parsed
    (err, result) => {
      if(err) throw err;

      // Send metadata response to stdout
      console.log(JSON.stringify(result, null, 2));
    }
  );

  socket.write(reqBuf, 'binary', () => {
    // Kafka brokers seem to need help understanding a
    // message is over
    socket.write("\n\n\n\n", 'utf8');
  });
});

```

### Doing the same thing with the SimpleClient
**WARNING SimpleClient is not for Production use**
```javascript
var { SimpleClient } = require('kafka-wire-protocol');

var client = new SimpleClient({
  host: 'localhost', // Assuming Kafka is running locally
  port: 9092, // Default Kafka port
  clientId: 'my-test-kafka-client',
  timeout: 1000,
  acks: 1 // Level of broker persistence guarantee
}, () => { // callback invoked once connection is made
  client.request(
    'Metadata', // API name
    { // Data to be sent
      topics: [
        { topic: 'my-test-topic' }
      ]
    }, (err, result) => {
      if(err) throw err;
      console.log(JSON.stringify(result, null, 2));
    }
  );
});

```
