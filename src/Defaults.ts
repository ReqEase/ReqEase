import {HttpRequestOptions} from "./requester/request/HttpRequestOptions";
import {DataType} from "./requester/request/DataType";
import {HttpMethod} from "./requester/request/HttpMethod";

export let defaultHttpRequestOptions: HttpRequestOptions = {
    url: null,
    data: {},
    dataType: DataType.JSON,
    headers: {},
    method: HttpMethod.POST,
    beforeSend: () => {},
    ajaxExtraOptions: {}
};