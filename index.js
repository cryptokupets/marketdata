'use strict';

var express = require('express');

var _require = require("./lib/ts/odata/server"),
    CryptoServer = _require.CryptoServer;

require('dotenv').config();

var app = express();

app.use(express.static('./static/webapp'));

app.use("/odata", CryptoServer.create());

var PORT = 3000;
app.listen(PORT, function () {
  return console.log('Listening on ' + PORT);
});