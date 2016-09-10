module.exports = {
  name: 'Metadata',
  version: 0,
  request: [
    {topics: 'array'},
    [
      {topic: 'string'}
    ]
  ],
  response: [
    {nodes: 'array'},
    [
      {nodeId: 'int32'},
      {host: 'string'},
      {port: 'int32'},
    ],
    {topics: 'array'},
    [
      {topicError: 'error'},
      {topic: 'string'},
      {partitions: 'array'},
      [
        {partitionErrCode: 'int16'},
        {partitionId: 'int32'},
        {leader: 'int32'},
        {replicas: 'int32'},
        {isr: 'int32'}
      ]
    ]
  ]
};
