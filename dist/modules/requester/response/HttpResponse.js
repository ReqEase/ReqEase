import { HttpResponseBuilder } from "./HttpResponseBuilder";
import { Responses } from "./responses/Responses";
import { ResponseHandlerManager } from "./responses/ResponseHandlerManager";
import { isUndefinedOrNull } from "../../root/utils";
export class HttpResponse {
    static Builder(requesterOptions, httpResponseOptionsEntered) {
        return new HttpResponseBuilder(requesterOptions, httpResponseOptionsEntered);
    }
    handle(response, ajaxParams) {
        this.httpResponseOptions.callbacks.onResponse(response, false, ajaxParams);
        if (!this.httpResponseOptions.autoResponseRender)
            return;
        if (!Responses.isResponse(response) && !Responses.isCustomResponse(response)) {
            if (this.httpResponseOptions.rejectUnknownResponse) {
                ResponseHandlerManager.showUnknownErrorWithRetry(this.requester, () => {
                    this.requester.retry();
                });
            }
            return;
        }
        let label = Responses.getResponseLabel(response);
        console.log("label", label);
        let httpResponseHandler = ResponseHandlerManager.createHandler(label, this.requester, response);
        if (!isUndefinedOrNull(httpResponseHandler)) {
            httpResponseHandler.renderResponse();
        }
    }
}
