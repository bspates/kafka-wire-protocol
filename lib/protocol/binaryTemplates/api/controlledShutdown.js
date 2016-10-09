module.exports = {
  name: 'ControlledShutdown',
  version: 0,
  request: [
    { brokerId: 'int32' }
  ],
  response: [
    { error: 'error' },
    { partitionsRemaining: 'array' },
    [
      { topic: 'string' },
      { partition: 'int32' }
    ]
  ]
}
