import { IDictionary } from "../interfaces/IDictionary";
import { termsConstraint } from "./termsConstraint";

export class Dictionary implements IDictionary {
    public terms: termsConstraint;

    public insertTerms(words: string[], index: string[]) {
        words.forEach((word) => {
            this.terms = { word: word, index: index };
        });
    }
}