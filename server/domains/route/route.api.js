const express = require("express");
//create router instance for domain
const routerAPI = express.Router();
const { getRoutes } = require("./route.controller");

//create get endpoint
routerAPI.get("/", getRoutes);

module.exports = routerAPI;
