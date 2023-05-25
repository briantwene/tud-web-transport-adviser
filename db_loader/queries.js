exports.IndexQueries = [
  `CREATE CONSTRAINT IF NOT EXISTS FOR (a:Agency) REQUIRE a.id is unique`,
  `  
  CREATE CONSTRAINT IF NOT EXISTS FOR (r:Route) REQUIRE r.id is unique`,
  `  
  CREATE CONSTRAINT  IF NOT EXISTS FOR (t:Trip) REQUIRE t.id is unique`,
  `
  CREATE CONSTRAINT IF NOT EXISTS FOR (s:Stop) REQUIRE s.id is unique`,
  `
  CREATE CONSTRAINT IF NOT EXISTS FOR (s:Service) REQUIRE s.id is unique`,
  `
  CREATE INDEX  index_stoptime IF NOT EXISTS FOR (n:Stoptime) ON (n.stop_sequence)`,
  `
  CREATE INDEX index_stoptime_id IF NOT EXISTS FOR (n:Stoptime) ON (n.stop_id)`,
  `CREATE INDEX shape_id IF NOT EXISTS FOR (n:Shape) ON (n.id)`,
  "CREATE INDEX shape_id IF NOT EXISTS FOR (n:Shape) ON (n.shape_id)",
  "CREATE INDEX point_lat IF NOT EXISTS FOR (n:Point) ON (n.lat)",
  "CREATE INDEX point_lon IF NOT EXISTS FOR (n:Point) ON (n.lon)",
  "CREATE INDEX point_seq IF NOT EXISTS FOR ()-[n:HAS_POINT]-() ON (n.seq)",
  "CREATE INDEX transfer_type IF NOT EXISTS FOR ()-[n:TRANSFER]-() ON (n.type)",
  "CREATE INDEX transfer_time IF NOT EXISTS FOR ()-[n:TRANSFER]-() ON (n.min_time)",
  "CREATE INDEX depart_time IF NOT EXISTS FOR (n:Stoptime) ON (n.departure_time)",
  "CREATE INDEX arrival_time IF NOT EXISTS FOR (n:Stoptime) ON (n.departure_time)"
];

