const BASE_REQUEST = [
  { controllerId: 'int32' },
  { controllerEpoch: 'int32' },
  { partitionStates: 'array' },
  [
    { topic: 'string' },
    { partition: 'int32' },
    { controllerEpoch: 'int32' },
    { leader: 'int32' },
    { leaderEpoch: 'int32' },
    { isrs: 'array' },
    [
      { isr: 'int32' }
    ],
    { zk_version: 'int32' },
    { replicas: 'array' },
    [
      { replica: 'int32'}
    ]
  ],
  { liveBrokers: 'array' },
];

const BASE_RESPONSE = [
  { error: 'error' }
];

const LIVE_BROKERS_V0 = [
  { id: 'int32' },
  { host: 'string' },
  { port: 'int32' }
];

const LIVE_BROKERS_V1 = [
  { id: 'int32' },
  { endPoints: 'array' },
  [
    { port: 'int32' },
    { host: 'string' },
    { securityProtocolType: 'int16'}
  ]
];

const LIVE_BROKERS_V2 = LIVE_BROKERS_V1.concat({ rack: 'string' });

module.exports = {
  name: 'UpdateMetaData',
  versions: [
    {
      request: BASE_REQUEST.concat(LIVE_BROKERS_V0),
      response: BASE_RESPONSE
    },
    {
      request: BASE_REQUEST.concat(LIVE_BROKERS_V1),
      response: BASE_RESPONSE
    },
    {
      request: BASE_REQUEST.concat(LIVE_BROKERS_V2),
      response: BASE_RESPONSE
    }
  ]
};
