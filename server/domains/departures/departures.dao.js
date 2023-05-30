const { read } = require("../../db/neo4j");
const { readRealtime } = require("../../db/neo4jRealtime");
const {
  getCurrentTimestamp,
  getCurrentDay
} = require("../../lib/getCurrentTimestamp");

class TransportDAO {
  // get transport by stop
  getTransportByStop = async (stop_id) => {
    const res = await read(
      `MATCH (s:Stop {id: $stopId})<-[:AT]-(st:Stoptime)<-[:FOLLOWS]-(t:Trip)-[:OPERATES_DAY]->(sv:Service)
      MATCH (t)-[:RUNS_ON]->(r:Route)-[:OPERATED_BY]->(a:Agency)
      WHERE st.arrival_time > $currentTime AND sv.${getCurrentDay()} = true
      RETURN DISTINCT a.name as agency, s.id as stopId, s.name as stop, r.short_name as route, t.headsign as headsign, t.id as trip, st.departure_time as departure ORDER by st.departure_time ASC LIMIT 5`,
      { stopId: stop_id, currentTime: getCurrentTimestamp() }
    );

    console.log(res);
    return res;
  };

  //TODO: put a query here for getting realtime update...
  getTripUpdatesForStop = async (trip_id, stop_id) => {
    const res = await readRealtime(
      `MATCH (tu:TripUpdate {id: $tripId})-[:HAS_STOP_TIME]->(st:StopTimeUpdate {stopId: $stopId}) return st`,
      { tripId: trip_id, stopId: stop_id }
    );
  };
}

module.exports = TransportDAO;
