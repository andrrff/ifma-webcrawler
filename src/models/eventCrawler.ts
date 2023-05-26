import { IEventCrawler } from '../interfaces/IEventCrawler';
import { Request } from './request';
import { Response } from './response';

const uuidv4 = require('uuid/v4');

export class EventCrawler implements IEventCrawler  {
    index: string;
    request: Request;
    response: Response;

    constructor(req: Request, res: Response, id?: string) {
        this.index    = id || uuidv4();
        this.request  = req;
        this.response = res;
    }
}