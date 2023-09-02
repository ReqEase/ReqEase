import {Responses} from "./responses/Responses";
import BaseCustomResponse = Responses.BaseCustomResponse;
import {Requester} from "../Requester";

export class ResponseHandler {
    static label: string;
    requester: Requester;
    response: Responses.Response | BaseCustomResponse;
    retry: () => void = () => {};

    protected prepare() {}

    constructor(requester: Requester, response: Responses.Response | BaseCustomResponse) {
        this.response = response;
        this.requester = requester;
    }

    // noinspection JSUnusedGlobalSymbols
    public renderResponse() {}
}

type ModalSize = Extract<Responses.Message.MessageResponseType, "big" | "medium">;

export function getSizeFromType(type: ModalSize) {
    switch (type) {
        case "big":
            return "large";
        case "medium":
            return "medium";

    }
}

export function isModalSize(type: string): type is ModalSize {
    return ["big", "medium"].includes(type);
}