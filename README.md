Kafkaesq
========

**This is some pre-alpha shizz**

Goals
* Kafka clients are complex in nature, so to avoid dependency bloat only use non-core libs when unavoidable. (ie when rolling my own would be stupid)
* Avoid creating more complexity than already exists in the Kafka ecosystem. Don't invent new producing/consuming schemes.
* Try to have as few buffer allocations as possible. In practice this means pre-allocating "the right" amount of memory to begin with.
* Don't provide all the solutions but allow for pluggable libraries. (ie this lib does not come with snappy compression, but should support its use)
