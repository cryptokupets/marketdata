import { MongoClient, Db } from "mongodb";

let connect: MongoClient;

export default async function(): Promise<Db>{
    const uri = process.env.MONGODB_URI;

    if (!connect) connect = await MongoClient.connect(uri, { useNewUrlParser: true });
    if (!connect.isConnected()) await connect.connect();
    
    return connect.db();
};