module.exports = {
  name: 'ApiVersions',
  version: 0,
  request: [],
  response: [
    { error: 'error' },
    { apiVersions: 'array' },
    [
      { apiKey: 'int16' },
      { minVersion: 'int16' },
      { maxVersion: 'int16' }
    ]
  ]
};
