import { Collection } from "mongodb";
import { IEventCrawler } from "../interfaces/IEventCrawler";
import { DBContext } from "../services/DBContext";
import { ITermConstraint } from "../interfaces/ITermConstraint";
import { ILinks } from "../interfaces/ILinks";

export class persistenceController {
    public async saveEvent(eventCrawler: IEventCrawler): Promise<void> {
        try {
            const eventCrawlers: Collection<IEventCrawler> = DBContext.getInstance().getCollectionEventCrawler();
            
            await eventCrawlers.insertOne(eventCrawler)
            .catch((err) => {
                console.error("Erro ao criar registro:", err);
            });
        } catch (err) {
            console.error("Erro ao criar registro:", err);
        }
    }

    public async saveTerms(eventCrawler: IEventCrawler): Promise<void> {
        try {
            const dictionary: Collection<ITermConstraint>  = DBContext.getInstance().getCollectionDictionary();

            await eventCrawler.response.terms.forEach(async (word) => {
                await dictionary.updateMany({ word: word }, { $push: { index: eventCrawler.index } }, { upsert: true })
                .catch((err) => {
                    console.error("Erro ao atualizar registro:", err);
                });
            });
        } catch (err) {
            console.error("Erro ao criar registro:", err);
        }
    }

    public async saveLinks(id: string, url: string): Promise<void> {
        try {
            const linksCollection: Collection<ILinks> = DBContext.getInstance().getCollectionLinks();

            await linksCollection.insertOne({ guid: id, link: url })
            .catch((err) => {
                console.error("Erro ao atualizar registro:", err);
            });
        } catch (err) {
            console.error("Erro ao criar registro:", err);
        }
    }
}