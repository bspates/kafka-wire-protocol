module.exports = {
  name: 'ListGroups',
  version: 0,
  request: [],
  response: [
    { error: 'error' },
    { groups: 'array' },
    [
      { groupId: 'string' },
      { protocolType: 'string' }
    ]
  ]
};
