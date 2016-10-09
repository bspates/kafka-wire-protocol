module.exports = {
  name: 'SaslHandshake',
  version: 0,
  request: [
    { mechanism: 'string' }
  ],
  response: [
    { error: 'error' },
    { enabledMechanisms: 'string' }
  ]
}
