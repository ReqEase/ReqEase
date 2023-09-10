export class ResponseHandler {
    prepare() { }
    constructor(requester, response) {
        this.retry = () => { };
        this.response = response;
        this.requester = requester;
    }
    // noinspection JSUnusedGlobalSymbols
    renderResponse() { }
}
export function getSizeFromType(type) {
    switch (type) {
        case "modal-big":
            return "large";
        case "modal-medium":
            return "medium";
    }
}
export function isModalSize(type) {
    return ["modal-big", "modal-medium"].includes(type);
}
