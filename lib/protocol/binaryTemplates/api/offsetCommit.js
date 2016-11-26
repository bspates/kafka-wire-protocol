const BASE_REQUEST = [
  { groupId: 'string' },
  { topics: 'array' },
  [
    { topic: 'string' },
    { partitions: 'array' },
    [
      { partition: 'int32' },
      { offset: 'int64' },
      { metadata: 'string' }
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
      { error: 'error' }
    ]
  ]
];

const REQUEST_V1 = [
  { groupId: 'string' },
  { groupGenerationId: 'int32' },
  { memberId: 'string' },
  { topics: 'array' },
  [
    { topic: 'string' },
    { partitions: 'array' },
    [
      { partition: 'int32' },
      { offset: 'int64' },
      { metadata: 'string' }
    ]
  ]
];

const REQUEST_V2 = [
  { groupId: 'string' },
  { groupGenerationId: 'int32' },
  { memberId: 'string' },
  { retentionTime: 'int64' },
  { topics: 'array' },
  [
    { topic: 'string' },
    { partitions: 'array' },
    [
      { partition: 'int32' },
      { offset: 'int64' },
      { metadata: 'string' }
    ]
  ]
];

module.exports = {
  name: 'OffsetCommit',
  versions: [
    {
      request: BASE_REQUEST,
      response: BASE_RESPONSE
    },
    {
      request: REQUEST_V1,
      response: BASE_RESPONSE
    },
    {
      request: REQUEST_V2,
      response: BASE_RESPONSE
    }
  ]
};
