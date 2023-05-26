import { MongoClient, Db, Collection } from "mongodb";
import * as dotenv from "dotenv";
import { IEventCrawler } from "../interfaces/IEventCrawler";
import { IDictionary } from "../interfaces/IDictionary";
import { ITermConstraint } from "../interfaces/ITermConstraint";
import { ILinks } from "../interfaces/ILinks";

export class DBContext {
  private static instance: DBContext;
  private mongoClient: MongoClient;
  private db: Db;
  private collectionEvent: Collection<IEventCrawler>;
  private collectionDictionary: Collection<ITermConstraint>;
  private collectionLinks: Collection<ILinks>;

  private constructor(value?: string) {
    dotenv.config();

    var username;
    var password;
    var connectionString;

    if(value === "" || value === undefined || value === null)
    {
      password = process.env.MONGODB_PASSWORD;
      username = process.env.MONGODB_USERNAME;

      if(password == undefined || username == undefined)
      {
        connectionString = `mongodb://db:27017/admin`;
      }
      else
      {
        connectionString = `mongodb://${username}:${password}@${process.env.DB_CONN_STRING}`;
      }
    }
    else
    {
      connectionString = value;
    }

    try {
      console.log("username: " + username);
      console.log("password: " + password);
      console.log("DB: " + process.env.DB_CONN_STRING);
      console.log("connection string: " + connectionString);

      this.mongoClient = new MongoClient(connectionString);
    } catch (error) {
      console.error(error);
    }
  }

  public static setInstance(value?:  string): DBContext {
    DBContext.instance = new DBContext(value);

    return DBContext.instance;
  }

  public static getInstance(value?:  string): DBContext {
    if (!DBContext.instance) {
      DBContext.instance = new DBContext();
    }
    return DBContext.instance;
  }

  public getMongoClient(): MongoClient {
    return this.mongoClient;
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

  public getCollectionLinks(): Collection<ILinks> {
    return this.collectionLinks;
  }

  public async connect(): Promise<Db> {
    return new Promise(async (resolve, reject) => {
      await this.mongoClient.connect();

      this.db                   = this.mongoClient.db(process.env.DB_NAME);
      this.collectionEvent      = this.db.collection(process.env.DB_COLLECTION_EVENTCRAWLER);
      this.collectionDictionary = this.db.collection(process.env.DB_COLLECTION_DICTIONARY);
      this.collectionLinks      = this.db.collection(process.env.DB_COLLECTION_LINKS);
      
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