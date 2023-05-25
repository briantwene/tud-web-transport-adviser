//import dependencies
const neo4j = require("neo4j-driver");
//create database Instance
const dbInstance = neo4j.driver(
  "neo4j://localhost:7999",
  neo4j.auth.basic("neo4j", "password"),
  {
    disableLosslessIntegers: true
  }
);

//read query
const read = async (cypher, params = {}) => {
  const session = dbInstance.session({
    database: "neo4j",
    defaultAccessMode: neo4j.session.READ
  });

  console.log(cypher);
  try {
    const res = await session.executeRead((tx) => tx.run(cypher, params));
    const values = res.records.map((record) => record.toObject());

    return values;
  } catch (error) {
    console.error(error);
  } finally {
    await session.close();
  }
};

module.exports = { read };
