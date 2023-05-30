const express = require("express");
const { transport_byStop } = require("./departures.controller");

const departuresAPI = express.Router();

departuresAPI.get("/byStop", transport_byStop);
departuresAPI.get("/byStopMulti");

module.exports = departuresAPI;
