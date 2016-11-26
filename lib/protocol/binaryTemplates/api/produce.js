const BASE_REQUEST = [
  { acks: 'int16' },
  { timeout: 'int32' },
  { topics: 'array' },
  [
    { topic: 'string' },
    { data: 'array' },
    [
      { partition: 'int32' },
      { recordSet: 'messageSet' }
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
      { error: 'error' },
      { offset: 'int64' }
      // { timestamp: 'int64' } Version 2
    ]
  ],
  // { throttleTime: 'int32' } Version 1
];

const RESPONSE_V1 = BASE_RESPONSE.concat({ throttleTime: 'int32' });
const RESPONSE_V2 = function() {
  var respV2 = RESPONSE_V1.concat();
  respV2[1][2].push({ timestamp: 'int64' });
  return respV2;
}();

module.exports = {
  name: 'Produce',
  versions: [
    { // V0
      request: BASE_REQUEST,
      response: BASE_RESPONSE
    },
    { // V1
      request: BASE_REQUEST,
      response: RESPONSE_V1,
    },
    { // V2
      request: BASE_REQUEST,
      response: RESPONSE_V2
    }
  ]
};
