import {HttpResponseOptions, HttpResponseOptionsEntered} from "./HttpResponseOptions";
import {HttpResponse} from "./HttpResponse";
import {RequesterOptions} from "../RequesterOptions";
import {defaultInputMessageRenderer} from "../../forms/FormValidatorBuilder";
import {defaultFormMessageRenderer} from "../../view/messages/FormMessage";
import {defaultToastMessageRenderer} from "../../view/messages/ToastMessage";
import {collectResponseHandlers} from "./responses/handlers/HandlerCollector";

export class HttpResponseBuilder {
    requesterOptions: RequesterOptions
    httpResponseOptionsEntered: HttpResponseOptionsEntered;
    httpResponse: HttpResponse;
    constructor(requesterOptions: RequesterOptions, httpResponseOptionsEntered: HttpResponseOptionsEntered) {
        this.requesterOptions = requesterOptions;
        this.httpResponseOptionsEntered = httpResponseOptionsEntered;
        this.httpResponse = new HttpResponse();
        this.httpResponseOptionsEntered.responseHandlersToRegister = httpResponseOptionsEntered.responseHandlersToRegister??[];
    }
    build() {
        collectResponseHandlers();
        if (Array.isArray(this.httpResponseOptionsEntered.responseHandlersToRegister)) {
            collectResponseHandlers(this.httpResponseOptionsEntered.responseHandlersToRegister);
        }
        else{
            collectResponseHandlers([this.httpResponseOptionsEntered.responseHandlersToRegister]);
        }
        this.httpResponse.httpResponseOptions = $.extend(true, {
            autoResponseRender: true,
            rejectUnknownResponse: true,
            callbacks: {
                onResponse: () => {

                },
                onResponseError: () => {

                },
                onResponseSuccess: () => {

                },
                onInternalError: () => {

                }
            },
            inputMessageRenderer: defaultInputMessageRenderer,
            formMessageRenderer: defaultFormMessageRenderer,
            toastMessageRenderer: defaultToastMessageRenderer,
            responseHandlersToRegister: []
        } as HttpResponseOptions, this.httpResponseOptionsEntered);
        return this.httpResponse;
    }
}