import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import { Candle } from "./Candle";

export class MarketData {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  public _id: ObjectID

  @Edm.String
  public exchangeKey: string

  @Edm.String
  public currency: string

  @Edm.String
  public asset: string

  @Edm.String
  public timeframe: string // https://ru.wikipedia.org/wiki/%D0%A2%D0%B0%D0%B9%D0%BC%D1%84%D1%80%D0%B5%D0%B9%D0%BC
  
  // moment.duration('P1Y2M3DT4H5M6S');

  // @Edm.String
  // public begin: string;
  // moment().format(); // "2014-09-08T08:02:00" (ISO 8601, no fractional seconds)
  // moment(1318874398806).unix(); // 1318874398

  // @Edm.String
  // public end: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public Candles: Candle[]

  // @Edm.Action
  // async update(@odata.result result: any, @Edm.DateTimeOffset begin?: Date, @Edm.DateTimeOffset end?: Date): Promise<void> {
    // обратиться к engine
  // }

  constructor(
    { _id, exchangeKey, currency, asset, timeframe }:
    { _id: ObjectID, exchangeKey: string, currency: string, asset: string, timeframe: string }
  ) {
    Object.assign(this, { _id, exchangeKey, currency, asset, timeframe });
  }
}
