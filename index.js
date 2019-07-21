"use strict";

require("dotenv").config();

const express = require("express");
const { MarketDataServer } = require("marketdata-api");

const app = express();
const port = process.env.PORT;

app.use(express.static(__dirname + "/webapp"));
app.use("/odata", MarketDataServer.create());

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
