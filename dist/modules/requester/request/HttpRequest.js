import { HttpRequestBuilder } from "./HttpRequestBuilder";
import { isUndefinedOrNull } from "../../root/utils";
export class HttpRequest {
    constructor() {
        this.callbacks_ = {
            onResponseSuccess: (_response, _autoHandled, _ajaxDoneParams) => {
            },
            onResponseError: (_response, _autoHandled, _ajaxFailParams) => {
            },
            onResponse: (_response, _autoHandled, _ajaxParams) => {
            },
            onInternalError: (_error) => {
            }
        };
    }
    get callbacks_() {
        return this._callbacks_;
    }
    set callbacks_(value) {
        this._callbacks_ = value;
    }
    static Builder(requesterOptions, requestOptionsEntered) {
        return new HttpRequestBuilder(requesterOptions, requestOptionsEntered);
    }
    startRequest() {
        if (isUndefinedOrNull(this.requestOptions.url)) {
            this.callbacks_.onInternalError('url is not defined');
            return;
        }
        $.ajax(this.requestOptions).done((data, textStatus, jqXHR) => {
            this.callbacks_.onResponse(data, false, { data, textStatus, jqXHR });
            this.callbacks_.onResponseSuccess(data, false, { data, textStatus, jqXHR });
        }).fail((jqXHR, textStatus, errorThrown) => {
            this.callbacks_.onResponse(jqXHR.responseJSON, false, { jqXHR, textStatus, errorThrown });
            this.callbacks_.onResponseError(jqXHR.responseJSON, false, { jqXHR, textStatus, errorThrown });
        });
    }
}
