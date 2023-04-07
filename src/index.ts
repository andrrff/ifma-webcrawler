import express from "express";
import { crawler } from "./controller/crawlerController";
import { DBContext } from "./services/DBContext";

const app     = express();
const port    = 8080;

DBContext.getInstance().connect();

app.use(express.json());

app.post("/", (req, res) => {
    crawler.queue(req.body);

    res.send("Crawling started");
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
