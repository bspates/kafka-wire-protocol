module.exports = {
  name: 'Heartbeat',
  version: 0,
  request: [
    { groupId: 'string' },
    { groupGenerationId: 'int32' },
    { memberId: 'string' }
  ],
  response: [
    { error: 'error' }
  ]
};
