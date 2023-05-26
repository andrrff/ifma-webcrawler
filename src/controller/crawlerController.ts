import { ValidationsController as validations } from '../models/validationsController';
import { Request } from "../models/request";
import { Response } from "../models/response";
import { EventCrawler } from '../models/eventCrawler';
import { persistenceController } from "./persistenceController";

const crawlerLib = require('crawler');
const uuidv4     = require('uuid/v4');
const request    = new Request();
const response   = new Response();
const data       = new persistenceController();
const maxLinks   = 1000;

let eventCrawler = new EventCrawler(request, response);

let uri: string;
let bodyText: string = "";
let uriUsed: string[] = [];

const insertUriUsed = (url: string) => {
    if(uriUsed.length < maxLinks && uriUsed.indexOf(url) === -1)
    {
        uriUsed.push(url);
        crawler.queue(url);

        return true;
    }

    return false;
}


const ignoreSelector = `:not([href$=".png"]):not([href$=".jpg"]):not([href$=".mp4"]):not([href$=".mp3"]):not([href$=".gif"])`;

export const crawler = new crawlerLib({
    maxConnections: 100,
    setTimeout: 500,
    callback: async (error: any, res: any, done: () => void) => {
        if (error) {
            console.log(error);
        } else {
            try
            {
                const id = uuidv4();

                res.$(`a[href^="/"]${ignoreSelector},a[href^="${uri}"]${ignoreSelector},a[href^="https://"],a[href^="http://"]`)
                .each(async (_index: number, a: { attribs: { href: any; }; }) => {
                    let url = a.attribs.href;

                    if (validations.validate(url, uri, response.externalLinks)) {
                        if(!insertUriUsed(url)) return;

                        console.log(`id: ${uriUsed.length} external: ${url}`);
                        
                        response.insertExternalLink(url);
                    }
                    else
                    {
                        url = uri + url;
                        
                        if(!insertUriUsed(url)) return;
                        
                        console.log(`id: ${uriUsed.length} internal: ${url}`);
                        
                        response.insertInternalLink(url);
                    }

                    await data.saveLinks(id, url);
                });

                res.$('meta').each((_index: number, meta: { attribs: { content: any; }; }) => {
                    response.insertMetatag(meta.attribs.content);
                });

                res.$('header').children().each((_index: number, header: { children: any }) => {
                    recursiveChildrenDataHeader(header.children);
                });

                res.$('body').children().each((_index: number, body: { children: any; }) => {
                    recursiveChildrenDataBody(body.children);

                    response.insertRawText(bodyText);
                    response.insertTerms(bodyText);
                });

                eventCrawler = new EventCrawler(request, response, id);
                await data.saveEvent(eventCrawler);
                await data.saveTerms(eventCrawler);

                done();
            }
            catch (e)
            {
                console.error(e);
            }
        }
    },
    preRequest: (options: any, done: any) => {
        uri = options.uri;
        request.links = options.uri;

        if(uriUsed.length < maxLinks)
        {
            done();
        }
    }
});

const recursiveChildrenDataBody = (children: any) => {
    let data: string;

    children.forEach((child: any) => {
        if (child.data !== undefined && child.data !== null && child.data !== "") 
        {
            data = child.data.replace(/(\r\n|\n|\r)/gm, "");

            bodyText += data;
            bodyText = bodyText.replace(/\s\s+/g, ' ');

            response.insertBody(data);
        }

        if (child.children !== undefined) recursiveChildrenDataBody(child.children);
    });
}

const recursiveChildrenDataHeader = (children: any) => {
    let data: string;

    children.forEach((child: any) => {
        if (child.data !== undefined && child.data !== null && child.data !== "") 
        {
            data = child.data.replace(/(\r\n|\n|\r)/gm, "");

            response.insertHeader(data);
        }

        if (child.children !== undefined) recursiveChildrenDataHeader(child.children);
    });
}