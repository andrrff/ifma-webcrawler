export class Response {
    public internalLinks: string[];
    public externalLinks: string[];
    public metatags: string[];
    public headers: string[];
    public body: string[];
    public rawText: string;
    public terms: string[];

    constructor() {
        this.internalLinks = [];
        this.externalLinks = [];
        this.metatags      = [];
        this.headers       = [];
        this.body          = [];
    }

    public insertInternalLink(link: string) {      
        this.internalLinks.push(link);
    }

    public insertExternalLink(link: string) {
        this.externalLinks.push(link);
    }

    public insertMetatag(metatag: string) {
        this.metatags.push(metatag);
    }

    public insertHeader(header: string) {
        this.headers.push(header);
    }

    public insertBody(body: string) {
        this.body.push(body);
    }

    public insertRawText(rawText: string) {
        this.rawText = rawText;
    }

    public insertTerms(text: string) {
        let words = text.split(' ');
        
        words = words.filter((value, index, self) => {
            return self.indexOf(value) === index && value !== '';
        });

        this.terms = words;
    }
}