module.exports = {
  name: 'LeaveGroup',
  version: 0,
  request: [
    { groupId: 'string' },
    { memberId: 'string' }
  ],
  response: [
    { error: 'error' }
  ]
}
