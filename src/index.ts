import express from "express";

const crawlerLib = require('crawler');

const app     = express();
const port    = 8080;
const urlList = new Set();

const isValidUrl = (url: string) => {
    if (urlList.has(url)) return false;

    try {
        urlList.add(url);
    } catch (e) {
        return false;
    }
    return true;
};

const crawler = new crawlerLib({
    maxConnections: 10000,
    callback: (error: any, res: { $: any; }, done: () => void) => {
        if (error) {
            console.log(error);
        } else {
            try
            {
                res.$('a').each((_index: any, a: { attribs: { href: any; }; }) => {
                if (a.attribs.href &&
                    a.attribs.href.includes('https://') ||
                    a.attribs.href.includes('http://'))
                {
                    const url = a.attribs.href;

                    if (!isValidUrl(url)) return;

                    crawler.queue(url);
                    console.log(url);
                }
            }); 
            }
            catch (e)
            {
                console.log(e);
            }
        }

        done();
    }
});

app.get("/", (req, res) => {
    res.send(crawler.queue('https://www.zenrows.com/blog/javascript-web-crawler-nodejs#before-getting-started'));
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
