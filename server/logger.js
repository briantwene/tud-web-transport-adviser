const pino = require("pino");
const fileTransport = pino.transport({
  target: "pino/file",
  options: { destination: `logs/app.log` }
});
module.exports = pino(
  { timestamp: pino.stdTimeFunctions.isoTime },
  fileTransport
);
