// Connect to the Neo4j instance
const { writeFile } = require("node:fs/promises");
const neo4j = require("neo4j-driver");
const { setTimeout, setInterval } = require("node:timers");
const driver = neo4j.driver(
  "neo4j://localhost:7666",
  neo4j.auth.basic("neo4j", "password")
);

const loadQuery = `CALL apoc.load.json("file:///data.json") YIELD value
WITH value
UNWIND value AS update

// Create TripUpdate node
CREATE (tu:TripUpdate)
SET tu.timestamp = update.trip_update.timestamp,
    tu.routeId = update.trip_update.trip.route_id,
    tu.startDate = update.trip_update.trip.start_date,
    tu.startTime = update.trip_update.trip.start_time,
    tu.directionId = update.trip_update.trip.direction_id,
    tu.scheduleRelationship = update.trip_update.trip.schedule_relationship,
    tu.id = update.trip_update.trip.trip_id

// Create Vehicle node (if present)
WITH update, tu
WHERE update.trip_update.vehicle IS NOT NULL
CREATE (v:Vehicle {id: update.trip_update.vehicle.id})
CREATE (tu)-[:HAS_VEHICLE]->(v)

// Create StopTime nodes
WITH update, tu
UNWIND update.trip_update.stop_time_update AS stop
CREATE (st:StopTime)
SET st.tripUpdateId = update.trip_update.trip.trip_id,
    st.stopSequence = stop.stop_sequence,
    st.stopId = stop.stop_id,
    st.scheduleRelationship = stop.schedule_relationship,
    st.arrivalDelay = stop.arrival.delay,
    st.departureDelay = stop.departure.delay

// Create relationships between TripUpdate and StopTime nodes
WITH tu, collect(st) AS stopTimes
FOREACH (stop IN stopTimes | CREATE (tu)-[:HAS_STOP_TIME]->(stop))`;

const vehicleQuery = `CALL apoc.load.json("file:///vehicle.json") YIELD value
WITH value
UNWIND value as vehicle

MATCH (v:Vehicle {id:vehicle.vehicle.vehicle.id})

SET v.latitude = toFloat(vehicle.vehicle.position.latitude),
    v.longitude = toFloat(vehicle.vehicle.position.longitude);`;

const loadRealtime = async () => {
  const session = driver.session();
  const vehicle = driver.session();

  const deleteSession = driver.session();
  const createSession = driver.session();
  const response = await fetch(
    "https://api.nationaltransport.ie/gtfsr/v2/gtfsr?format=json",
    {
      method: "GET",
      // Request headers
      headers: {
        "Cache-Control": "no-cache",
        "x-api-key": "d63b9a029af04ba5b2d3bb2441e178e1"
      }
    }
  ).then((response) => response.json()); //now load into the database

  if (response.statusText != 200) {
    console.log("error, response", response);
  }

  const vehicleResponse = await fetch(
    "https://api.nationaltransport.ie/gtfsr/v2/Vehicles?format=json",
    {
      method: "GET",
      // Request headers
      headers: {
        "Cache-Control": "no-cache",
        "x-api-key": "729eab1cd7c74b43babb09bab70cb241"
      }
    }
  ).then((response) => response.json());

  if (vehicleResponse.statusText != 200) {
    console.log("error vehicle API response", response);
  }

  //once the file is updated/stored then check to see if there is data there already

  try {
    //once the data is fetched parse it and filter for if there is stoptimes to prevent errors when loading
    const filteredRealtime = response.entity.filter(
      (update) => update.trip_update.trip.schedule_relationship === "SCHEDULED"
    );

    const filteredVehicles = vehicleResponse.entity.filter(
      (update) => update.vehicle.trip.schedule_relationship === "SCHEDULED"
    );

    // load data into file
    await writeFile(
      "./db-gtfsr/import/data.json",
      JSON.stringify(filteredRealtime)
    );

    await writeFile(
      "./db-gtfsr/import/vehicle.json",
      JSON.stringify(filteredVehicles)
    );

    console.log("checking if existing data");
    const result = await session.run("MATCH (n) RETURN n LIMIT 25");
    if (result.length != 0) {
      console.log("nope there isnt...");
      console.log("deleting old data");
      //delete
      await deleteSession.run(`MATCH (n) DETACH DELETE n`);
      //then create
      console.log("loading new one");
      await createSession.run(loadQuery);
      await vehicle.run(vehicleQuery);
    } else {
      console.log("there isnt any so loading");
      await createSession.run(loadQuery);
      await vehicle.run(vehicleQuery);
    }
    console.log("done!");
  } catch (error) {
    console.log(error);
  } finally {
    await session.close();
    await deleteSession.close();
    await createSession.close();
    await vehicle.close();
  }
};

loadRealtime();
setInterval(loadRealtime, 90000);
