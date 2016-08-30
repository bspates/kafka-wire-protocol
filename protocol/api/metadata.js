module.exports = {
  name: 'Metadata',
  request: {
    topics: [
      {
        topic: 'string'
      }
    ]
  },
  response: {
    nodes: [
      {
        nodeId: 'int32',
        host: 'string',
        port: 'int32'
      }
    ],
    topics: [
      {
        topicErrCode: 'int16',
        topic: 'string',
        partitions: [
          {
            partitionErrCode: 'int16',
            partitionId: 'int32',
            leader: 'int32',
            replicas: 'int32',
            isr: 'int32'
          }
        ]
      }
    ]
  }
};
