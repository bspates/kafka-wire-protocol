var Header = require('./header');
var definitions = require('../definitions');
var types = require('../types');

module.exports = {
  name: 'Produce',
  version: 2,
  request: [
    { acks: 'int16' },
    { timeout: 'int32' },
    { topics: 'array' },
    [
      { topic: 'string' },
      { data: 'array' },
      [
        { partition: 'int32' },
        { recordSet: 'bytes' }
      ]
    ]
  ],
  response: [
    { responses: 'array' },
    [
      { topic: 'string' },
      { partitionResponses: 'array' },
      [
        { partition: 'int32' },
        { errCode: 'int16' },
        { offset: 'int64' },
        { timestamp: 'int64' }
      ]
    ],
    { throttleTime: 'int32' }
  ]
};
