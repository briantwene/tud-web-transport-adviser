const neo4j = require("neo4j-driver");

const dbInstance = neo4j.driver(
  "neo4j://localhost:7666",
  neo4j.auth.basic("neo4j", "password")
);

//read query
const readRealtime = async (cypher, params = {}) => {
  const session = dbInstance.session({
    database: "neo4j",
    defaultAccessMode: neo4j.session.WRITE
  });

  try {
    const res = await session.executeRead((tx) => tx.run(cypher, params));
    const values = res.records.map((record) => record.toObject());

    return values;
  } catch (error) {
    console.log(error);
  } finally {
    await session.close();
  }
};

module.exports = { readRealtime };
