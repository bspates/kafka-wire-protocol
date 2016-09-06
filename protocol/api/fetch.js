module.exports = {
  name: 'Fetch',
  version: 2,
  request: [
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
  ],
  response: [
    { throttleTime: 'int32' },
    { responses: 'array' },
    [
      { topic: 'string' },
      { partitionResponses: 'array' },
      [
        { partition: 'int32' },
        { errCode: 'int16' },
        { highWatermark: 'int64' },
        { recordSet: 'messageSet' }
      ]
    ]
  ]
};
