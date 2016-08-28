var Header = require('./header');
var definitions = require('../definitions');
var types = require('../types');

const API_NAME = 'Metadata';

module.exports = class Metadata {

  /**
   * @param  int    correlationId unique id for request
   * @param  string clientId      user specified client id
   * @param  array  topics        list of topic names
   * @return buffer Buffer        encoded meta data request
   */
  static encodeRequest(correlationId, clientId, topics) {
    var buffer = new Buffer(64);

    var offset = 0;
    var apiKey = definitions.getApiKey(API_NAME);
    offset = Header.encodeRequest(apiKey, correlationId, clientId, buffer, 4);
    offset = types.encodeArray(topics, types.encodeString, buffer, offset);

    buffer.writeInt32BE(offset, 0);
    return buffer.slice(0, offset);
  }

  /**
   * @param  buffer Buffer
   * @return        object decoded meta data response
   */
  static decodeResponse(buffer) {
    var offset = 0;
    var header, nodes, topics;

    [header, offset] = Header.decodeResponse(buffer, offset);
    [nodes, offset] =  types.decodeArray(Metadata.decodeNodes, buffer, offset);
    [topics, offset] = types.decodeArray(Metadata.decodeTopics, buffer, offset);

    return {
      header: header,
      nodes: nodes,
      topics: topics
    };
  }

  /**
   * @param  buffer Buffer
   * @param  int    offset
   * @return array  [nodes, offset]
   */
  static decodeNodes(buffer, offset) {
    var nodeId, host, port;

    [nodeId, offset] = types.decodeInt32(buffer, offset);
    [host, offset] = types.decodeString(buffer, offset);
    [port, offset] = types.decodeInt32(buffer, offset);

    return [
      {
        nodeId: nodeId,
        host: host,
        port: port
      }, offset
    ];
  }

  /**
   * @param  buffer Buffer
   * @param  int    offset
   * @return array  [topics, offset]
   */
  static decodeTopics(buffer, offset) {
    var topicError, topic, partitions;

    [topicError, offset] = types.decodeInt16(buffer, offset);
    [topic, offset] = types.decodeString(buffer, offset);
    [partitions, offset] = types.decodeArray(Metadata.decodePartitions, buffer, offset);

    return [{
      topicError: topicError,
      topic: topic,
      partitions: partitions
    }, offset];
  }

  /**
   * @param  buffer Buffer
   * @param  int    offset
   * @return array  [partitions, offset]
   */
  static decodePartitions(buffer, offset) {
    var err, id, leader, replicas, isr;

    [err, offset] = types.decodeInt16(buffer, offset);
    [id, offset] = types.decodeInt32(buffer, offset);
    [leader, offset] = types.decodeInt32(buffer, offset);
    [replicas, offset] = types.decodeInt32(buffer, offset);
    [isr, offset] = types.decodeInt32(buffer, offset);

    return [{
      errorCode: err,
      id: id,
      leader: leader,
      replicas: replicas,
      isr: isr
    }, offset];
  }
}
