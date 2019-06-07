import { Edm, odata } from "odata-v4-server";

export class Exchange {
  @Edm.Key
  @Edm.String
  public key: string

  @Edm.Function
  @Edm.String
  public getCandles(
    @Edm.String currency: string,
    @Edm.String asset: string,
    @Edm.String period: string,
    @odata.result result: any
  ): any {
    return { currency, asset, period, exchange: result.key };
  }

  constructor({ key }: { key: string }) {
    Object.assign(this, { key });
  }
}
