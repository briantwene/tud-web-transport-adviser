const express = require("express");

const { getStopsRoute } = require("./preferences.controller");

const preferencesAPI = express.Router();

preferencesAPI.get("/stops", getStopsRoute);
module.exports = preferencesAPI;
