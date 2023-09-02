import {HttpRequestOptions, HttpRequestOptionsEntered} from "./HttpRequestOptions";
import {HttpRequest} from "./HttpRequest";
import {isUndefinedOrNull, mergeObjects} from "../../root/utils";
import {defaultHttpRequestOptions} from "../../Defaults";
import {isIntendedRedirectKey, RequesterOptions} from "../RequesterOptions";
import {getOneJqueryElementByName} from "../../root/HtmlGeneralElement";

export class HttpRequestBuilder {
    requesterOptions: RequesterOptions;
    requestOptionsEntered: HttpRequestOptionsEntered
    request: HttpRequest;

    constructor(requesterOptions: RequesterOptions, requestOptionsEntered: HttpRequestOptionsEntered) {
        this.requesterOptions = requesterOptions;
        this.requestOptionsEntered = requestOptionsEntered;
        this.request = new HttpRequest();
    }

    build(): HttpRequest
    {
        this.request.requestOptions = mergeObjects<HttpRequestOptions>(
            this.#getDefaultOptions(),
            this.requestOptionsEntered??{},
            [
                "ajaxExtraOptions",
                "beforeSend",
                "headers"
            ]
        );
        if (!isUndefinedOrNull(this.requesterOptions.fields)) {
            if (this.requesterOptions.fields === 'auto') {
                if (isUndefinedOrNull(this.requesterOptions.form) || this.requesterOptions.form.length === 0) {
                    console.error("Form is not defined.");
                }
                else {
                    let formObj = this.requesterOptions.form.serializeArray();
                    console.log(formObj);
                    let data: Record<string, any> = {};
                    for (let i = 0; i < formObj.length; i++) {
                        data[formObj[i].name] = formObj[i].value;
                    }

                    this.request.requestOptions.data = {
                        ...this.request.requestOptions.data,
                        ...data
                    }
                }
            }
            else{
                for (let i = 0; i < this.requesterOptions.fields.length; i++) {
                    let field = getOneJqueryElementByName(this.requesterOptions.fields[i]);
                    if (field.length === 0) continue;
                    this.request.requestOptions.data[field.attr('name')] = field.val();
                }
            }
        }
        if (!isUndefinedOrNull(this.requesterOptions.requestData)) {
            if (typeof this.requesterOptions.requestData === 'function') {
                this.requesterOptions.requestData((data: Record<string, any>) => {
                    this.request.requestOptions.data = {
                        ...this.request.requestOptions.data,
                        ...data
                    }
                });
            }
            else{
                this.request.requestOptions.data = {
                    ...this.request.requestOptions.data,
                    ...this.requesterOptions.requestData
                }
            }
        }
        this.request.requestOptions = mergeObjects<HttpRequestOptions>(
            this.request.requestOptions,
            this.requestOptionsEntered?.ajaxExtraOptions??{},
            [
                "beforeSend",
            ]
        );
        this.request.requestOptions.beforeSend = (jqXHR: JQuery.jqXHR, settings: any) => {
            for (let header in this.request.requestOptions.headers) {
                jqXHR.setRequestHeader(header, this.request.requestOptions.headers[header]);
            }
            if (isUndefinedOrNull(this.requestOptionsEntered?.beforeSend)) return;
            return this.requestOptionsEntered.beforeSend(jqXHR, settings);
        }
        if (this.requesterOptions.intendedRedirect !== false) {
            let intendedRedirectUrl;
            if (typeof this.requesterOptions.intendedRedirect === 'string' && isIntendedRedirectKey(this.requesterOptions.intendedRedirect)) {
                let key = this.requesterOptions.intendedRedirect.substring(4);
                //get from the current url from get param key
                let url = new URL(window.location.href);
                intendedRedirectUrl = url.searchParams.get(key);
            }
            else if (typeof this.requesterOptions.intendedRedirect === 'function') {
                intendedRedirectUrl = this.requesterOptions.intendedRedirect();
            }
            else{
                intendedRedirectUrl = this.requesterOptions.intendedRedirect;
            }
            if (!isUndefinedOrNull(intendedRedirectUrl) && intendedRedirectUrl !== '') {
                this.request.requestOptions.data.__intendedRedirect__ = intendedRedirectUrl;
            }
        }
        return this.request;
    }

    #getDefaultOptions(): HttpRequestOptions {
        return defaultHttpRequestOptions;
    }
}