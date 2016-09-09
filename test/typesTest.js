var assert = require('assert');
var Types = require('../protocol/types');
var { Int64BE } = require('int64-buffer');

describe('The Types class', function() {
  describe('when encoding', function() {
    let testParams = [
      {
        type: 'int8',
        size: Types.INT8_SIZE,
        encode: Types.encodeInt8,
        decode: (buffer, offset) => {
          return buffer.readInt8(offset);
        },
        values: [
          0,
          1,
          -1,
          127,
          -128
        ]
      },
      {
        type: 'int16',
        size: Types.INT16_SIZE,
        encode: Types.encodeInt16,
        decode: (buffer, offset) => {
          return buffer.readInt16BE(offset);
        },
        values: [
          0,
          1,
          -1,
          32767,
          -32768
        ]
      },
      {
        type: 'int32',
        size: Types.INT32_SIZE,
        encode: Types.encodeInt32,
        decode: (buffer, offset) => {
          return buffer.readInt32BE(offset);
        },
        values: [
          0,
          1,
          -1,
          2147483647,
          -2147483648
        ]
      },
      {
        type: 'int64',
        size: Types.INT64_SIZE,
        encode: Types.encodeInt64,
        decode: (buffer, offset) => {
          return new Int64BE(buffer, offset).toNumber();
        },
        values: [
          0,
          1,
          -1,
          // Both values will loose preision when cast to Number (Double)
          new Int64BE("9223372036854775807").toNumber(),
          new Int64BE("-9223372036854775808").toNumber()
        ]
      }
    ];

    var buf = Buffer.alloc(64);
    let integerTest = (value, size, encoder, decoder) => {
      var offset = encoder(value, buf, 0);
      assert.equal(offset, size);
      assert.equal(decoder(buf, 0), value);
    };

    // Happy path boundary testing
    testParams.forEach((test) => {
      for(let value of test.values) {
        it(`${value} as a ${test.type} should be decodable using the related buffer read method`, function() {
          integerTest(value, test.size, test.encode, test.decode);
        });
      }
    });
  });

  describe('when decoding', function() {
    
  });
});
