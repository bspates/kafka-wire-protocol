var crc32 = require('crc-32');
var defintions = require('./definitions');
var types = require('./types')

module.exports = class Protocol {

  static encodeRequestHeader(apiKey, offset, reqId, buffer) {
    offset = buffer.writeInt16BE(apiKey, offset); // api key
    offset = buffer.writeInt16BE(0, offset); // version
    offset = buffer.writeInt32BE(reqId, offset); // correlation id
    var clientId = "brons-test-client";
    return types.encodeString(offset, clientId, buffer);
  }

  static getApiKey(type) {
    return defintions.API_KEYS.indexOf(type);
  }

  static encodeMetadata(con, reqId) {
    var apiKey = Protocol.getApiKey('Metadata');
    var buf = new Buffer(64);
    var offset = Protocol.encodeRequestHeader(apiKey, 4, reqId, buf);
    offset = types.encodeArray(offset, [
      'woot'
    ], types.encodeString, buf);

    buf.writeInt32BE(offset, 0);

    con.write(buf.slice(0, offset), () => {
      console.log('written');
    });
  }

  static decodeResponseHeader(offset, buffer) {
    var size, correlationId;
    [offset, size] = types.decodeInt32(offset, buffer);
    [offset, correlationId] = types.decodeInt32(offset, buffer);
    return [offset, {
      size: size,
      correlationId: correlationId
    }];
  }

  static decodeMetadata(buffer) {
    var offset = 0;
    var header, nodes, topics;

    [offset, header] = Protocol.decodeResponseHeader(offset, buffer);
    [offset, nodes] =  types.decodeArray(offset, (offset, buffer) => {
      var nodeId, host, port;
      [offset, nodeId] = types.decodeInt32(offset, buffer);
      [offset, host] = types.decodeString(offset, buffer);
      [offset, port] = types.decodeInt32(offset, buffer);
      return [
        offset,
        {
          nodeId: nodeId,
          host: host,
          port: port
        }
      ];
    }, buffer);

    [offset, topics] = types.decodeArray(offset, (offset, buffer) => {

      var topicError, topic, partitions;
      [offset, topicError] = types.decodeInt16(offset, buffer);
      [offset, topic] = types.decodeString(offset, buffer);

      [offset, partitions] = types.decodeArray(offset, (offset, buffer) => {
        var err, id, leader, replicas, isr;
        [offset, err] = types.decodeInt16(offset, buffer);
        [offset, id] = types.decodeInt32(offset, buffer);
        [offset, leader] = types.decodeInt32(offset, buffer);
        [offset, replicas] = types.decodeInt32(offset, buffer);
        [offset, isr] = types.decodeInt32(offset, buffer);
        return [offset, {
          errorCode: err,
          id: id,
          leader: leader,
          replicas: replicas,
          isr: isr
        }];

      }, buffer);
      return [offset, {
        topicError: topicError,
        topic: topic,
        partitions: partitions
      }]
    }, buffer);
    return {
      nodes: nodes,
      topics: topics
    };
  }
};
