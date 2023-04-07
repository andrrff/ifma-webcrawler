export class ValicationsController {
    public static isValidUrl = (urlList: string[], url: string) => {
        if (urlList.length > 0) {
            for (let index = 0; index < urlList.length; index++) {
                if (urlList[index] === url) {
                    return false;
                }
            }
        }
    }

    public static validate = (element: string, urlList: string[]) => {
        return (element &&
                element.includes('https://') ||
                element.includes('http://')) &&
                this.isValidUrl(urlList, element);
    }

}