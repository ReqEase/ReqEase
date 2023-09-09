import {Responses} from "./responses/Responses";
import {InputMessageRenderer} from "../../view/messages/InputMessage";
import {FormMessageRenderer} from "../../view/messages/FormMessage";
import {ToastMessageRenderer} from "../../view/messages/ToastMessage";
import {ResponseHandler} from "./ResponseHandler";

export type HttpResponseOptionsEntered = Partial<HttpResponseOptions>;

export interface HttpResponseOptions {
    autoResponseRender: boolean;
    rejectUnknownResponse: boolean;
    callbacks: Responses.Callbacks;
    responseHandlersToRegister: (typeof ResponseHandler)[] | typeof ResponseHandler;
    inputMessageRenderer?: InputMessageRenderer | undefined;
    formMessageRenderer?: FormMessageRenderer | undefined;
    toastMessageRenderer?: ToastMessageRenderer | undefined;
}