import { Request } from '../models/request';
import { Response } from '../models/response';

export interface IEventCrawler {
    request: Request;
    response: Response;
}