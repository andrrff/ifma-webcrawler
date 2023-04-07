import { IEventCrawler } from '../interfaces/IEventCrawler';
import { Request } from './request';
import { Response } from './response';

export class EventCrawler implements IEventCrawler  {
    request: Request;
    response: Response;

    constructor(req: Request, res: Response) {
        this.request = req;
        this.response = res;
    }
}