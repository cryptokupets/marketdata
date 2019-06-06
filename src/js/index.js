var express = require('express');
var { CryptoServer } = require("../ts/odata/server");

require('dotenv').config();

const app = express();

// app.use(express.static('../../static/webapp'));

app.use(
  "/odata",
  CryptoServer.create()
);

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`))
