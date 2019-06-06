import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
// import { Candle } from "./Candle";

export class MarketData {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  public _id: ObjectID

  @Edm.String
  public exchangeKey: string

  // @Edm.String
  // public currency: string

  // @Edm.String
  // public asset: string

  // @Edm.String
  // public period: string

  // @Edm.DateTimeOffset
  // public begin: Date;

  // @Edm.DateTimeOffset
  // public end: Date;

  // @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  // public Candles: Candle[]

  // @Edm.Action
  // async update(@odata.result result: any, @Edm.DateTimeOffset begin?: Date, @Edm.DateTimeOffset end?: Date): Promise<void> {
    // обратиться к engine
  // }

  constructor({ _id, exchangeKey }: { _id: ObjectID, exchangeKey: string }) {
    Object.assign(this, { _id, exchangeKey });
  }
}