exports.loadQueries = [
  `LOAD CSV WITH HEADERS FROM "file:///$folder_name/agency.txt" as agency WITH agency WHERE NOT agency.agency_name IN [$items]
  MERGE (a:Agency {id: toInteger(agency.agency_id), name: agency.agency_name, url: agency.agency_url, timezone: agency.agency_timezone});`,
  `LOAD CSV WITH HEADERS FROM 'file:///$folder_name/routes.txt' as routes
    MERGE (route:Route {id:routes.route_id, agency_id:  routes.agency_id, short_name: routes.route_short_name, long_name: routes.route_long_name, type: routes.route_type});`,
  `LOAD CSV WITH HEADERS FROM 'file:///$folder_name/trips.txt' as trips
    MERGE(trip:Trip{id: trips.trip_id, service_id: trips.service_id, headsign: coalesce(trips.trip_headsign, "Unknown"), direction_id: trips.direction_id, short_name: trips.trip_short_name, route_id: trips.route_id, shape_id: trips.shape_id});`,
  `LOAD CSV WITH HEADERS FROM 'file:///$folder_name/stops.txt' as stops
    MERGE (stop:Stop {id: stops.stop_id, name: stops.stop_name, lat: toFloat(stops.stop_lat), lon: toFloat(stops.stop_lon), code: coalesce(stops.stop_code, "Unknown")});
    `,
  `LOAD CSV WITH HEADERS FROM 'file:///$folder_name/calendar.txt' AS row
    WITH row,
         CASE row.monday WHEN "1" THEN true ELSE false END AS monday,
         CASE row.tuesday WHEN "1" THEN true ELSE false END AS tuesday,
         CASE row.wednesday WHEN "1" THEN true ELSE false END AS wednesday,
         CASE row.thursday WHEN "1" THEN true ELSE false END AS thursday,
         CASE row.friday WHEN "1" THEN true ELSE false END AS friday,
         CASE row.saturday WHEN "1" THEN true ELSE false END AS saturday,
         CASE row.sunday WHEN "1" THEN true ELSE false END AS sunday
    MERGE (s:Service {id: row.service_id})
    ON CREATE SET s.monday = monday,
                  s.tuesday = tuesday,
                  s.wednesday = wednesday,
                  s.thursday = thursday,
                  s.friday = friday,
                  s.saturday = saturday,
                  s.sunday = sunday,
                  s.start_date = row.start_date,
                  s.end_date = row.end_date
    `,
  `CALL apoc.periodic.iterate(
      'LOAD CSV WITH HEADERS FROM "file:///$folder_name/stop_times.txt" as stoptimes return stoptimes',
      'MERGE (st:Stoptime {stop_id:stoptimes.stop_id, trip_id: stoptimes.trip_id})
       SET st.arrival_time = stoptimes.arrival_time,
           st.departure_time = stoptimes.departure_time,
           st.stop_sequence = toInteger(stoptimes.stop_sequence)',
      {batchSize:100000, parallel:false}
    );`,

  `CALL apoc.periodic.iterate("
    LOAD CSV WITH HEADERS FROM 'file:///$folder_name/shapes.txt' AS row
    RETURN DISTINCT row.shape_id as shape_id
  ", "
    MERGE (s:Shape {id: shape_id})
  ", {batchSize: 50000, iterateList: true});`,

  `CALL apoc.periodic.iterate("
  LOAD CSV WITH HEADERS FROM 'file:///$folder_name/shapes.txt' AS row
  RETURN row
  ", "
  MERGE (p:Point {lat: toFloat(row.shape_pt_lat), lon: toFloat(row.shape_pt_lon)})
  ", {batchSize: 5000, iterateList: true});
  `,
  `CALL apoc.periodic.iterate(
      "MATCH(s:Stop)
      WITH s
      MATCH (st:Stoptime)
      WHERE s.id= st.stop_id return s, st",
      "MERGE (s) <- [:AT] - (st)",
      {batchSize:50000}
      );`,
  `CALL apoc.periodic.iterate(
          "MATCH(t:Trip)
          WITH t
          MATCH (st:Stoptime)
          WHERE t.id = st.trip_id return t, st",
          "MERGE (t)-[:FOLLOWS]-> (st)",
          {batchSize:5000}
          );
          `,
  `CALL apoc.periodic.iterate(
              "MATCH (s1:Stoptime)<-[:FOLLOWS]-(t:Trip),  
              (s2:Stoptime)<-[:FOLLOWS]-(t)  
              WHERE s2.stop_sequence=s1.stop_sequence+1   return s1, s2",
              "MERGE (s1)-[:PRECEDES]->(s2)",
              {batchSize:5000}
              );`,
  `CALL apoc.periodic.iterate("
    LOAD CSV WITH HEADERS FROM 'file:///$folder_name/shapes.txt' AS row
    return row","
    MATCH (s:Shape {id: row.shape_id})
    MATCH (p:Point {lat: toFloat(row.shape_pt_lat), lon: toFloat( row.shape_pt_lon)})
    MERGE (s)-[:HAS_POINT {seq: toInteger(row.shape_pt_sequence)}]->(p)
  ", {batchSize: 50000, iterateList: true});
  `,

  `MATCH(a:Agency)
  WITH a
  MATCH (r:Route)
  WHERE a.id = toInteger(r.agency_id)
  CREATE (a) <- [:OPERATED_BY] - (r);`,

  `MATCH(r:Route)
  WITH r
  MATCH (t:Trip)
  WHERE r.id = t.route_id
  MERGE (t) - [:RUNS_ON] -> (r);`,

  `MATCH(s:Service)
  WITH s
  MATCH (t:Trip)
  WHERE t.service_id = s.id
  MERGE (t) - [:OPERATES_DAY] -> (s);`,

  `call apoc.periodic.iterate("LOAD CSV WITH HEADERS FROM 'file:///$folder_name/stop_times.txt' AS row return row","MATCH (t:Trip {id: row.trip_id})
  MATCH (s:Stop {id: row.stop_id})
  MATCH (r:Route {id: t.route_id})
  MERGE (r)-[:HAS_STOP]->(s)", {batchSize: 10000, iterateList:true});`,

  `CALL apoc.periodic.iterate(
    "LOAD CSV WITH HEADERS FROM 'file:///$folder_name/transfers.txt' AS row return row",
    "MATCH (from:Stop {id: row.from_stop_id})
  MATCH (to:Stop {id: row.to_stop_id})
  MERGE (from)-[:TRANSFER {type: row.transfer_type, min_time: row.min_transfer_time}]->(to)",
    {batchSize: 10000, iterateList: true}
  );`,
  `CALL apoc.periodic.iterate("MATCH (t:Trip)
  return t", "MATCH (s:Shape)
  WHERE t.shape_id = s.id
  MERGE (t)-[:HAS_SHAPE]->(s)", {batchSize: 50000})
  `
];
