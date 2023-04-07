import { Collection } from "mongodb";
import { IEventCrawler } from "../interfaces/IEventCrawler";
import { DBContext } from "../services/DBContext";

export class persistenceController {
    public async save(eventCrawler: IEventCrawler): Promise<void> {
        try {
            const eventCrawlers: Collection<IEventCrawler> = DBContext.getInstance().getCollection();

            await eventCrawlers.insertOne(eventCrawler);
        } catch (err) {
            console.error("Erro ao criar registro:", err);
        }
    }
}