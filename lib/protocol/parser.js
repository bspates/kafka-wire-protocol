var types = require('./types');
var Message = require('./binaryTemplates/message');
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

    if(!data) throw new ParseError('Data to encode must be defined');

    for(var i = 0; i < template.length; i++) {
      let entry = template[i];

      var key = Object.keys(entry);
      if(key.length !== 1) {
        throw new ParseError('Invalid api template');
      }
      key = key[0];
      try {
        if(!(key in data)) {
          throw new Error('Missing required field: ' + key);
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
            let msgVersion = message.magicByte;
            let tmpl = Message.versions[msgVersion];

            let headerOffset = msgOffset + Message.preHeaderSize;

            message.crc = 0; // Stub CRC calc until later

            // Encode message with empty crc
            let bodyEndOffset = Parser.encode(
              message,
              tmpl.template,
              buffer,
              headerOffset + globalOffset
            ) - globalOffset;

            // Encode pre header for message
            Parser.encode(
              {
                offset: 0, // Always set to Zero unless doing recursive message compression
                messageSize: bodyEndOffset - headerOffset,
              },
              Message.preHeader,
              buffer,
              msgOffset + globalOffset
            );

            // Backfill crc
            let postCrcOffset = headerOffset + types.INT32_SIZE + globalOffset;
            let crc = crc32.signed(buffer.slice(postCrcOffset, bodyEndOffset + globalOffset));
            types.encodeInt32(crc, buffer, headerOffset + globalOffset);

            msgOffset = bodyEndOffset;
          });

          globalOffset += msgOffset;

          // Set byte size
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
            throw new Error('Attempting to encode error object missing the code field');
          }

          offset = types.encodeInt16(data[key].code, buffer, offset);
          break;

        case 'object': {
          i++;
          offset = Parser.encode(data[key], template[i], buffer, offset);
          break;
        }

        default:
          throw new Error('Invalid encode type: ' + entry[key]);

        }
      } catch(err) {
        throw new ParseError(err, key);
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
      try {
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
          var byteSize;
          [byteSize, offset] = types.decodeInt32(buffer, offset);
          if(byteSize <= 0) {
            result[key] = null;
            break;
          }

          var endOffset = offset + byteSize;
          var messages = [];
          while(endOffset > offset) {

            // Ensure message size fits within current buffer
            var preHeader;
            [preHeader, offset] = Parser.decode(Message.preHeader, buffer, offset);

            if(preHeader.messageSize > byteSize) {
              throw new Error('Message size cannot be greater than size the of the current buffer.');
            }

            // Save for when we decode the entire header starting here.
            let headerOffset = offset;

            // Calc crc and compare to that sent
            var crc;
            [crc, offset] = types.decodeInt32(buffer, offset);

            if(crc32.signed(buffer.slice(offset, endOffset)) !== crc) {
              throw new Error('Message CRC did not match calculated');
            }

            // Determine version from magicbyte
            var version;
            [version, offset] = types.decodeInt8(buffer, offset);

            let tmpl = Message.versions[version];

            // Decode entire header
            var header;
            [header, offset] = Parser.decode(tmpl.header, buffer, headerOffset);

            // TODO support compression schemes
            if(header.attributes !== 0) {
              throw new Error('Unsupported message encoding received');
            }

            var message;
            [message, offset] = Parser.decode(tmpl.body, buffer, offset);

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
          throw new Error('Invalid decode type: ' + entry[key]);

        }
      } catch(err) {
        throw new ParseError(err, key);
      }
    }
    return [result, offset];
  }
};
