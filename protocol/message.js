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

const PRE_TMPL_SIZE = types.INT64_SIZE + types.INT32_SIZE + types.INT32_SIZE;

module.exports = class Message {
  static get template() {
    return [
      { magicByte: 'int8' },
      { attributes: 'int8' },
      { timestamp: 'int64' },
      { key: 'bytes' },
      { value: 'bytes' }
    ];
  }

  static get BASE_MSG_SIZE() {
    return BASE_MSG_SIZE;
  }

  static get PRE_TMPL_SIZE() {
    return PRE_TMPL_SIZE;
  }

  static encode(messageSet, buffer, offset) {
    messageSet.forEach((message) => {
      var timestamp = new Date().getUTCMilliseconds();

      let startOffset = offset;

      // leave room at start for offset, size, and crc
      let msgOffset = offset + PRE_TMPL_SIZE;

      let msgStruct = {
        magicByte: 0, // version
        attributes: 0, //TODO: pass in attributes from options
        // timestamp: timestamp,
        key: null, //TODO: what is keys for?
        value: message
      };

      offset = parser.encode(msgStruct, Message.template, buffer, msgOffset);

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
    var msgOffset, msgSize, crc, msgBuf;

    [msgOffset, offset] = types.decodeInt64(buffer, offset);
    console.log(msgOffset);
    [msgSize, offset] = types.decodeInt32(buffer, offset);
    [crc, offset] = types.decodeInt32(buffer, offset);

    msgBuf = buffer.slice(offset - 4, msgSize);

    if(crc32.buf(msgBuf) !== crc) {
      console.log(crc);
      console.log(crc32.buf(msgBuf));
      throw new ParseError('CRC did not match');
    }

    [value] = parser.decode(Message.template, msgBuf, 0);
    messages.push(value);
    return messages;
  }
}
