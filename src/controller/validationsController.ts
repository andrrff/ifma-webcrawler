export class ValicationsController {
    public static isValidUrl = (urlList: string[], url: string) => {   
        urlList.forEach((element) => {
            if (element === url) return false;
        });

        return true;
    }

    public static validate = (element: string, parentUrl: string, urlList: string[]) => {
        return ((element &&
                element.includes('https://') ||
                element.includes('http://')) &&
                !element.includes(parentUrl)) &&
                this.isValidUrl(urlList, element);
    }

}