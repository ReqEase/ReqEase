import {HttpMethod} from "./HttpMethod";
import {DataType} from "./DataType";
import jqXHR = JQuery.jqXHR;

export type HttpRequestOptionsEntered = Partial<HttpRequestOptions>;

export interface HttpRequestOptions {
    url: string;
    method: HttpMethod;
    data: any;
    dataType: DataType;
    headers: { [key: string]: string };
    beforeSend: (jqXHR: jqXHR, settings: any) => false | void;
    ajaxExtraOptions: { [key: string]: any }
}