module.exports = {
  name: 'ControlledShutdown',
  versions: [
    { // No documentation of Version 0
      request: [],
      response: []
    },
    {
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
  ]
};
