import {HttpResponseOptions, HttpResponseOptionsEntered} from "./HttpResponseOptions";
import {HttpResponse} from "./HttpResponse";
import {RequesterOptions} from "../RequesterOptions";

export class HttpResponseBuilder {
    requesterOptions: RequesterOptions
    httpResponseOptionsEntered: HttpResponseOptionsEntered;
    httpResponse: HttpResponse;
    constructor(requesterOptions: RequesterOptions, httpResponseOptionsEntered: HttpResponseOptionsEntered) {
        this.requesterOptions = requesterOptions;
        this.httpResponseOptionsEntered = httpResponseOptionsEntered;
        this.httpResponse = new HttpResponse();
    }
    build() {
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
            }
        } as HttpResponseOptions, this.httpResponseOptionsEntered);
        return this.httpResponse;
    }
}