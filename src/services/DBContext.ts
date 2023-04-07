import { MongoClient, Db, Collection } from "mongodb";
import * as dotenv from "dotenv";
import { IEventCrawler } from "../interfaces/IEventCrawler";

export class DBContext {
  private static instance: DBContext;
  private mongoClient: MongoClient;
  private db: Db;
  private collection: Collection<IEventCrawler>;

  private constructor() {
    dotenv.config();
    this.mongoClient = new MongoClient(process.env.DB_CONN_STRING);
  }

  public static getInstance(): DBContext {
    if (!DBContext.instance) {
      DBContext.instance = new DBContext();
    }
    return DBContext.instance;
  }

  public getDb(): Db {
    return this.db;
  }

  public getCollection(): Collection<IEventCrawler> {
    return this.collection;
  }

  public async connect(): Promise<Db> {
    return new Promise(async (resolve, reject) => {
      await this.mongoClient.connect();

      this.db         = this.mongoClient.db(process.env.DB_NAME);
      this.collection = this.db.collection(process.env.DB_COLLECTION);
      
      resolve(this.db);
    });
  }

  public async dispose(): Promise<void> {
    if (this.mongoClient) {
      await this.mongoClient.close();
      this.mongoClient = null;
      this.db = null;
    }
  }
}