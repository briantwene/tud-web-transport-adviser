const { HTTP404Error, HTTP400Error } = require("../../lib/errors/customErrors");
const { logError } = require("../../lib/errors/errorHandler");
const httpStatusCodes = require("../../lib/errors/httpStatusCode");
const { getTransportAtStop } = require("./departures.service");

exports.transport_byStop = async (req, res, next) => {
  const { stop_id } = req.query;
  console.log(req.query, req.params);
  try {
    if (stop_id === "" || stop_id === undefined) {
      throw new HTTP400Error(`Invalid Stop ID supplied.`);
    }
    const result = await getTransportAtStop(stop_id);
    if (!result) {
      throw new HTTP404Error(`Departures with Stop ID: ${stop_id} not found.`);
    }
    return res.status(httpStatusCodes.OK).json(result);
  } catch (error) {
    logError(error);
    next(error);
  }
};

//TODO:need to implement for all stops
exports.transport_byStopMulti = async (req, res) => {
  const { stops } = req.query;

  try {
  } catch {}
};
