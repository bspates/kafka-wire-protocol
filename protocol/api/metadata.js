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
    offset = types.encodeArray(offset, topics, types.encodeString, buffer);

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
    [offset, nodes] =  types.decodeArray(offset, Metadata.decodeNodes, buffer);
    [offset, topics] = types.decodeArray(offset, Metadata.decodeTopics, buffer);

    return {
      header: header,
      nodes: nodes,
      topics: topics
    };
  }

  static decodeNodes(offset, buffer) {
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
  }

  static decodeTopics(offset, buffer) {
    var topicError, topic, partitions;

    [offset, topicError] = types.decodeInt16(offset, buffer);
    [offset, topic] = types.decodeString(offset, buffer);
    [offset, partitions] = types.decodeArray(offset, Metadata.decodePartitions, buffer);

    return [offset, {
      topicError: topicError,
      topic: topic,
      partitions: partitions
    }];
  }

  static decodePartitions(offset, buffer) {
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
  }
}
