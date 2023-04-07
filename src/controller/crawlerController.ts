import { ValicationsController as validations } from './validationsController';
import { Request } from "../models/request";
import { Response } from "../models/response";
import { EventCrawler } from '../models/eventCrawler';
import { persistenceController } from "./persistenceController";

const crawlerLib = require('crawler');
const request    = new Request();
const response   = new Response();
const data       = new persistenceController();

let eventCrawler = new EventCrawler(request, response);

let uri: string;

export const crawler = new crawlerLib({
    maxConnections: 1,
    callback: (error: any, res: { $: any; }, done: () => void) => {
        if (error) {
            console.log(error);
        } else {
            try
            {
                res.$('a').each((_index: any, a: { attribs: { href: any; }; }) => {
                    const url = a.attribs.href;

                    if (validations.validate(a.attribs.href, request.links)) {
                        response.insertExternalLink(url);
                        console.log(url);

                        if (response.externalLinks.length < 100)
                        {
                            crawler.queue(url);
                        }
                    }
                    else
                    {
                        response.insertExternalLink(url);
                        crawler.queue(uri + url);
                    }
                }); 

                res.$('meta').each((_index: any, meta: { attribs: { content: any; }; }) => {
                    response.insertMetatag(meta.attribs.content);
                });

                res.$('header').children().each((_index: any, header: { attribs: { content: any; }; }) => {
                    response.insertHeader(header.attribs.content);
                });

                res.$('body').children().each((_index: any, body: { attribs: { content: any; }; }) => {
                    response.insertBody(body.attribs.content);
                });

                eventCrawler = new EventCrawler(request, response);
                console.log(eventCrawler);
                data.save(eventCrawler);

                done();
            }
            catch (e)
            {
                console.log(e);
            }
        }
    },
    preRequest: (options: any, done: any) => {
        console.log(options);
        request.links = options.uri;
        done();
    }
});