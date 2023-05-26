import express, {Request, Response} from "express";
import { crawler } from "./controller/crawlerController";
import { DBContext } from "./services/DBContext";
import _ from 'lodash';
import { searchResult } from "./models/searchResult";
import { webPageCallerController } from "./controller/webPageCallerController";

const app  = express();
const port = 8080;

DBContext.getInstance().connect();

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("hello world!");
});

app.get("/summary", (_req, res) => {
    res.send("summary!");
});

app.get("/connection", (req, res) => {
    const connection = req.query.c as string;

    DBContext.setInstance(connection).connect();
    res.send("restarted");
});

app.post("/api/robot", async (req, res) => {
    try {
        crawler.queue(req.body);

        res.send("Crawling started");
    } catch (err) {
        console.error("Error while starting crawler:", err);
        res.status(500).send("Error starting crawler");
    }
});


app.get('/search', (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;
  const dictionary = DBContext.getInstance().getCollectionDictionary().find().toArray();
  const links      = DBContext.getInstance().getCollectionLinks().find().toArray();

  dictionary.then(async (data) => {
        const searchWords = searchTerm.split(' ');
        const filtered    = data.filter(item => {
            if (!item.word) {
                return false;
            }

            const word = item.word.toLowerCase();
            return searchWords.some(searchWord => word.includes(searchWord.toLowerCase()));
        });

        const guidIndexes: searchResult[] = new Array<searchResult>();
        const guidSet = new Set();

        await Promise.all(filtered.map(async (item) => {
            const indexes = Object.entries(item.index);

            await Promise.all(indexes.map(async ([index, guid]) => {
                try {
                    if (!guidSet.has(guid)) {
                        console.log(guid);
                        let search = new searchResult(Number(index), guid, '', '', '', '', new Array<string>());
                        guidSet.add(guid);

                        const dataLink = await links;
                        search.link = dataLink.find((link) => link.guid === guid).link;

                        const data = await webPageCallerController.getWebpageInfoAsync(search);
                        item.index[Number(index)] = guid;
                        guidIndexes.push(data);
                    }
                } catch (error) {
                console.error(error);
                }
            }));
        }));


        const countedIndexes = _.countBy(guidIndexes, 'index');

        const sortedIndexes = Object.entries(countedIndexes)
            .sort(([ , countA]: [string, number], [ , countB]: [string, number]) => countB - countA)
            .map(([index]: [string, number]) => index);


        const results = guidIndexes.filter(({ index }) => sortedIndexes.includes(index.toString()));

        res.json({ searchResults: guidIndexes });
    });
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});