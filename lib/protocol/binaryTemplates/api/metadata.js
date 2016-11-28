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
  { topicMetadata: 'array' },
  [
    { topicError: 'error' },
    { topic: 'string' },
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
  { brokers: 'array' },
  [
    { nodeId: 'int32' },
    { host: 'string' },
    { port: 'int32' },
    { rack: 'string' } // Version 1
  ],
  { controllerId: 'int32' }, // Version 1
  { topicMetadata: 'array' },
  [
    { topicError: 'error' },
    { topic: 'string' },
    { isInternal: 'int8' }, // Version 1
    { partitionMetadata: 'array' },
    [
      { partitionError: 'error' },
      { partitionId: 'int32' },
      { leader: 'int32' },
      { replicas: 'array' },
      [
        { replica: 'int32' }
      ],
      { isr: 'array' },
      [
        { isr: 'int32' }
      ]
    ]
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
