const TransportDAO = require("./departures.dao");

const db = new TransportDAO();
exports.getDeparturesAround = async (stops) => {
  for (const stop of stops) {
    try {
      // get the transports
      const response = await db.getTransportByStop(stop);

      //TODO: get the trip id from the response to put in here
      const realtimeUpdate = await db.getTripUpdatesForStop(response);
    } catch (e) {}
  }
};
