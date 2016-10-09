module.exports = {
  name: 'OffsetCommit',
  version: 2,
  request: [
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
  ],
  response: [
    { responses: 'array' },
    [
      { topic: 'string' },
      { partitionResponses: 'array' },
      [
        { partition: 'int32' },
        { error: 'error' }
      ]
    ]
  ]
}
