module.exports = {
  name: 'SyncGroup',
  version: 0,
  request: [
    { groupId: 'string' },
    { generationId: 'int32' },
    { memberId: 'string' },
    { groupAssignment: 'array' },
    [
      { memberId: 'string' },
      { memberAssignment: 'bytes' }
    ]
  ],
  response: [
    { error: 'error' },
    { memberAssignment: 'bytes' }
  ]
}
