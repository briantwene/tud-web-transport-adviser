const {
  getRoutesWithRealtime,
  getRoutesWithRealtimeV2
} = require("./route.service");

exports.getRoutes = async (req, res) => {
  const { origin, destination } = req.query;
  console.log(req.query);

  try {
    if (origin === "" || origin === "") {
      console.error("missing data");
      res.status(400).send({ msg: "Invalid request" });
    }

    const data = await getRoutesWithRealtimeV2(origin, destination);
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
  }
};
