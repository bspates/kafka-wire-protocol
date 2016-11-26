const BASE_REQUEST = [
  { replicaId: 'int32' },
  { maxWaitTime: 'int32' },
  { minBytes: 'int32' },
  { topics: 'array' },
  [
    { topic: 'string' },
    { partitions: 'array' },
    [
      { partition: 'int32' },
      { fetchOffset: 'int64' },
      { maxBytes: 'int32' }
    ]
  ]
];

const BASE_RESPONSE = [
  // { throttleTime: 'int32' }, Version 1
  { responses: 'array' },
  [
    { topic: 'string' },
    { partitionResponses: 'array' },
    [
      { partition: 'int32' },
      { error: 'error' },
      { highWatermark: 'int64' },
      { recordSet: 'messageSet' }
    ]
  ]
]

const RESPONSE_V1 = [
  { throttleTime: 'int32' }
].concat(BASE_RESPONSE);

module.exports = {
  name: 'Fetch',
  versions: [
    {
      request: BASE_REQUEST,
      response: BASE_RESPONSE
    },
    {
      request: BASE_REQUEST,
      response: RESPONSE_V1
    },
    { // not sure why there is a v2, there is no difference from the v1 format
      request: BASE_REQUEST,
      response: RESPONSE_V1
    }
  ]
};
