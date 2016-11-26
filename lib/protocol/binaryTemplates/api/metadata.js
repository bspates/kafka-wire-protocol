const BASE_REQUEST = [
  {topics: 'array'},
  [
    {topic: 'string'}
  ]
];

const BASE_RESPONSE = [
  { brokers: 'array' },
  [
    { nodeId: 'int32' },
    { host: 'string' },
    { port: 'int32' },
  ],
  // { controllerId: 'int32' } Version 1
  { topicMetadata: 'array' },
  [
    { topicError: 'error' },
    { topic: 'string' },
    // { isInternal: 'int8' }, Version 1
    { partitions: 'array' },
    [
      { partitionErrCode: 'int16' },
      { partitionId: 'int32' },
      { leader: 'int32' },
      { replicas: 'int32' },
      { isr: 'int32' }
    ]
  ]
];

const RESPONSE_V1 = [
  BASE_RESPONSE[0],
  BASE_RESPONSE[1],
  { controllerId: 'int32' },
  BASE_RESPONSE[2],
  [
    BASE_RESPONSE[3][0],
    BASE_RESPONSE[3][1],
    { isInternal: 'int8' },
    BASE_RESPONSE[3][2],
    BASE_RESPONSE[3][3]
  ]
];

module.exports = {
  name: 'Metadata',
  versions: [
    {
      request: BASE_REQUEST,
      response: BASE_RESPONSE
    },
    {
      request: BASE_REQUEST,
      response: RESPONSE_V1
    },
  ]
};
