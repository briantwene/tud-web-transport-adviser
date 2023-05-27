const { read } = require("../../db/neo4j");
const { readRealtime } = require("../../db/neo4jRealtime");

class TransportDAO {
  // get transport by stop
  getTransportByStop = async (stop_id) => {
    const res = await read(
      `MATCH (s:Stop {id: $stopId})<-[:AT]-(st:Stoptime)<-[:FOLLOWS]-(t:Trip)-[:RUNS_ON]->(r:Route)-[:OPERATED_BY]->(a:Agency)
      WHERE st.arrival_time > "7:00:00"
      RETURN DISTINCT a.name, s.name, r.short_name, t.headsign, t.id, st.arrival_time
      ORDER BY st.arrival_time ASC LIMIT 5`,
      { stopId: stop_id }
    );

    console.log(res);
    return res;
  };

  //TODO: put a query here for getting realtime update...
  getTripUpdatesForStop = async (trip_id) => {
    const res = await readRealtime(
      `query for getting the realtime update on the stop based on the trips returned from the previous query`,
      { tripId: trip_id }
    );
  };
}

module.exports = TransportDAO;
