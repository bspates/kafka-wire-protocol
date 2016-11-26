var types = require('../types');

const BASE_MSG_SIZE =
  types.INT64_SIZE + // offset
  types.INT32_SIZE + // size
  types.INT32_SIZE + // crc
  types.INT8_SIZE + // magicByte
  types.INT8_SIZE; // attributes

const MSG_SIZE_V1 = BASE_MSG_SIZE + types.INT64_SIZE; // timestamp

const MSG_HEADER_SIZE =
  types.INT64_SIZE + // Offset
  types.INT32_SIZE + // size
  types.INT32_SIZE;  // crc

const MSG_BODY_SIZE =
  types.INT8_SIZE + // magicByte
  types.INT8_SIZE; // attributes

const MSG_BODY_SIZE_V1 =  MSG_BODY_SIZE + types.INT64_SIZE; // timestamp

const HEADER_TEMPLATE = [
  { offset: 'int64' },
  { size: 'int32' },
  { crc: 'int32' }
];

const BODY_TEMPLATE = [
  { magicByte: 'int8' },
  { attributes: 'int8' },
  { key: 'bytes' },
  { value: 'bytes' }
];

const BODY_TEMPLATE_V1 = BODY_TEMPLATE
  .splice(0, 2)
  .concat({ timestamp: 'int64' }, BODY_TEMPLATE.splice(2, 4));

module.exports = {
  name: 'Message',
  versions: [
    {
      header_size: MSG_HEADER_SIZE,
      base_size: BASE_MSG_SIZE,
      body_size: MSG_BODY_SIZE,
      header: HEADER_TEMPLATE,
      body: BODY_TEMPLATE,
      template: HEADER_TEMPLATE.concat(BODY_TEMPLATE)
    },
    {
      header_size: MSG_HEADER_SIZE,
      base_size: BASE_MSG_SIZE,
      body_size: MSG_BODY_SIZE_V1,
      header: HEADER_TEMPLATE,
      body: BODY_TEMPLATE_V1,
      template: HEADER_TEMPLATE.concat(BODY_TEMPLATE_V1)
    }
  ]
};
