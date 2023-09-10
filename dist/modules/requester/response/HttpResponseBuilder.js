import { HttpResponse } from "./HttpResponse";
import { defaultInputMessageRenderer } from "../../forms/FormValidatorBuilder";
import { defaultFormMessageRenderer } from "../../view/messages/FormMessage";
import { defaultToastMessageRenderer } from "../../view/messages/ToastMessage";
import { collectResponseHandlers } from "./responses/handlers/HandlerCollector";
export class HttpResponseBuilder {
    constructor(requesterOptions, httpResponseOptionsEntered) {
        var _a;
        this.requesterOptions = requesterOptions;
        this.httpResponseOptionsEntered = httpResponseOptionsEntered !== null && httpResponseOptionsEntered !== void 0 ? httpResponseOptionsEntered : {};
        this.httpResponse = new HttpResponse();
        this.httpResponseOptionsEntered.responseHandlersToRegister = (_a = httpResponseOptionsEntered === null || httpResponseOptionsEntered === void 0 ? void 0 : httpResponseOptionsEntered.responseHandlersToRegister) !== null && _a !== void 0 ? _a : [];
    }
    build() {
        collectResponseHandlers();
        if (Array.isArray(this.httpResponseOptionsEntered.responseHandlersToRegister)) {
            collectResponseHandlers(this.httpResponseOptionsEntered.responseHandlersToRegister);
        }
        else {
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
        }, this.httpResponseOptionsEntered);
        return this.httpResponse;
    }
}
