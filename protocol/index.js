var definitions = require('./definitions');
var types = require('./types');
var api = require('./api');

/**
 * Encoding/Decoding of binary Kafka API messages as defined on:
 * http://kafka.apache.org/protocol.html#protocol_messages
 */
module.exports = class Protocol {

  static decodeMetadata(buffer) {
    return api.Metadata.decodeResponse(buffer);
  }

  static encodeMetadata(correlationId, clientId, topics) {
    return api.Metadata.encodeRequest(correlationId, clientId, topics);
  }
};
