import {HttpRequestBuilder} from "./HttpRequestBuilder";
import {HttpRequestOptions, HttpRequestOptionsEntered} from "./HttpRequestOptions";
import {Responses} from "../response/responses/Responses";
import {RequesterOptions} from "../RequesterOptions";
import {isUndefinedOrNull} from "../../root/utils";
import {Requester} from "../Requester";

export class HttpRequest {
    requesterOptions: RequesterOptions;
    requestOptions: HttpRequestOptions
    requester: Requester;
    private _callbacks_: Responses.Callbacks;

    constructor() {
        this.callbacks_ = {
            onResponseSuccess: (_response: any, _autoHandled: boolean, _ajaxDoneParams: Responses.AjaxDoneParams) => {

            },
            onResponseError: (_response: any, _autoHandled: boolean, _ajaxFailParams: Responses.AjaxFailParams) => {

            },
            onResponse: (_response: any, _autoHandled: boolean, _ajaxParams: Responses.AjaxDoneParams | Responses.AjaxFailParams) => {

            },
            onInternalError: (_error: any) => {

            }
        }
    }

    get callbacks_(): Responses.Callbacks {
        return this._callbacks_;
    }

    set callbacks_(value: Responses.Callbacks) {
        this._callbacks_ = value;
    }

    static Builder(requesterOptions: RequesterOptions, requestOptionsEntered: HttpRequestOptionsEntered): HttpRequestBuilder
    {
        return new HttpRequestBuilder(requesterOptions, requestOptionsEntered);
    }

    startRequest(): void
    {
        if (isUndefinedOrNull(this.requestOptions.url)) {
            this.callbacks_.onInternalError('url is not defined');
            return;
        }
        $.ajax(this.requestOptions).done((data: any, textStatus: string, jqXHR: JQueryXHR) => {
            this.callbacks_.onResponse(data, false, {data, textStatus, jqXHR});
            this.callbacks_.onResponseSuccess(data, false, {data, textStatus, jqXHR});

        }).fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
            this.callbacks_.onResponse(jqXHR.responseJSON, false, {jqXHR, textStatus, errorThrown});
            this.callbacks_.onResponseError(jqXHR.responseJSON, false, {jqXHR, textStatus, errorThrown});
        });
    }
}