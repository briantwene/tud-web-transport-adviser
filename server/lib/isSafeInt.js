const neo4j = require('neo4j-driver')

exports.isSafeInt = (int) => {
  return int.toNumber();
}
