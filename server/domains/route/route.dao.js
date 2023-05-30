const { read } = require("../../db/neo4j");
const { readRealtime } = require("../../db/neo4jRealtime");
const {
  getCurrentDay,
  getCurrentTimestamp
} = require("../../lib/getCurrentTimestamp");

class RouteDAO {
  getRoutesFromDB = async (origin, destination) => {
    try {
      // method for path finding
      const response = await read(
        `
          MATCH (start_stop:Stop{id: $originStop}) <-[:AT]-(start_stop_time:Stoptime)<-[:FOLLOWS]-(trip:Trip)
          -[:RUNS_ON]-> (route:Route)
          MATCH (end_stop:Stop{id: $destinationStop})<-[:AT]-(end_stop_time:Stoptime)<-[:FOLLOWS]-(trip)
          -[:RUNS_ON]->(r)-[:OPERATED_BY]->(agency:Agency)
          MATCH (s:Service)
          MATCH (trip)-[:OPERATES_DAY]-(s)
          WHERE start_stop_time.departure_time > $currentTime 
          AND end_stop_time.departure_time > start_stop_time.departure_time 
          AND s.${getCurrentDay()} = true
          return distinct route.id, trip.id ,route.short_name, agency.name, 
          start_stop.id, end_stop.id, start_stop.name, 
          end_stop.name, start_stop_time.departure_time, 
          end_stop_time.arrival_time
          ORDER BY end_stop_time.arrival_time
          
      `,
        {
          originStop: origin,
          destinationStop: destination,
          currentTime: getCurrentTimestamp()
        }
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  getRoutesFromDBV2 = async (origin, destination) => {
    try {
      const response = await read(
        `// Get the start and end stops with stop times
        MATCH (start:Stop {id: $originStop})<-[:AT]-(s_st:Stoptime)<-[:FOLLOWS]-(trip:Trip)-[:OPERATES_DAY]->(service:Service)
        WHERE s_st.departure_time >= $currentTime AND service.${getCurrentDay()} = true
        
        WITH start, s_st, trip, service
        
        MATCH (end:Stop {id: $destinationStop})<-[:AT]-(e_st:Stoptime)<-[:FOLLOWS]-(trip)
        WHERE e_st.arrival_time > s_st.departure_time
        
        WITH start, s_st, end, e_st, trip, service
        
        // Connect the stop times to their associated stops
        MATCH (s_st)-[:AT]->(startStop:Stop)-[:HAS_STOP]-(route:Route)-[:OPERATED_BY]->(agency:Agency)
        MATCH (e_st)-[:AT]->(endStop:Stop)
        
        // Traverse to get stops (not actually needed)
        MATCH p = allShortestPaths((s_st)-[:PRECEDES*]-(e_st))
        WITH nodes(p) AS pathNodes, start, s_st, startStop, end, e_st, endStop, trip, service, route, agency
        
        // Match the stops associated with the path nodes
        UNWIND pathNodes AS pathNode
        MATCH (pathNode)-[:AT]->(stop:Stop)
        
        
        RETURN start, s_st as startStopTime, startStop, end, e_st as endStopTime, endStop, trip, service, pathNodes, collect(stop) AS stops, route, agency ORDER BY s_st.departure_time
      
        
      `,
        {
          originStop: origin,
          destinationStop: destination,
          currentTime: getCurrentTimestamp()
        }
      );
      //console.log("res", response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  // method for getting live data based on static
  getTripUpdatesFromDB = async (tripId, start, end) => {
    try {
      const res = await readRealtime(
        `MATCH (st1:StopTime {tripUpdateId: $trip_id, stopId: $start_stop})
            MATCH (st2:StopTime {tripUpdateId: $trip_id, stopId: $end_stop})
            RETURN st1.departureDelay as startRealtime, st2.arrivalDelay as endRealtime`,
        { trip_id: tripId, start_stop: start, end_stop: end }
      );
      return res;
    } catch (error) {
      console.error(error);
    }
  };

  // method for fetching shapes for mapping
  getTripShape = async (tripId) => {
    try {
      const response = await read(
        `MATCH (t:Trip {id: $trip_id})-[:HAS_SHAPE]->(s:Shape)-[ps:HAS_POINT]->(p)
              RETURN p.lat as lat, p.lon as lon order by ps.seq`,
        { trip_id: tripId }
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  };
}

module.exports = RouteDAO;
