import {HttpResponseBuilder} from "./HttpResponseBuilder";
import {HttpResponseOptions, HttpResponseOptionsEntered} from "./HttpResponseOptions";
import {Responses} from "./responses/Responses";

import {ResponseHandlerManager} from "./responses/ResponseHandlerManager";
import {RequesterOptions} from "../RequesterOptions";
import {Requester} from "../Requester";
import {isUndefinedOrNull} from "../../root/utils";

export class HttpResponse {
    requesterOptions: RequesterOptions;
    httpResponseOptions: HttpResponseOptions;
    requester: Requester;
    static Builder(requesterOptions: RequesterOptions, httpResponseOptionsEntered: HttpResponseOptionsEntered) {
        return new HttpResponseBuilder(requesterOptions, httpResponseOptionsEntered);
    }

    handle(response: unknown, ajaxParams: Responses.AjaxDoneParams | Responses.AjaxFailParams) {
        this.httpResponseOptions.callbacks.onResponse(response, false, ajaxParams);
        if (!Responses.isResponse(response) && !Responses.isCustomResponse(response)) {
            if (this.httpResponseOptions.rejectUnknownResponse) {
                ResponseHandlerManager.showUnknownErrorWithRetry(this.requester, () => {
                    this.requester.retry();
                });
            }
            return;
        }
        let label: string = Responses.getResponseLabel(response);
        console.log("label", label);
        let httpResponseHandler = ResponseHandlerManager.createHandler(label, this.requester, response);
        if (!isUndefinedOrNull(httpResponseHandler)) {
            httpResponseHandler.renderResponse();
        }
    }
}