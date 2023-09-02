import {Responses} from "./responses/Responses";

export type HttpResponseOptionsEntered = Partial<HttpResponseOptions>;

export interface HttpResponseOptions {
    autoResponseRender: boolean;
    rejectUnknownResponse: boolean;
    callbacks: Responses.Callbacks
}