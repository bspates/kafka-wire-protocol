var types = require('./types');
var api = require('./api')
var ParseError = require('./errors/parse');
var crc32 = require('crc-32');

module.exports = class Parser {
  static encode(data, template, buffer, offset) {

    for(var i = 0; i < template.length; i++) {
      let entry = template[i];

      var key = Object.keys(entry);
      if(key.length !== 1) {
        throw new ParseError('Invalid api template');
      }
      key = key[0];

      switch(entry[key]) {
        case 'int32':
          offset = types.encodeInt32(data[key], buffer, offset);
          break;

        case 'int16':
          offset = types.encodeInt16(data[key], buffer, offset);
          break;

        case 'int64':
          offset = types.encodeInt64(data[key], buffer, offset);
          break;

        case 'int8':
          offset = types.encodeInt8(data[key], buffer, offset);
          break;

        case 'string':
          offset = types.encodeString(data[key], buffer, offset);
          break;

        case 'bytes':
          offset = types.encodeBytes(data[key], buffer, offset);
          break;

        case 'messageSet':
          offset = Parser.encodeMessage(data[key], buffer, offset);
          break;

        case 'array':
          offset = types.encodeArraySize(data[key], buffer, offset);
          i++;
          data[key].forEach((row) => {
            offset = Parser.encode(row, template[i], buffer, offset);
          });
          break;

        default:
          throw new ParseError('Invalid type: ' + entry[key]);
      }
    }

    return offset;
  }

  static decode(template, buffer, offset) {
    var result = {};

    for(var i = 0; i < template.length; i++) {
      let entry = template[i];

      var key = Object.keys(entry);
      if(key.length !== 1) {
        throw new ParseError('Invalid api template');
      }
      key = key[0];
      var value;
      switch(entry[key]) {
        case 'int32':
          [value, offset] = types.decodeInt32(buffer, offset);
          result[key] = value;
          break;

        case 'int16':
          [value, offset] = types.decodeInt16(buffer, offset);
          result[key] = value;
          break;

        case 'int64':
          [value, offset] = types.decodeInt64(buffer, offset);
          result[key] = value;
          break;

        case 'int8':
          [value, offset] = types.decodeInt8(buffer, offset);
          result[key] = value;
          break;

        case 'string':
          [value, offset] = types.decodeString(buffer, offset);
          result[key] = value;
          break;

        case 'bytes':
          [value, offset] = types.decodeBytes(buffer, offset);
          result[key] = value;
          break;

        case 'messageSet':
          // Take care of byte formatting
          var size;
          [size, offset] = types.decodeInt32(buffer, offset);

          // Start single message parsing
          const postCrcOffset = offset + api.Message.header_size;

          var message;
          [message, offset] = Parser.decode(api.Message.template, buffer, offset);

          if(crc32.buf(buffer.slice(postCrcOffset, offset)) !== message.crc) {
            throw new ParseError('Message CRC did not match calculated');
          }

          if(message.attributes !== 0) {
            throw new ParseError('Unsupported message encoding received');
          }

          message.value = message.value.toString();
          result[key] = message;
          break;

        case 'array':
          result[key] = [];
          var length;
          [length, offset] = types.decodeArraySize(buffer, offset);
          i++;
          for(var j = 0; j < length; j++) {
            [value, offset] = Parser.decode(template[i], buffer, offset);
            result[key].push(value);
          }
          break;

        default:
          throw new ParseError('Invalid type: ' + entry[key]);
      }
    }
    return [result, offset];
  }

  static encodeMessage(message, buffer, offset) {
    var timestamp = new Date().getUTCMilliseconds();

    let startOffset = offset;

    // leave room at start for offset, size, and crc
    let msgOffset = offset + api.Message.header_size;

    let msgStruct = {
      magicByte: 0, // version
      attributes: 0, //TODO: pass in attributes from options
      // timestamp: timestamp,
      key: null, //TODO: what is keys for?
      value: message
    };

    offset = Parser.encode(msgStruct, api.Message.body_template, buffer, msgOffset);

    // encode message offset
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

    return offset;
  }
};
