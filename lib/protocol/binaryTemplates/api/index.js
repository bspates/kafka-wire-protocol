
/**
 * Encoding/Decoding of binary Kafka API messages as defined on:
 * http://kafka.apache.org/protocol.html#protocol_messages
 */
module.exports = {
  Produce: require('./produce'), // api key 0
  Fetch: require('./fetch'), // api key 1
  Offsets: require('./offsets'), // api key 2
  Metadata: require('./metadata'), // api key 3
  LeaderAndIsr: require('./leaderAndIsr'), // api key 4
  StopReplica: require('./stopReplica'), // api key 5
  UpdateMetaData: require('./updateMetaData'), // api key 6
  ControlledShutdown: require('./controlledShutdown'), // api key 7
  OffsetCommit: require('./offsetCommit'), // api key 8
  OffsetFetch: require('./offsetFetch'), // api key 9
  GroupCoordinator: require('./groupCoordinator'), // api key 10
  JoinGroup: require('./joinGroup'), // api key 11
  Heartbeat: require('./heartbeat'), // api key 12
  LeaveGroup: require('./leaveGroup'), // api key 13
  SyncGroup: require('./syncGroup'), // api key 14
  DescribeGroups: require('./describeGroups'), // api key 15
  ListGroups: require('./listGroups'), // api key 16
  SaslHandshake: require('./saslHandshake'), // api key 17
  ApiVersions: require('./apiVersions') // api key 18
};
