var types = require('./types');
var api = require('./api');
var ParseError = require('./errors/parse');
var crc32 = require('buffer-crc32');
var defs = require('./definitions');

module.exports = class Parser {

  /**
  Parses an Object based on the template provided into a binary buffer
  Data object must contain the same keys in the same structure as the template
  The order of elements in the template array determines the order the corresponding data
  is encoded into the buffer
  Example Template/Data
  Template:
   [
     {apiKey: 'int16'},
     {version: 'int16'},
     {correlationId: 'int32'},
     {clientId: 'string'}
   ]

  Data:
   {
     apiKey: 0,
     version: 0,
     correlationId: 1
     clientId: 'test-client'
   }

  @param  Object data
  @param  Array  template
  @param  Buffer buffer
  @param  int    offset   where to start writing data in the buffer
  @return int    offset   offset after bytes written to buffer
  */
  static encode(data, template, buffer, offset) {

    for(var i = 0; i < template.length; i++) {
      let entry = template[i];

      var key = Object.keys(entry);
      if(key.length !== 1) {
        throw new ParseError('Invalid api template');
      }
      key = key[0];
      if(!(key in data)) {
        throw new ParseError('Missing required field: ' + key);
      }

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

        case 'messageSet': {

          var globalOffset = offset + types.INT32_SIZE;
          var sizeEndOffset = globalOffset;
          var msgOffset = 0;
          data[key].forEach((message) => {

            let bodyStartOffset = msgOffset + api.Message.header_size;
            let bodyEndOffset = Parser.encode(
              {
                magicByte: api.Message.version,
                attributes: 0, // TODO: let this be passed in through message
                timestamp: new Date().getTime(),
                key: null,
                value: message.value
              },
              api.Message.body,
              buffer,
              bodyStartOffset + globalOffset
            ) - globalOffset;

            Parser.encode(
              {
                offset: 0,
                size: types.INT32_SIZE + bodyEndOffset - bodyStartOffset,
                crc: crc32.signed(buffer.slice(bodyStartOffset + globalOffset, bodyEndOffset + globalOffset))
              },
              api.Message.header,
              buffer,
              msgOffset + globalOffset
            ) - globalOffset;

            msgOffset = bodyEndOffset;
          });

          globalOffset += msgOffset;
          types.encodeInt32(globalOffset - sizeEndOffset, buffer, offset);
          offset = globalOffset;
          break;
        }

        case 'array':
          offset = types.encodeArraySize(data[key], buffer, offset);
          i++;
          data[key].forEach((row) => {
            offset = Parser.encode(row, template[i], buffer, offset);
          });
          break;

        case 'error':
          if(!data[key].code) {
            throw new ParseError('Attempting to encode error object missing the code field');
          }

          offset = types.encodeInt16(data[key].code, buffer, offset);
          break;

        case 'object': {
          i++;
          offset = Parser.encode(data[key], template[i], buffer, offset);
          break;
        }

        default:
          throw new ParseError('Invalid encode type: ' + entry[key]);
      }
    }

    return offset;
  }

  /**
  Parses a binary buffer into a complex object based on the template provided
  The order of elements in the template array determines the order of data parsed from the
  buffer
  @param object template
  @param Buffer buffer
  @param int    offset
  */
  static decode(template, buffer, offset) {
    var result = {};

    for(var i = 0; i < template.length; i++) {
      let entry = template[i];

      var key = Object.keys(entry);
      if(key.length !== 1) {
        throw new ParseError('Invalid api template');
      }
      key = key[0];

      switch(entry[key]) {
        case 'int32':
          [result[key], offset] = types.decodeInt32(buffer, offset);
          break;

        case 'int16':
          [result[key], offset] = types.decodeInt16(buffer, offset);
          break;

        case 'int64':
          [result[key], offset] = types.decodeInt64(buffer, offset);
          break;

        case 'int8':
          [result[key], offset] = types.decodeInt8(buffer, offset);
          break;

        case 'string':
          [result[key], offset] = types.decodeString(buffer, offset);
          break;

        case 'bytes':
          [result[key], offset] = types.decodeBytes(buffer, offset);
          break;

        case 'messageSet': {
          // Take care of byte formatting
          var size;
          [size, offset] = types.decodeInt32(buffer, offset);
          if(size <= 0) {
            result[key] = null;
            break;
          }

          let endOffset = offset + size;
          var messages = [];
          while(endOffset > offset) {
            // Start single message parsing
            let postCrcOffset = offset + api.Message.header_size;

            var message;
            [message, offset] = Parser.decode(api.Message.template, buffer, offset);

            if(crc32.signed(buffer.slice(postCrcOffset, offset)) !== message.crc) {
              throw new ParseError('Message CRC did not match calculated');
            }

            if(message.attributes !== 0) {
              throw new ParseError('Unsupported message encoding received');
            }

            message.value = message.value.toString();
            messages.push(message);
          }
          result[key] = messages;
          break;
        }

        case 'array': {
          result[key] = [];
          var length;
          [length, offset] = types.decodeArraySize(buffer, offset);
          i++;
          var value;
          for(var j = 0; j < length; j++) {
            [value, offset] = Parser.decode(template[i], buffer, offset);
            result[key].push(value);
          }
          break;
        }

        case 'error': {
          var errCode;
          [errCode, offset] = types.decodeInt16(buffer, offset);
          result[key] = defs.ERRORS[errCode + 1];
          break;
        }

        case 'object': {
          i++;
          [result[key], offset] = Parser.decode(template[i], buffer, offset);
          break;
        }

        default:
          throw new ParseError('Invalid decode type: ' + entry[key]);
      }
    }
    return [result, offset];
  }
};
