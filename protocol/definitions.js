// index of type is key
const API_KEYS = [
  'Produce',
  'Fetch',
  'Offsets',
  'Metadata',
  'LeaderAndIsr',
  'StopReplica',
  'UpdateMetadata',
  'ControlledShutdown',
  'OffsetCommit',
  'OffsetFetch',
  'GroupCoordinator',
  'JoinGroup',
  'Heartbeat',
  'LeaveGroup',
  'SyncGroup',
  'DescribeGroups',
  'ListGroups',
  'SaslHandshake',
  'ApiVersions'
]

const ERRORS = [
  {
    "name": "UNKNOWN",
    "code": -1,
    "retry": false,
    "message": "False	The server experienced an unexpected error when processing the request"
  },
  {
    "name": "NONE",
    "code": 0,
    "retry": false,
    "message": ""
  },
  {
    "name": "OFFSET_OUT_OF_RANGE",
    "code": 1,
    "retry": false,
    "message": "The requested offset is not within the range of offsets maintained by the server."
  },
  {
    "name": "CORRUPT_MESSAGE",
    "code": 2,
    "retry": true,
    "message": "This message has failed its CRC checksum, exceeds the valid size, or is otherwise corrupt."
  },
  {
    "name": "UNKNOWN_TOPIC_OR_PARTITION",
    "code": 3,
    "retry": true,
    "message": "This server does not host this topic-partition."
  },
  {
    "name": "INVALID_FETCH_SIZE",
    "code": 4,
    "retry": false,
    "message": "The requested fetch size is invalid."
  },
  {
    "name": "LEADER_NOT_AVAILABLE",
    "code": 5,
    "retry": true,
    "message": "There is no leader for this topic-partition as we are in the middle of a leadership election."
  },
  {
    "name": "NOT_LEADER_FOR_PARTITION",
    "code": 6,
    "retry": true,
    "message": "This server is not the leader for that topic-partition."
  },
  {
    "name": "REQUEST_TIMED_OUT",
    "code": 7,
    "retry": true,
    "message": "The request timed out."
  },
  {
    "name": "BROKER_NOT_AVAILABLE",
    "code": 8,
    "retry": false,
    "message": "The broker is not available."
  },
  {
    "name": "REPLICA_NOT_AVAILABLE",
    "code": 9,
    "retry": false,
    "message": "The replica is not available for the requested topic-partition"
  },
  {
    "name": "MESSAGE_TOO_LARGE",
    "code": 10,
    "retry": false,
    "message": "The request included a message larger than the max message size the server will accept."
  },
  {
    "name": "STALE_CONTROLLER_EPOCH",
    "code": 11,
    "retry": false,
    "message": "The controller moved to another broker."
  },
  {
    "name": "OFFSET_METADATA_TOO_LARGE",
    "code": 12,
    "retry": false,
    "message": "The metadata field of the offset request was too large."
  },
  {
    "name": "NETWORK_EXCEPTION",
    "code": 13,
    "retry": true,
    "message": "The server disconnected before a response was received."
  },
  {
    "name": "GROUP_LOAD_IN_PROGRESS",
    "code": 14,
    "retry": true,
    "message": "The coordinator is loading and hence can't process requests for this group."
  },
  {
    "name": "GROUP_COORDINATOR_NOT_AVAILABLE",
    "code": 15,
    "retry": true,
    "message": "The group coordinator is not available."
  },
  {
    "name": "NOT_COORDINATOR_FOR_GROUP",
    "code": 16,
    "retry": true,
    "message": "This is not the correct coordinator for this group."
  },
  {
    "name": "INVALID_TOPIC_EXCEPTION",
    "code": 17,
    "retry": false,
    "message": "The request attempted to perform an operation on an invalid topic."
  },
  {
    "name": "RECORD_LIST_TOO_LARGE",
    "code": 18,
    "retry": false,
    "message": "The request included message batch larger than the configured segment size on the server."
  },
  {
    "name": "NOT_ENOUGH_REPLICAS",
    "code": 19,
    "retry": true,
    "message": "Messages are rejected since there are fewer in-sync replicas than required."
  },
  {
    "name": "NOT_ENOUGH_REPLICAS_AFTER_APPEND",
    "code": 20,
    "retry": true,
    "message": "Messages are written to the log, but to fewer in-sync replicas than required."
  },
  {
    "name": "INVALID_REQUIRED_ACKS",
    "code": 21,
    "retry": false,
    "message": "Produce request specified an invalid value for required acks."
  },
  {
    "name": "ILLEGAL_GENERATION",
    "code": 22,
    "retry": false,
    "message": "Specified group generation id is not valid."
  },
  {
    "name": "INCONSISTENT_GROUP_PROTOCOL",
    "code": 23,
    "retry": false,
    "message": "The group member's supported protocols are incompatible with those of existing members."
  },
  {
    "name": "INVALID_GROUP_ID",
    "code": 24,
    "retry": false,
    "message": "The configured groupId is invalid"
  },
  {
    "name": "UNKNOWN_MEMBER_ID",
    "code": 25,
    "retry": false,
    "message": "The coordinator is not aware of this member."
  },
  {
    "name": "INVALID_SESSION_TIMEOUT",
    "code": 26,
    "retry": false,
    "message": "The session timeout is not within the range allowed by the broker (as configured by group.min.session.timeout.ms and group.max.session.timeout.ms)."
  },
  {
    "name": "REBALANCE_IN_PROGRESS",
    "code": 27,
    "retry": false,
    "message": "The group is rebalancing, so a rejoin is needed."
  },
  {
    "name": "INVALID_COMMIT_OFFSET_SIZE",
    "code": 28,
    "retry": false,
    "message": "The committing offset data size is not valid"
  },
  {
    "name": "TOPIC_AUTHORIZATION_FAILED",
    "code": 29,
    "retry": false,
    "message": "Not authorized to access topics: [Topic authorization failed.]"
  },
  {
    "name": "GROUP_AUTHORIZATION_FAILED",
    "code": 30,
    "retry": false,
    "message": "Not authorized to access group: Group authorization failed."
  },
  {
    "name": "CLUSTER_AUTHORIZATION_FAILED",
    "code": 31,
    "retry": false,
    "message": "Cluster authorization failed."
  },
  {
    "name": "INVALID_TIMESTAMP",
    "code": 32,
    "retry": false,
    "message": "The timestamp of the message is out of acceptable range."
  },
  {
    "name": "UNSUPPORTED_SASL_MECHANISM",
    "code": 33,
    "retry": false,
    "message": "The broker does not support the requested SASL mechanism."
  },
  {
    "name": "ILLEGAL_SASL_STATE",
    "code": 34,
    "retry": false,
    "message": "Request is not valid given the current SASL state."
  },
  {
    "name": "UNSUPPORTED_VERSION",
    "code": 35,
    "retry": false,
    "message": "The version of API is not supported."
  }
];

module.exports = {
  getApiKey: function(type) {
    return API_KEYS.indexOf(type);
  },
  API_KEYS: API_KEYS,
  ERRORS: ERRORS
};
