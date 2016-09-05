var parser = require('./parser');
var types = require('./types');
var crc32 = require('crc-32');
var ParseError = require('./errors/parse');

const BASE_MSG_SIZE = types.INT64_SIZE + // offset
  types.INT32_SIZE + // size
  types.INT32_SIZE + // crc
  types.INT8_SIZE + // magicByte
  types.INT8_SIZE + // attributes
  types.INT64_SIZE; // timestamp

const MSG_HEADER_SIZE = types.INT64_SIZE + types.INT32_SIZE + types.INT32_SIZE;

module.exports = class Message {

  static get BASE_MSG_SIZE() {
    return BASE_MSG_SIZE;
  }

  static encode(messageSet, buffer, offset) {
    messageSet.forEach((message) => {
      var timestamp = new Date().getUTCMilliseconds();

      let startOffset = offset;

      // leave room at start for offset, size, and crc
      let msgOffset = offset + MSG_HEADER_SIZE;

      let msgStruct = {
        magicByte: 0, // version
        attributes: 0, //TODO: pass in attributes from options
        // timestamp: timestamp,
        key: null, //TODO: what is keys for?
        value: message
      };

      offset = parser.encode(msgStruct, [
        { magicByte: 'int8' },
        { attributes: 'int8' },
        { timestamp: 'int64' },
        { key: 'bytes' },
        { value: 'bytes' }
      ], buffer, msgOffset);

      // encode message offset
      // var tmpOffset = types.encodeInt64(0, buffer, startOffset);
      var tmpOffset = startOffset + types.INT64_SIZE;

      // encode message size
      tmpOffset = types.encodeInt32(offset - startOffset, buffer, tmpOffset);

      // encode crc
      tmpOffset = types.encodeInt32(
        crc32.buf(buffer.slice(msgOffset, offset)),
        buffer,
        tmpOffset
      );

      if(tmpOffset !== msgOffset) {
        throw new ParseError('Invalid message header length');
      }
    });

    return offset;
  }

  static decode(buffer, offset) {
    const postCrcOffset = offset + MSG_HEADER_SIZE;

    var message;
    [message, offset] = parser.decode([
      { offset: 'int64' },
      { size: 'int32' },
      { crc: 'int32' },
      { magicByte: 'int8' },
      { attributes: 'int8' },
      { timestamp: 'int64' },
      { key: 'bytes' },
      { value: 'bytes' }
    ], buffer, offset);

    if(crc32.buf(buffer.slice(postCrcOffset, offset)) !== message.crc) {
      throw new ParseError('CRC did not match');
    }

    message.value = message.value.toString();

    return message;
  }
}
