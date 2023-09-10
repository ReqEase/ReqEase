var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HttpRequestBuilder_instances, _HttpRequestBuilder_getDefaultOptions;
import { HttpRequest } from "./HttpRequest";
import { isUndefinedOrNull, mergeObjects } from "../../root/utils";
import { defaultHttpRequestOptions } from "../../Defaults";
import { isIntendedRedirectKey } from "../RequesterOptions";
import { getOneJqueryElementByName } from "../../root/HtmlGeneralElement";
export class HttpRequestBuilder {
    constructor(requesterOptions, requestOptionsEntered) {
        _HttpRequestBuilder_instances.add(this);
        this.requesterOptions = requesterOptions;
        this.requestOptionsEntered = requestOptionsEntered;
        this.request = new HttpRequest();
    }
    build() {
        var _a, _b, _c;
        this.request.requestOptions = mergeObjects(__classPrivateFieldGet(this, _HttpRequestBuilder_instances, "m", _HttpRequestBuilder_getDefaultOptions).call(this), (_a = this.requestOptionsEntered) !== null && _a !== void 0 ? _a : {}, [
            "ajaxExtraOptions",
            "beforeSend",
            "headers"
        ]);
        if (!isUndefinedOrNull(this.requesterOptions.fields)) {
            if (this.requesterOptions.fields === 'auto') {
                if (isUndefinedOrNull(this.requesterOptions.form) || this.requesterOptions.form.length === 0) {
                    console.error("Form is not defined.");
                }
                else {
                    let formObj = this.requesterOptions.form.serializeArray();
                    console.log(formObj);
                    let data = {};
                    for (let i = 0; i < formObj.length; i++) {
                        data[formObj[i].name] = formObj[i].value;
                    }
                    this.request.requestOptions.data = Object.assign(Object.assign({}, this.request.requestOptions.data), data);
                }
            }
            else {
                for (let i = 0; i < this.requesterOptions.fields.length; i++) {
                    let field = getOneJqueryElementByName(this.requesterOptions.fields[i]);
                    if (field.length === 0)
                        continue;
                    this.request.requestOptions.data[field.attr('name')] = field.val();
                }
            }
        }
        if (!isUndefinedOrNull(this.requesterOptions.requestData)) {
            if (typeof this.requesterOptions.requestData === 'function') {
                this.requesterOptions.requestData((data) => {
                    this.request.requestOptions.data = Object.assign(Object.assign({}, this.request.requestOptions.data), data);
                });
            }
            else {
                this.request.requestOptions.data = Object.assign(Object.assign({}, this.request.requestOptions.data), this.requesterOptions.requestData);
            }
        }
        this.request.requestOptions = mergeObjects(this.request.requestOptions, (_c = (_b = this.requestOptionsEntered) === null || _b === void 0 ? void 0 : _b.ajaxExtraOptions) !== null && _c !== void 0 ? _c : {}, [
            "beforeSend",
        ]);
        this.request.requestOptions.beforeSend = (jqXHR, settings) => {
            var _a;
            for (let header in this.request.requestOptions.headers) {
                jqXHR.setRequestHeader(header, this.request.requestOptions.headers[header]);
            }
            if (isUndefinedOrNull((_a = this.requestOptionsEntered) === null || _a === void 0 ? void 0 : _a.beforeSend))
                return;
            return this.requestOptionsEntered.beforeSend(jqXHR, settings);
        };
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
            else {
                intendedRedirectUrl = this.requesterOptions.intendedRedirect;
            }
            if (!isUndefinedOrNull(intendedRedirectUrl) && intendedRedirectUrl !== '') {
                this.request.requestOptions.data.__intendedRedirect__ = intendedRedirectUrl;
            }
        }
        return this.request;
    }
}
_HttpRequestBuilder_instances = new WeakSet(), _HttpRequestBuilder_getDefaultOptions = function _HttpRequestBuilder_getDefaultOptions() {
    return defaultHttpRequestOptions;
};
