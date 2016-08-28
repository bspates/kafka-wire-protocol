module.exports = class Types {
  static decodeInt32(offset, buffer) {
    return [
      offset + 4,
      buffer.readInt32BE(offset)
    ];
  }

  static decodeInt16(offset, buffer) {
    return [
      offset + 2,
      buffer.readInt16BE(offset)
    ];
  }

  static encodeArray(offset, arr, typeMethod, buffer) {
    // console.log(arr.length);
    offset = buffer.writeInt32BE(arr.length, offset);
    arr.forEach((data) => {
      offset = typeMethod(offset, data, buffer);
    });
    return offset;
  }

  static decodeArray(offset, typeMethod, buffer) {
    var length, value;
    [offset, length] = Types.decodeInt32(offset, buffer);
    var resultArr = []
    for(var i = 0; i < length; i++) {
      [offset, value] = typeMethod(offset, buffer);
      resultArr.push(value);
    }
    return [offset, resultArr];
  }

  static encodeString(offset, str, buffer) {
    var length = Buffer.byteLength(str, 'utf8');

    offset = buffer.writeInt16BE(length, offset);
    return offset + buffer.write(str, offset, length);
  }

  static decodeString(offset, buffer) {
    var length;

    [offset, length] = Types.decodeInt16(offset, buffer);

    var strEnd = offset + length;
    var strResult = buffer.toString('utf8', offset, strEnd);

    return [strEnd, strResult];
  }
};
