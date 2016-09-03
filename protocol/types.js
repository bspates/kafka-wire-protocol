module.exports = class Types {

  static encodeInt32(value, buffer, offset = 0) {
    return buffer.writeInt32BE(value, offset);
  }

  static decodeInt32(buffer, offset = 0) {
    return [
      buffer.readInt32BE(offset),
      offset + 4
    ];
  }

  static encodeInt16(value, buffer, offset = 0) {
    return buffer.writeInt16BE(value, offset);
  }

  static decodeInt16(buffer, offset = 0) {
    return [
      buffer.readInt16BE(offset),
      offset + 2
    ];
  }

  static encodeInt64(value, buffer, offset = 0) {
    return buffer.writeIntBE(value, offset, 6);
  }

  static decodeInt64(buffer, offset = 0) {
    return [
      buffer.readIntBE(offset, 6),
      offset + 6
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

    var length = Buffer.byteLength(bytes, 'utf8');
    offset = Types.encodeInt32(length, buffer, offset);
    offset = offset + buffer.write(bytes, offset, length, 'utf8');
    return offset;
  }

  static decodeBytes(buffer, offset = 0) {
    var length;
    [length, offset] = Types.decodeInt32(buffer, offset);
    if(length === -1) return null
    if(length === 0) return '';
    var bytesEnd = offset + length;

    return [
      buffer.toString('utf8', offset, bytesEnd),
      bytesEnd
    ];
  }
};
