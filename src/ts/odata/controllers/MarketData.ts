import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { ODataController, Edm, odata, ODataQuery } from "odata-v4-server";
import { MarketData } from "../models/MarketData";
// import { Candle } from "../models/Candle";
import connect from "../connect";

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
  async post(@odata.body { exchangeKey }: { exchangeKey: string }): Promise<MarketData> {
    const db = await connect();
    const result = await db.collection(collectionName).insertOne({ exchangeKey });
    return new MarketData({ _id: result.insertedId, exchangeKey });
  }

  @odata.DELETE
  async delete(@odata.key key: string): Promise<number> {
    const db = await connect();
    const _id = new ObjectID(key);
    return db.collection(collectionName).deleteOne({ _id }).then(result => result.deletedCount);
  }

  // @odata.GET("Candles")
  // async getCandles(@odata.result result: any, @odata.query query: ODataQuery): Promise<Candle[]> {
  //   const db = await connect();
  //   const mongodbQuery = createQuery(query);
  //   if (typeof mongodbQuery.query._id === "string") mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
  //   if (typeof mongodbQuery.query.marketDataId === "string") mongodbQuery.query.marketDataId = new ObjectID(mongodbQuery.query.marketDataId);
  //   let candles = typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0 ? [] : await db.collection("candle")
  //     .find({ $and: [{ marketDataId: result._id }, mongodbQuery.query] })
  //     .project(mongodbQuery.projection)
  //     .skip(mongodbQuery.skip || 0)
  //     .limit(mongodbQuery.limit || 0)
  //     .sort(mongodbQuery.sort)
  //     .toArray();
  //   if (mongodbQuery.inlinecount) {
  //     (<any>candles).inlinecount = await db.collection("candle")
  //       .find({ $and: [{ marketDataId: result._id }, mongodbQuery.query] })
  //       .project(mongodbQuery.projection)
  //       .count(false);
  //   }
  //   return candles;
  // }
}
