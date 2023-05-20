import { MongoClient, Db, Collection } from "mongodb";
import * as dotenv from "dotenv";
import { IEventCrawler } from "../interfaces/IEventCrawler";
import { IDictionary } from "../interfaces/IDictionary";
import { ITermConstraint } from "../interfaces/ITermConstraint";

export class DBContext {
  private static instance: DBContext;
  private mongoClient: MongoClient;
  private db: Db;
  private collectionEvent: Collection<IEventCrawler>;
  private collectionDictionary: Collection<ITermConstraint>;

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

  public getCollectionEventCrawler(): Collection<IEventCrawler> {
    return this.collectionEvent;
  }

  public getCollectionDictionary(): Collection<ITermConstraint> {
    return this.collectionDictionary;
  }

  public async connect(): Promise<Db> {
    return new Promise(async (resolve, reject) => {
      await this.mongoClient.connect();

      this.db                   = this.mongoClient.db(process.env.DB_NAME);
      this.collectionEvent      = this.db.collection(process.env.DB_COLLECTION_EVENTCRAWLER);
      this.collectionDictionary = this.db.collection(process.env.DB_COLLECTION_DICTIONARY);
      
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