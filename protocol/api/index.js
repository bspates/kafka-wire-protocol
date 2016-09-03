
/**
 * Encoding/Decoding of binary Kafka API messages as defined on:
 * http://kafka.apache.org/protocol.html#protocol_messages
 */
module.exports = {
  Metadata: require('./metadata'),
  Header: require('./header'),
  Produce: require('./produce')
};
