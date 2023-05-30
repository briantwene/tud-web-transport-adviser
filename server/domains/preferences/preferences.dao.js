const { read } = require("../../db/neo4j");

class PreferencesDAO {
  getStops = async (startingStop, routeCode) => {
    const response = await read(
      `MATCH (s:Stop {id: $stopId})<-[:AT]-(st:Stoptime)<-[:FOLLOWS]-(t:Trip)-[:RUNS_ON]->(r:Route {short_name: $routeId})
      MATCH (t)-[:FOLLOWS]->(st2:Stoptime)-[:AT]->(ss:Stop)
      WHERE st2.stop_sequence > st.stop_sequence
      WITH st2, ss, t
      RETURN DISTINCT ss
      `,
      { stopId: startingStop, routeId: routeCode }
    );

    return response;
  };

  getAllStops = async (routeCode) => {
    const response = await read(
      `MATCH (s:Stop)<-[:HAS_STOP]-(r:Route {short_name: $routeId})
      MATCH (s)<-[:AT]-(st:Stoptime)
       return s, st.stop_sequence as sequence`,
      { routeId: routeCode }
    );

    return response;
  };

  getTripDirection = async (stop) => {
    const response = await read(
      `MATCH (s:Stop {id: $stopId})<-[:AT]-(st:Stoptime)<-[:FOLLOWS]-(t:Trip) return t.direction_id`,
      { stopId: stop }
    );
    return response;
  };
}

module.exports = PreferencesDAO;
