module.exports = {
  name: 'StopReplica',
  version: 0,
  request: [
    { controllerId: 'int32' },
    { controllerEpoch: 'int32' },
    { deletePartitions: 'int8' },
    { partitions: 'array' },
    [
      { topic: 'string' },
      { parition: 'int32' }
    ]
  ],
  response: [
    { error: 'error' },
    { partitions: 'array' },
    [
      { topic: 'string' },
      { partition: 'int32' },
      { error: 'int16' }
    ]
  ]
}
