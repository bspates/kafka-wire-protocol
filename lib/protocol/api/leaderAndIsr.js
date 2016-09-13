module.exports = {
  name: 'LeaderAndIsr',
  version: 0,
  request: [
    { controllerId: 'int32' },
    { controllerEpoch: 'int32' },
    { partitionStates: 'array' },
    [
      { topic: 'string' },
      { partition: 'int32' },
      { controllerEpoch: 'int32' },
      { leader: 'int32' },
      { partition: 'int32' },
      { leaderEpoch: 'int32' },
      { isr: 'array' },
      [
        { isr: 'int32' }
      ],
      { zkVersion: 'int32' },
      { replicas: 'array' },
      [
        { replica: 'int32' }
      ],
      { liveLeaders: 'array' },
      [
        { id: 'int32' },
        { host: 'string' },
        { port: 'int32'}
      ]
    ]
  ],
  response: [
    { errCode: 'error' },
    { partitions: 'array' },
    [
      { topic: 'string' },
      { partition: 'int32' },
      { errCode: 'error' }
    ]
  ]
};
