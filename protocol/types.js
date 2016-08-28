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

  static encodeString(str, buffer, offset = 0) {
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
};
