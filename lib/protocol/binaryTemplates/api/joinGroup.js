const BASE_REQUEST  = [
  { groupId: 'string' },
  { sessionTimeout: 'int32' },
  { memberId: 'string' },
  { protocolType: 'string' },
  { groupProtocols: 'array' },
  [
    { name: 'string' },
    { metadata: 'bytes' }
  ]
];

const BASE_RESPONSE = [
  { error: 'error' },
  { generationId: 'int32' },
  { groupProtocol: 'string' },
  { leaderId: 'string' },
  { memberId: 'string' },
  { members: 'array' },
  [
    { memberId: 'string' },
    { memberMetadata: 'bytes' }
  ]
];

const REQUEST_V1 = [
  { groupId: 'string' },
  { sessionTimeout: 'int32' },
  { rebalanceTimeout: 'int32'},
  { memberId: 'string' },
  { protocolType: 'string' },
  { groupProtocols: 'array' },
  [
    { name: 'string' },
    { metadata: 'bytes' }
  ]
];

module.exports = {
  name: 'JoinGroup',
  versions: [
    {
      request: BASE_REQUEST,
      response: BASE_RESPONSE
    },
    {
      request: REQUEST_V1,
      response: BASE_RESPONSE
    }
  ]
};
