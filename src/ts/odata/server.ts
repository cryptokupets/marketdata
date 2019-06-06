import { ODataServer, odata } from "odata-v4-server";
// import { MarketDataController } from "./controllers/MarketData";
import { ExchangeController } from "./controllers/Exchange";

@odata.cors
@odata.namespace("Crypto")
// @odata.controller(MarketDataController, true)
@odata.controller(ExchangeController, true)
export class CryptoServer extends ODataServer {}
