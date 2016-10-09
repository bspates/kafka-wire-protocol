module.exports = {
  name: 'Produce',
  version: 2,
  request: [
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
  ],
  response: [
    { responses: 'array' },
    [
      { topic: 'string' },
      { partitionResponses: 'array' },
      [
        { partition: 'int32' },
        { error: 'error' },
        { offset: 'int64' },
        { timestamp: 'int64' }
      ]
    ],
    { throttleTime: 'int32' }
  ]
};
