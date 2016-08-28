var definitions = require('./definitions');
var types = require('./types')

/**
 * Encoding/Decoding of binary Kafka API messages as defined on:
 * http://kafka.apache.org/protocol.html#protocol_messages
 */
module.exports = class Protocol {

  /**
   * @param  int    apiKey        request type
   * @param  int    correlationId unique id for request
   * @param  string clientId      user specified client id
   * @param  Buffer buffer        reference to buffer object
   * @param  int    offset        current offset in provided buffer
   * @return int    offset        new buffer offset aftet op
   */
  static encodeRequestHeader(apiKey, correlationId, clientId, buffer, offset = 0) {
    offset = buffer.writeInt16BE(apiKey, offset); // api key
    offset = buffer.writeInt16BE(0, offset); // version
    offset = buffer.writeInt32BE(correlationId, offset); // correlation id
    return types.encodeString(offset, clientId, buffer);
  }

  /**
   * @param  Buffer buffer           reference to buffer object
   * @param  int    offset           current offset in provided buffer
   * @return array  [result, offset] new buffer offset aftet op
   */
  static decodeResponseHeader(buffer, offset = 0) {
    var size, correlationId;
    [offset, size] = types.decodeInt32(offset, buffer);
    [offset, correlationId] = types.decodeInt32(offset, buffer);
    return [offset, {
      size: size,
      correlationId: correlationId
    }];
  }

  /**
   * @param  int    correlationId unique id for request
   * @param  string clientId      user specified client id
   * @param  array  topics        list of topic names
   * @return buffer Buffer        encoded meta data request
   */
  static encodeMetadata(correlationId, clientId, topics) {
    var buffer = new Buffer(64);

    var offset = 0;
    var apiKey = definitions.getApiKey('Metadata');
    offset = Protocol.encodeRequestHeader(apiKey, correlationId, clientId, buffer, 4);
    offset = types.encodeArray(offset, topics, types.encodeString, buffer);

    buffer.writeInt32BE(offset, 0);
    return buffer.slice(0, offset);
  }

  /**
   * @param  buffer Buffer
   * @return        object decoded meta data response
   */
  static decodeMetadata(buffer) {
    var offset = 0;
    var header, nodes, topics;

    [offset, header] = Protocol.decodeResponseHeader(buffer, offset);
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
      }];

    }, buffer);

    return {
      header: header,
      nodes: nodes,
      topics: topics
    };

  }
};
