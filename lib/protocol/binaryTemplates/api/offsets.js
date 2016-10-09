module.exports = {
  name: 'Offsets',
  version: 0,
  request: [
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
  ],
  response: [
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
  ]
};
