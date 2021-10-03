import IIconImageMaker from "../Interface/IIconImageMaker";

export default class IconImageMaker implements IIconImageMaker {
    private mimeList: Map<string, string>;

    constructor() {
        this.mimeList = new Map<string, string>();
        const mimeList = require("../../mimeList.json");
        mimeList.forEach((e) => {
            e.mime.forEach((item) => {
                this.mimeList.set(item, e.url);
            });
        });
    }

    static _Current: IconImageMaker = null;
    static get Current(): IconImageMaker {
        if (!IconImageMaker._Current) {
            IconImageMaker._Current = new IconImageMaker();
        }
        return IconImageMaker._Current;
    }

    getMIMEImage(mime: string, width: number): HTMLImageElement {
        const img = document.createElement("img");
        img.setAttribute("width", `${width}px`);

        if (mime) {
            const url = this.mimeList.get(mime);
            if (url) {
                img.setAttribute("src", `assets/images/${url}-${width}.png`);
            } else {
                img.setAttribute("src", `assets/images/file-unknown-${width}.png`);
            }
        } else {
            img.setAttribute("src", `assets/images/folder-${width}.png`);
        }
        return img;
    }
}
