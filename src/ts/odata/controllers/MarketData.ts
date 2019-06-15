import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { ODataController, Edm, odata, ODataQuery } from "odata-v4-server";
import { MarketData } from "../models/MarketData";
import { Candle } from "../models/Candle";
import connect from "../connect";
import { ExchangeEngine } from "../../engine/Exchange";

const collectionName = "marketData";

@odata.type(MarketData)
@Edm.EntitySet("MarketData")
export class MarketDataController extends ODataController {
  @odata.GET
  async get(@odata.query query: ODataQuery): Promise<MarketData[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) console.log(typeof mongodbQuery.query._id, mongodbQuery);
    if (mongodbQuery.query._id) mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);

    const result = typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0 ? [] : await db.collection(collectionName)
      .find(mongodbQuery.query)
      .project(mongodbQuery.projection)
      .skip(mongodbQuery.skip || 0)
      .limit(mongodbQuery.limit || 0)
      .sort(mongodbQuery.sort)
      .map(e => new MarketData(e))
      .toArray();
    if (mongodbQuery.inlinecount) {
      (<any>result).inlinecount = await db.collection(collectionName)
        .find(mongodbQuery.query)
        .project(mongodbQuery.projection)
        .count(false);
    }

    return result;
  }

  @odata.GET
  async getById(@odata.key key: string, @odata.query query: ODataQuery): Promise<MarketData> {
    const { projection } = createQuery(query);
    const _id = new ObjectID(key);
    const db = await connect();

    return new MarketData(await db.collection(collectionName).findOne({ _id }, { projection }));
  }

  @odata.POST
  async post(
    @odata.body { exchangeKey, currency, asset, timeframe }:
    { exchangeKey: string, currency: string, asset: string, timeframe: string }
  ): Promise<MarketData> {
    const db = await connect();
    const { insertedId: _id } = await db.collection(collectionName).insertOne({ exchangeKey, currency, asset, timeframe });

    return new MarketData({ _id, exchangeKey, currency, asset, timeframe });
  }

  @odata.DELETE
  async delete(@odata.key key: string): Promise<number> {
    const db = await connect();
    const _id = new ObjectID(key);
    return db.collection(collectionName).deleteOne({ _id }).then(result => result.deletedCount);
  }

  @odata.GET("Candles")
  async getCandles(@odata.result result: any, @odata.query query: ODataQuery): Promise<Candle[]> {
    const db = await connect();
    const _id = new ObjectID(result._id);
    const { currency, asset, timeframe, exchangeKey } = await db.collection(collectionName).findOne({ _id });
    return (await ExchangeEngine.getExchange(exchangeKey).getCandles({ currency, asset, timeframe }))
      .map(e => new Candle(e));
  }
}
