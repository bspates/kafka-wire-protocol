var types = require('../types');

module.exports = class Header {

  /**
   * @param  int    apiKey        request type
   * @param  int    correlationId unique id for request
   * @param  string clientId      user specified client id
   * @param  Buffer buffer        reference to buffer object
   * @param  int    offset        current offset in provided buffer
   * @return int    offset        new buffer offset aftet op
   */
  static encodeRequest(apiKey, correlationId, clientId, buffer, offset = 0) {
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
  static decodeResponse(buffer, offset = 0) {
    var size, correlationId;
    [offset, size] = types.decodeInt32(offset, buffer);
    [offset, correlationId] = types.decodeInt32(offset, buffer);
    return [{
      size: size,
      correlationId: correlationId
    }, offset];
  }
}
