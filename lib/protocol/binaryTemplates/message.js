var types = require('../types');

// Pre Header
const OFFSET = { offset: 'int64' };
const OFFSET_BYTE_SIZE = types.INT64_SIZE;

const MESSAGE_SIZE = { messageSize: 'int32' };
const MESSAGE_SIZE_BYTE_SIZE = types.INT32_SIZE;

// Header
const CRC = { crc: 'int32' };
const CRC_BYTE_SIZE = types.INT32_SIZE;

const MAGIC_BYTE = { magicByte: 'int8' };
const MAGIC_BYTE_BYTE_SIZE = types.INT8_SIZE;

const ATTRIBUTES = { attributes: 'int8' };
const ATTRIBUTES_BYTE_SIZE = types.INT8_SIZE;

const TIMESTAMP = { timestamp: 'int64' }; // Version 1
const TIMESTAMP_BYTE_SIZE = types.INT64_SIZE;

// Body
// Unknown sizes for these
const KEY = { key: 'bytes' };
const VALUE = { value: 'bytes' };

const PRE_HEADER = [
  OFFSET,
  MESSAGE_SIZE
];

const PRE_HEADER_BYTE_SIZE = [
  OFFSET_BYTE_SIZE,
  MESSAGE_SIZE_BYTE_SIZE
].reduce((a, b) => { return a + b; });

const HEADER = [
  CRC,
  MAGIC_BYTE,
  ATTRIBUTES
];

const HEADER_BYTE_SIZE = [
  CRC_BYTE_SIZE,
  MAGIC_BYTE_BYTE_SIZE,
  ATTRIBUTES_BYTE_SIZE
].reduce((a, b) => { return a + b; });

const HEADER_V1 = [
  CRC,
  MAGIC_BYTE,
  ATTRIBUTES,
  TIMESTAMP
];

const HEADER_V1_BYTE_SIZE = [
  CRC_BYTE_SIZE,
  MAGIC_BYTE_BYTE_SIZE,
  ATTRIBUTES_BYTE_SIZE,
  TIMESTAMP_BYTE_SIZE
].reduce((a, b) => { return a + b; });

const BODY = [
  KEY,
  VALUE
];

module.exports = {
  name: 'Message',
  preHeader: PRE_HEADER,
  preHeaderSize: PRE_HEADER_BYTE_SIZE,
  versions: [
    {
      header: HEADER,
      headerSize: HEADER_BYTE_SIZE,
      body: BODY,
      template: HEADER.concat(BODY)
    },
    {
      header: HEADER_V1,
      headerSize: HEADER_V1_BYTE_SIZE,
      body: BODY,
      template: HEADER_V1.concat(BODY)
    }
  ]
};
