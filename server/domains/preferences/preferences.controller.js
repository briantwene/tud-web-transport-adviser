const { HTTP404Error, HTTP400Error } = require("../../lib/errors/customErrors");
const { logError } = require("../../lib/errors/errorHandler");
const { getStopsByRoute } = require("./preferences.service");

exports.getStopsRoute = async (req, res, next) => {
  try {
    // get user params
    const { stopId, routeId } = req.query;

    //query db for static data
    if (!stopId || !routeId) {
      throw new HTTP400Error(`Invalid IDs supplied.`);
    }
    const result = await getStopsByRoute(stopId, routeId);
    if (result === null) {
      throw new HTTP404Error(
        `Departures with Stop ID: ${stopId} and RouteID: ${routeId} not found.`
      );
    }
    return res.status(200).json(result);
  } catch (error) {
    logError(error);
    next(error);
  }
};
