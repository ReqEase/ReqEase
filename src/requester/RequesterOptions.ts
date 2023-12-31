import {HttpRequestOptionsEntered} from "./request/HttpRequestOptions";
import {RequesterOptionsBuilder} from "./RequesterOptionsBuilder";
import {HtmlButtonGeneralElement, HtmlFormGeneralElement, HtmlGeneralElement} from "../root/HtmlGeneralElement";
import {LoadingIndicatorOptionsEntered} from "../view/LoadingIndicatorOptions";
import {ModalHandlerType} from "../view/modal/ReadyModalHandler";
import {ModalHandler} from "../view/modal/ModalHandler";
import {HttpResponseOptionsEntered} from "./response/HttpResponseOptions";
import {ReqEase} from "../ReqEase";
import {RequesterStrings} from "./RequesterStrings";

export type RequesterOptionsEntered = Partial<RequesterOptionsInterface>;

interface RequesterOptionsInterface {
    modalHandlersToRegister: (typeof ModalHandler)[] | typeof ModalHandler;
    useReadyModal: ModalHandlerType | string | false;
    fields: HtmlGeneralElement[] | 'auto';
    requestData: Record<string, any> | ((callback: (data: Record<string, any>) => void) => void);
    form: HtmlFormGeneralElement;
    okBtn: HtmlButtonGeneralElement;
    request: HttpRequestOptionsEntered;
    response: HttpResponseOptionsEntered;
    loading: LoadingIndicatorOptionsEntered;
    intendedRedirect: (string & { startsWith: (prefix: "key:") => boolean }) | string | (() => string) | false;
    intendedRedirectPriority: boolean;
    strings: Partial<RequesterStrings> | undefined;
    showConfirmModal: boolean;

}
interface RequesterOptionsFull extends RequesterOptionsInterface{
    form: JQuery<HTMLElement> | undefined;
    okBtn: JQuery<HTMLElement> | undefined;
}

export class RequesterOptions implements RequesterOptionsFull{
    form: JQuery<HTMLElement> | undefined;
    okBtn: JQuery<HTMLElement> | undefined;
    useReadyModal: ModalHandlerType | string | false;
    fields: HtmlGeneralElement[] | 'auto';
    requestData: Record<string, any> | ((callback: (data: Record<string, any>) => void) => void);
    loading: LoadingIndicatorOptionsEntered;
    modalHandlersToRegister: (typeof ModalHandler)[] | typeof ModalHandler;
    intendedRedirect: (string & { startsWith: (prefix: "key:") => boolean }) | string | (() => string) | false;
    intendedRedirectPriority: boolean;
    request: HttpRequestOptionsEntered;
    response: HttpResponseOptionsEntered;
    strings: Partial<RequesterStrings>;
    showConfirmModal: boolean;
    static Builder(requesterOptionsEntered: RequesterOptionsEntered, reqEase: ReqEase = null): RequesterOptionsBuilder
    {
        return new RequesterOptionsBuilder(requesterOptionsEntered, reqEase);
    }
}

export function isIntendedRedirectKey(key: string): key is (string & { startsWith: (prefix: "key:") => boolean }) {
    return key.startsWith("key:");
}