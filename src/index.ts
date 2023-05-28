import express, {Request, Response} from "express";
import { crawler } from "./controller/crawlerController";
import { DBContext } from "./services/DBContext";
import _ from 'lodash';
import { searchResult } from "./models/searchResult";
import { webPageCallerController } from "./controller/webPageCallerController";

const cors = require("cors");
const app  = express();
const port = 8080;

DBContext.getInstance().connect();

app.use(express.json());
app.use(cors());

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
  const maxLinks   = req.query.l as string || '5';
  const dictionary = DBContext.getInstance().getCollectionDictionary().find().toArray();
  const links      = DBContext.getInstance().getCollectionLinks().find().toArray();

  dictionary.then(async (data) => {
        const searchWords = searchTerm.split(' ');
        const filtered = data.filter((item) => {
            if (!item.word) {
                return false;
            }

            const word = item.word.toLowerCase();
            return searchWords.some((searchWord) =>
                word.includes(searchWord.toLowerCase())
            );
        });

        const dataLinks = await links;
        const foundSites = new Set<any>();

        await Promise.all([
            dataLinks.forEach((link) => {
                filtered.forEach((item) => {
                item.index.forEach((index) => {
                    if (index === link.guid) {
                    foundSites.add({ id: index, link: link.link });
                    }
                });
                });
            }),
            dataLinks.forEach((link) => {
                searchWords.forEach((searchWord) => {
                if (link.link.toLowerCase().includes(searchWord.toLowerCase())) {
                    filtered.forEach((item) => {
                    const guid = item.index;
                    foundSites.add({ id: guid, link: link.link });
                    });
                }
                });
            })
        ])

        const guidSet = new Set<string>(); // Armazena os links únicos
        const guidIndexes: searchResult[] = []; // Array de resultados
        const promises: Promise<searchResult>[] = [];

        for (const item of foundSites) {
            if (guidSet.size >= Number(maxLinks)) {
                break;
            }

            if (item.id === undefined) continue;

            const search: searchResult = new searchResult(
                Number(guidIndexes.length),
                item.id || ""
            );

            search.link = item.link;

            if (!guidSet.has(search.link)) {
                guidSet.add(search.link);

                const promise = webPageCallerController
                    .getWebpageInfoAsync(search)
                    .catch(() => {
                        return search;
                    });

                promises.push(promise);
            }
        }

        const resultsProm = await Promise.all(promises);
        guidIndexes.push(...resultsProm.filter((result) => result !== null));


        const countedIndexes = _.countBy(guidIndexes, "index");

        const sortedIndexes = Object.entries(countedIndexes)
            .sort(
                ([, countA]: [string, number], [, countB]: [string, number]) =>
                    countB - countA
            )
            .map(([index]: [string, number]) => index);


        const filteredResults = guidIndexes.filter(
            (item) =>
            {
                try
                {
                    if (item.index !== undefined) {
                        return sortedIndexes.includes(
                            item.index.toString() || ""
                        );
                    }
                }
                catch (err)
                {
                    console.error(err);
                }

                return false;
            }
        );

        res.json({ searchResults: filteredResults });
    });
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});