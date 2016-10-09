module.exports = {
  name: 'GroupCoordinator',
  version: 0,
  request: [
    { groupId: 'string' }
  ],
  response: [
    { error: 'error' },
    { coordinator: 'object' },
    [
      { nodeId: 'int32' },
      { host: 'string' },
      { port: 'int32'}
    ]
  ]
};
