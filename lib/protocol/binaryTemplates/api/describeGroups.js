module.exports = {
  name: 'DescribeGroups',
  version: 0,
  request: [
    { groupIds: 'array' },
    [
      { groupId: 'string' }
    ]
  ],
  response: [
    { groups: 'array' },
    [
      { error: 'error' },
      { groupId: 'string' },
      { state: 'string' },
      { protocolType: 'string' },
      { protocol: 'string' },
      { members: 'array' },
      [
        { memberId: 'string' },
        { clientId: 'string' },
        { clientHost: 'string' },
        { memberMetadata: 'bytes' },
        { memberAssignment: 'bytes' }
      ]
    ]
  ]
}
