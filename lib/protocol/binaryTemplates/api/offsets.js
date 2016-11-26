const BASE_REQUEST = [
  { replicaId: 'int32' },
  { topics: 'array' },
  [
    { topic: 'string' },
    { partitions: 'array' },
    [
      { partition: 'int32' },
      { timestamp: 'int64' },
      { maxNumOffsets: 'int32' }
    ]
  ]
];

const BASE_RESPONSE = [
  { responses: 'array' },
  [
    { topic: 'string' },
    { partitionResponses: 'array' },
    [
      { partition: 'int32' },
      { errCode: 'int16' },
      { offsets: 'int64' }
    ]
  ]
];

const REQUEST_V1 = [
  { replicaId: 'int32' },
  { topics: 'array' },
  [
    { topic: 'string' },
    { partitions: 'array' },
    [
      { partition: 'int32' },
      { timestamp: 'int64' }
    ]
  ]
];

const RESPONSE_V1 = [
  { responses: 'array' },
  [
    { topic: 'string' },
    { partitionResponses: 'array' },
    [
      { partition: 'int32' },
      { errCode: 'int16' },
      { timestamp: 'int64' },
      { offsets: 'int64' }
    ]
  ]
];

module.exports = {
  name: 'Offsets',
  versions: [
    {
      request: BASE_REQUEST,
      response: BASE_RESPONSE
    },
    {
      request: REQUEST_V1,
      response: RESPONSE_V1
    },
  ]
};
