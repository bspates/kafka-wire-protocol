const BASE_REQUEST = [
  { groupId: 'string' },
  { topics: 'array' },
  [
    { topic: 'string' },
    { partitions: 'array' },
    [
      { partition: 'int32' }
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
      { offset: 'int64' },
      { metadata: 'string' },
      { error: 'error'}
    ]
  ]
];

module.exports = {
  name: 'OffsetFetch',
  versions: [
    {
      request: BASE_REQUEST,
      response: BASE_RESPONSE
    },
    { // No discernable difference between version 0 and 1 here
      request: BASE_REQUEST,
      response: BASE_RESPONSE
    }
  ]
};
