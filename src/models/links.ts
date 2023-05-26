import { ILinks } from "../interfaces/ILinks";

export class links implements ILinks{
    public guid: string;
    public link: string;

    constructor(guid: string, link: string){
        this.guid = guid;
        this.link = link;
    }

    public insert = (link: string) => {
        this.link = link;
    }
}