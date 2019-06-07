import { Edm } from "odata-v4-server";
import { ObjectID } from "mongodb";
import { ICandle } from "../../engine/Exchange";

export class Candle implements ICandle {
  @Edm.String
  public time: Date;

  @Edm.Double
  public open: number;

  @Edm.Double
  public high: number;

  @Edm.Double
  public low: number;

  @Edm.Double
  public close: number;

  @Edm.String
  public marketDataId: ObjectID;

  constructor(jsonData: any) {
    Object.assign(this, jsonData);
  }
}
