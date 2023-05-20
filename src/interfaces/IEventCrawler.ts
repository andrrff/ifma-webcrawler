import { Request } from '../models/request';
import { Response } from '../models/response';

export interface IEventCrawler {
    index: string;
    request: Request;
    response: Response;
}