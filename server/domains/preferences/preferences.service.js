const PreferencesDAO = require("./preferences.dao");

const db = new PreferencesDAO();

exports.getStopsByRoute = async (stop, route) => {
  // get the stops
  console.log("stop, route", stop, route);
  stops = await db.getStops(stop, route);

  const parsedStops = stops
    .map((stop) => ({
      sequence: stop["st2.stop_sequence"],
      ...stop.ss.properties
    }))
    .sort(({ sequence: a }, { sequence: b }) => a - b);

  return parsedStops;
};
