import { ODataController, Edm, odata } from "odata-v4-server";
import { Exchange } from "../models/Exchange";
import { MarketDataEngine } from "../../engine/MarketData";

@odata.type(Exchange)
@Edm.EntitySet("Exchange")
export class ExchangeController extends ODataController {
  @odata.GET
  get(): Exchange[] {
    return MarketDataEngine.getExchangeKeys().map(key => new Exchange({ key }));
  }

  @odata.GET
  getById(@odata.key key: string): Exchange {
    return new Exchange({
      key: MarketDataEngine.getExchangeKeys().find(e => e === key)
    });
  }
  // список периодов
  // список валютных пар
}
