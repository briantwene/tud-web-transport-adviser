const { read } = require("../../db/neo4j");

class PreferencesDAO {
  getStops = async (startingStop, routeCode) => {
    const response = await read(
      `MATCH (s:Stop {id: $stopId})<-[:AT]-(st:Stoptime)<-[:FOLLOWS]-(t:Trip)-[:RUNS_ON]->(r:Route {short_name: $routeId})
      MATCH (t2:Trip {id: t.id, route_id: r.id})-[:FOLLOWS]->(st2:Stoptime)-[:AT]->(ss:Stop)
      WHERE st2.stop_sequence > st.stop_sequence
      WITH st2, ss
      RETURN DISTINCT ss, st2.stop_sequence
      `,
      { stopId: startingStop, routeId: routeCode }
    );

    return response;
  };
}

module.exports = PreferencesDAO;
