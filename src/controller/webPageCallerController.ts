import axios from 'axios';
import cheerio from 'cheerio';
import { searchResult } from '../models/searchResult';

export class webPageCallerController {
    public static async getWebpageInfoAsync(result: searchResult): Promise<searchResult> {
        try {
            const response = await axios.get(result.link);
            const html     = response.data;

            const $ = cheerio.load(html);

            result.title       = $('title').text();
            result.favicon     = $('link[rel="icon"]').attr('href');
            result.description = $('meta[name="description"]').attr('content');

            return result;
        } catch (error) {
            console.error('Error retrieving webpage information');
            // new Error('Error retrieving webpage information.');
        }
    }
}
