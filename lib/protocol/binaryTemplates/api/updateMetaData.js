module.exports = {
  name: 'UpdateMetaData',
  version: 2,
  request: [
    { controllerId: 'int32' },
    { controllerEpoch: 'int32' },
    { partitionStates: 'array' },
    [
      { topic: 'string' },
      { partition: 'int32' },
      { controllerEpoch: 'int32' },
      { leader: 'int32' },
      { leaderEpoch: 'int32' },
      { isr: 'int32' },
      { zk_version: 'int32' },
      { replicas: 'int32' }
    ],
    { liveBrokers: 'array' },
    [
      { id: 'int32' },
      { endPoints: 'array' },
      [
        { port: 'int32' },
        { host: 'string' },
        { securityProtocolType: 'int16'}
      ],
      { rack: 'string' }
    ]
  ],
  response: [
    { error: 'error' }
  ]
};
