const { logError } = require("../../lib/errors/errorHandler");
const TransportDAO = require("./departures.dao");

const db = new TransportDAO();
exports.getDeparturesAround = async (stops) => {
  for (const stop of stops) {
    try {
      // get the transports
      const response = await db.getTransportByStop(stops);

      //TODO: get the trip id from the response to put in here
      const realtimeUpdate = await db.getTripUpdatesForStop(response);
    } catch (e) {}
  }
};

exports.getTransportAtStop = async (stop) => {
  const departures = [];
  try {
    const response = await db.getTransportByStop(stop);
    console.log("reeee", response);
    if (response.length) {
      console.log("REee");
      for (const departure of response) {
        //get the realtime update and form an object to return
        const { trip, stop, stopId } = departure;

        const realtimeDeparture = await db.getTripUpdatesForStop(trip, stopId);
        console.log("REaltimeDeparture", realtimeDeparture);
        //combine the two

        if (realtimeDeparture) {
          console.log("okay");
          departures.push({
            ...departure,
            realtimeDelay: realtimeDeparture.properties.departureDelay
          });
        } else {
          console.log("okay");
          departures.push(departure);
        }
      }
    } else {
      return departures;
    }
    return departures;
  } catch (error) {
    logError(error);
  }
};
