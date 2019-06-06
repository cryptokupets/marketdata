import { ODataController, Edm, odata } from "odata-v4-server";
import { Exchange } from "../models/Exchange";

@odata.type(Exchange)
@Edm.EntitySet("Exchange")
export class ExchangeController extends ODataController {
  @odata.GET
  async get(): Promise<Exchange[]> {
    return [
      { name: "hitbtc" }
    ];
  }

  @odata.GET
  async getById(@odata.key key: string): Promise<Exchange> {
    return { name: "hitbtc" };
  }
}
