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

type ModalSize = Extract<Responses.Message.MessageResponseType, "modal-big" | "modal-medium">;

export function getSizeFromType(type: ModalSize) {
    switch (type) {
        case "modal-big":
            return "large";
        case "modal-medium":
            return "medium";

    }
}

export function isModalSize(type: string): type is ModalSize {
    return ["modal-big", "modal-medium"].includes(type);
}