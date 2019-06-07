import { Edm, odata } from "odata-v4-server";
import { ExchangeEngine, ICandle } from "../../engine/Exchange";

export class Exchange {
  @Edm.Key
  @Edm.String
  public key: string

  @Edm.Function
  @Edm.String
  public async getCandles(
    @Edm.String currency: string,
    @Edm.String asset: string,
    @Edm.String period: string,
    @odata.result result: any
  ): Promise<ICandle[]> {
    return ExchangeEngine.getExchange(result.key).getCandles({ currency, asset, period });
  }

  constructor({ key }: { key: string }) {
    Object.assign(this, { key });
  }
}
