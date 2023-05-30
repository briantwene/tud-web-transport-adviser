const PreferencesDAO = require("./preferences.dao");

const db = new PreferencesDAO();

exports.getStopsByRoute = async (stop, route) => {
  stops = await db.getStops(stop, route);

  const parsedStops = stops
    .map(({ ss: stop }) => stop.properties)
    .sort((a, b) => a.name.localeCompare(b.name));

  return parsedStops;
};
