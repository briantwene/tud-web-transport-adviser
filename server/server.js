const express = require("express");
const cors = require("cors");
const routerAPI = require("./domains/route/route.api");
const preferencesAPI = require("./domains/preferences/preferences.api");
const departuresAPI = require("./domains/departures/departures.api");
const logger = require("./logger");
const { isOperationalError } = require("./lib/errors/errorHandler");

const app = express();
const port = process.env.PORT || 3443;
app.use(cors());

app.get("/", (req, res) => {
  res.type("text/plain");
  res.send("Welcome to the base of webtransportapi");
});

app.use("/route", routerAPI);
app.use("/preferences", preferencesAPI);
app.use("/departures", departuresAPI);

app.use((req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("404 error not found");
});

process.on("uncaughtException", (error) => {
  logger.fatal(error);

  if (!isOperationalError(error)) {
    process.exit(1);
  }
});

app.listen(port, () =>
  console.log(`server is running at http://localhost:${port}`)
);
