module.exports = {
  name: 'OffsetFetch',
  version: 1,
  request: [
    { groupId: 'string' },
    { topics: 'array' },
    [
      { topic: 'string' },
      { partitions: 'array' },
      [
        { partition: 'int32' }
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
        { offset: 'int64' },
        { metadata: 'string' },
        { error: 'error'}
      ]
    ]
  ]
}
