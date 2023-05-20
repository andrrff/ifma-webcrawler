import { Collection } from "mongodb";
import { IEventCrawler } from "../interfaces/IEventCrawler";
import { DBContext } from "../services/DBContext";
import { ITermConstraint } from "../interfaces/ITermConstraint";

export class persistenceController {
    public async save(eventCrawler: IEventCrawler): Promise<void> {
        try {
            const eventCrawlers: Collection<IEventCrawler> = DBContext.getInstance().getCollectionEventCrawler();
            const dictionary: Collection<ITermConstraint> = DBContext.getInstance().getCollectionDictionary();

            await eventCrawler.response.terms.forEach((word) => {
                dictionary.updateMany({ word: word }, { $push: { index: eventCrawler.index } }, { upsert: true }).then(() => {
                    console.log("Registro atualizado com sucesso!");
                }).catch((err) => {
                    console.error("Erro ao atualizar registro:", err);
                });
            });
            
            await eventCrawlers.insertOne(eventCrawler).then(() => {
                console.log("Registro criado com sucesso!");
            }).catch((err) => {
                console.error("Erro ao criar registro:", err);
            });
        } catch (err) {
            console.error("Erro ao criar registro:", err);
        }
    }
}