const { HTTP400Error } = require("../../lib/errors/customErrors");
const { logError } = require("../../lib/errors/errorHandler");
const {
  getRoutesWithRealtime,
  getRoutesWithRealtimeV2
} = require("./route.service");

exports.getRoutes = async (req, res, next) => {
  const { origin, destination } = req.query;
  console.log(req.query);

  try {
    if (!origin || !destination) {
      throw new HTTP400Error("Invalid Request");
    }

    const data = await getRoutesWithRealtimeV2(origin, destination);
    res.status(200).send(data);
  } catch (error) {
    logError(error);
    next(error);
  }
};
