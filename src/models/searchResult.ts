export class searchResult
{
    index: number;
    guid: string;
    link: string;
    title: string;
    description: string;
    favicon: string;
    terms: string[];

    constructor(index: number, guid: string, link: string, title: string, description?: string, favicon?: string, terms?: string[])
    {
        this.index       = index;
        this.guid        = guid;
        this.link        = link;
        this.title       = title;
        this.description = description;
        this.favicon     = favicon;
        this.terms       = terms;
    }
}