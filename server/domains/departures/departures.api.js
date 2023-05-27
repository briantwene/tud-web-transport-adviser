const express = require("express");
const { transport_byStop } = require("./departures.controller");

const transportAPI = express.Router();

transportAPI.get("/byStop", transport_byStop);
transportAPI.get("/byStopMulti");

module.exports = transportAPI;
