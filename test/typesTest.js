var assert = require('assert');
var Types = require('../lib/protocol/types');
var { Int64BE } = require('int64-buffer');

describe('The Types class', function() {
  const intTestBoundaries = {
    int8: {
      type: 'int8',
      size: Types.INT8_SIZE,
      values: [
        0,
        1,
        -1,
        127,
        -128
      ]
    },
    int16: {
      type: 'int16',
      size: Types.INT16_SIZE,
      values: [
        0,
        1,
        -1,
        32767,
        -32768
      ]
    },
    int32: {
      type: 'int32',
      size: Types.INT32_SIZE,
      values: [
        0,
        1,
        -1,
        2147483647,
        -2147483648
      ]
    },
    int64: {
      type: 'int64',
      size: Types.INT64_SIZE,
      values: [
        0,
        1,
        -1,
        // Both values will loose precision when cast to Number (Double)
        new Int64BE("9223372036854775807").toNumber(),
        new Int64BE("-9223372036854775808").toNumber()
      ]
    }
  };

  describe('when encoding', function() {
    let testParams = [];
    testParams.push({
      pkg: intTestBoundaries.int8,
      encode: Types.encodeInt8,
      decode:(buffer, offset) => {
        return buffer.readInt8(offset);
      }
    });

    testParams.push({
      pkg: intTestBoundaries.int16,
      encode: Types.encodeInt16,
      decode:(buffer, offset) => {
        return buffer.readInt16BE(offset);
      }
    });

    testParams.push({
      pkg: intTestBoundaries.int32,
      encode: Types.encodeInt32,
      decode:(buffer, offset) => {
        return buffer.readInt32BE(offset);
      }
    });

    testParams.push({
      pkg: intTestBoundaries.int64,
      encode: Types.encodeInt64,
      decode:(buffer, offset) => {
        return new Int64BE(buffer, offset).toNumber();
      }
    });

    var buf = Buffer.alloc(64);
    let integerTest = (value, size, encoder, decoder) => {
      var offset = encoder(value, buf, 0);
      assert.equal(offset, size);
      assert.equal(decoder(buf, 0), value);
    };

    testParams.forEach((test) => {
      for(let value of test.pkg.values) {
        it(`${value} as a ${test.pkg.type} should be decodable using the related buffer read method`, function() {
          integerTest(value, test.pkg.size, test.encode, test.decode);
        });
      }
    });
  });

  describe('when decoding', function() {
    let testParams = [];
    testParams.push({
      pkg: intTestBoundaries.int8,
      encode: Types.encodeInt8,
      decode: Types.decodeInt8
    });

    testParams.push({
      pkg: intTestBoundaries.int16,
      encode: Types.encodeInt16,
      decode: Types.decodeInt16
    });

    testParams.push({
      pkg: intTestBoundaries.int32,
      encode: Types.encodeInt32,
      decode: Types.decodeInt32
    });

    testParams.push({
      pkg: intTestBoundaries.int64,
      encode: Types.encodeInt64,
      decode: Types.decodeInt64
    });

    var buf = Buffer.alloc(64);
    let integerTest = (value, size, encoder, decoder) => {
      var offset = encoder(value, buf, 0);
      var result, endOffset;
      [result, endOffset] = decoder(buf, 0);
      assert.equal(offset, endOffset);
      assert.equal(result, value);
    };

    testParams.forEach((test) => {
      for(let value of test.pkg.values) {
        it(`${value} as a ${test.pkg.type} should not alter the value`, function() {
          integerTest(value, test.pkg.size, test.encode, test.decode);
        });
      }
    });
  });
});
