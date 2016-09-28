module.exports = {
  name: 'JoinGroup',
  version: 0,
  request: [
    { groupId: 'string' },
    { sessionTimeout: 'int32' },
    { memberId: 'string' },
    { protocolType: 'string' },
    { groupProtocols: 'array' },
    [
      { name: 'string' },
      { metadata: 'bytes' }
    ]
  ],
  response: [
    { error: 'error' },
    { generationId: 'int32' },
    { groupProtocol: 'string' },
    { leaderId: 'string' },
    { memberId: 'string' },
    { members: 'array' },
    [
      { memberId: 'string' },
      { memberMetadata: 'bytes' }
    ]
  ]
};
