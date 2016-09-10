var types = require('../types');

const BASE_MSG_SIZE =
  types.INT64_SIZE + // offset
  types.INT32_SIZE + // size
  types.INT32_SIZE + // crc
  types.INT8_SIZE + // magicByte
  types.INT8_SIZE + // attributes
  types.INT64_SIZE; // timestamp

const MSG_HEADER_SIZE =
  types.INT64_SIZE + // Offset
  types.INT32_SIZE + // size
  types.INT32_SIZE;  // crc

const MSG_BODY_SIZE =
  types.INT8_SIZE + // magicByte
  types.INT8_SIZE + // attributes
  types.INT64_SIZE; // timestamp

const HEADER_TEMPLATE = [
  { offset: 'int64' },
  { size: 'int32' },
  { crc: 'int32' }
];

const BODY_TEMPLATE = [
  { magicByte: 'int8' },
  { attributes: 'int8' },
  { timestamp: 'int64' },
  { key: 'bytes' },
  { value: 'bytes' }
];

const TEMPLATE = HEADER_TEMPLATE.concat(BODY_TEMPLATE);

module.exports = {
  name: 'Message',
  version: 1,
  header_size: MSG_HEADER_SIZE,
  base_size: BASE_MSG_SIZE,
  body_size: MSG_BODY_SIZE,
  header: HEADER_TEMPLATE,
  body: BODY_TEMPLATE,
  template: TEMPLATE
};
