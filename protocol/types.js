var ParseError = require('./errors/parse');

const INT32_SIZE = 4;
const INT16_SIZE = 2;
const INT64_SIZE = 6;
const INT8_SIZE = 1;

module.exports = class Types {

  static get INT8_SIZE() {
    return INT8_SIZE;
  }

  static get INT16_SIZE() {
    return INT16_SIZE;
  }

  static get INT32_SIZE() {
    return INT32_SIZE;
  }

  static get INT64_SIZE() {
    return INT64_SIZE;
  }

  static encodeInt8(value, buffer, offset = 0) {
    Types.validateOffset(buffer, offset + INT8_SIZE);
    return buffer.writeInt8(value, offset);
  }

  static decodeInt8(buffer, offset = 0) {
    let endOffset = offset + INT8_SIZE;
    Types.validateOffset(buffer, endOffset);
    return [
      buffer.readInt8(offset),
      endOffset
    ];
  }

  static encodeInt16(value, buffer, offset = 0) {
    Types.validateOffset(buffer, offset + INT16_SIZE);
    return buffer.writeInt16BE(value, offset);
  }

  static decodeInt16(buffer, offset = 0) {
    let endOffset = offset + INT16_SIZE;
    Types.validateOffset(buffer, endOffset);
    return [
      buffer.readInt16BE(offset),
      endOffset
    ];
  }

  static encodeInt32(value, buffer, offset = 0) {
    Types.validateOffset(buffer, offset + INT32_SIZE);
    return buffer.writeInt32BE(value, offset);
  }

  static decodeInt32(buffer, offset = 0) {
    let endOffset = offset + INT32_SIZE;
    Types.validateOffset(buffer, endOffset);
    return [
      buffer.readInt32BE(offset),
      endOffset
    ];
  }

  static encodeInt64(value, buffer, offset = 0) {
    Types.validateOffset(buffer, offset + INT64_SIZE);
    return buffer.writeIntBE(value, offset, INT64_SIZE);
  }

  static decodeInt64(buffer, offset = 0) {
    let endOffset = offset + INT64_SIZE;
    Types.validateOffset(buffer, endOffset);
    return [
      buffer.readIntBE(offset, INT64_SIZE),
      endOffset
    ];
  }

  static encodeArray(arr, typeMethod, buffer, offset = 0) {
    offset = buffer.writeInt32BE(arr.length, offset);
    arr.forEach((data) => {
      offset = typeMethod(data, buffer, offset);
    });
    return offset;
  }

  static decodeArray(typeMethod, buffer, offset = 0) {
    var length, value;
    [length, offset] = Types.decodeInt32(buffer, offset);
    var resultArr = []
    for(var i = 0; i < length; i++) {
      [value, offset] = typeMethod(buffer, offset);
      resultArr.push(value);
    }
    return [resultArr, offset];
  }

  static encodeArraySize(arr, buffer, offset = 0) {
    return buffer.writeInt32BE(arr.length, offset);
  }

  static decodeArraySize(buffer, offset = 0) {
    return Types.decodeInt32(buffer, offset);
  }

  static encodeString(str, buffer, offset = 0) {
    if(str == null) {
      return buffer.writeInt16BE(-1, offset);
    }
    var length = Buffer.byteLength(str, 'utf8');

    offset = buffer.writeInt16BE(length, offset);
    return offset + buffer.write(str, offset, length);
  }

  static decodeString(buffer, offset = 0) {
    var length;

    [length, offset] = Types.decodeInt16(buffer, offset);

    var strEnd = offset + length;
    var strResult = buffer.toString('utf8', offset, strEnd);

    return [strResult, strEnd];
  }

  static encodeBytes(bytes, buffer, offset = 0) {
    if(bytes == null) {
      return Types.encodeInt32(-1, buffer, offset);
    }
    // console.log(bytes);
    if(Buffer.isBuffer(bytes)) {
      offset = Types.encodeInt32(bytes.length, buffer, offset);
      offset = offset + bytes.copy(buffer, offset);
    } else {
      let length = Buffer.byteLength(bytes, 'utf8');
      offset = Types.encodeInt32(length, buffer, offset);
      offset = offset + buffer.write(bytes, offset, length, 'utf8');
    }
    return offset;
  }

  static decodeBytes(buffer, offset = 0) {
    var length;
    [length, offset] = Types.decodeInt32(buffer, offset);

    if(length === -1) return [null, offset];
    if(length === 0) return ['', offset];

    var bytesEnd = offset + length;
    return [
      buffer.slice(offset, bytesEnd),
      bytesEnd
    ];
  }

  static validateOffset(buffer, offset) {
    if(buffer.length < offset) {
      throw new ParseError('Offset of ' +
        offset +
        ' is out of range of buffer with size ' +
        buffer.length
      );
    }
  }
};
