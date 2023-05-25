const { getStopsByRoute } = require("./preferences.service");

exports.getStopsRoute = async (req, res) => {
  // get user params
  const { stopId, routeId } = req.query;
  console.log("stopId, routeId", stopId, routeId);

  //query db for static data
  if (stopId === "" || routeId === "") {
    console.error("stop_id not found");
  }
  const result = await getStopsByRoute(stopId, routeId);
  return res.status(200).json(result);
};
