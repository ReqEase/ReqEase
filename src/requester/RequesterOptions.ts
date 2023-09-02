import {HttpRequestOptionsEntered} from "./request/HttpRequestOptions";
import {RequesterOptionsBuilder} from "./RequesterOptionsBuilder";
import {HtmlButtonGeneralElement, HtmlFormGeneralElement, HtmlGeneralElement} from "../root/HtmlGeneralElement";
import {LoadingIndicatorOptionsEntered} from "../view/LoadingIndicatorOptions";
import {ModalHandlerType} from "../view/modal/ReadyModalHandler";
import {ModalHandler} from "../view/modal/ModalHandler";
import {ResponseHandler} from "./response/ResponseHandler";
import {HttpResponseOptionsEntered} from "./response/HttpResponseOptions";
import {InputMessageRenderer} from "../view/messages/InputMessage";
import {ReqEase} from "../ReqEase";
import {FormMessageRenderer} from "../view/messages/FormMessage";
import {ToastMessageRenderer} from "../view/messages/ToastMessage";
import {RequesterStrings} from "./RequesterStrings";

export type RequesterOptionsEntered = Partial<RequesterOptionsInterface>;

interface RequesterOptionsInterface {
    modalHandlersToRegister: (typeof ModalHandler)[] | typeof ModalHandler;
    responseHandlersToRegister: (typeof ResponseHandler)[] | typeof ResponseHandler;
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
    inputMessageRenderer?: Partial<InputMessageRenderer> | undefined;
    formMessageRenderer?: Partial<FormMessageRenderer> | undefined;
    toastMessageRenderer?: Partial<ToastMessageRenderer> | undefined;
    strings: Partial<RequesterStrings> | undefined;
    showConfirmModal: boolean;

}
interface RequesterOptionsFull extends Omit<RequesterOptionsInterface, "inputMessageRenderer" | "formMessageRenderer" | "toastMessageRenderer">{
    form: JQuery<HTMLElement> | undefined;
    okBtn: JQuery<HTMLElement> | undefined;
    inputMessageRenderer?: InputMessageRenderer | undefined;
    formMessageRenderer?: FormMessageRenderer | undefined;
    toastMessageRenderer?: ToastMessageRenderer | undefined;
}

export class RequesterOptions implements RequesterOptionsFull{
    form: JQuery<HTMLElement> | undefined;
    okBtn: JQuery<HTMLElement> | undefined;
    useReadyModal: ModalHandlerType | string | false;
    fields: HtmlGeneralElement[] | 'auto';
    requestData: Record<string, any> | ((callback: (data: Record<string, any>) => void) => void);
    loading: LoadingIndicatorOptionsEntered;
    modalHandlersToRegister: (typeof ModalHandler)[] | typeof ModalHandler;
    responseHandlersToRegister: (typeof ResponseHandler)[] | typeof ResponseHandler;
    intendedRedirect: (string & { startsWith: (prefix: "key:") => boolean }) | string | (() => string) | false;
    intendedRedirectPriority: boolean;
    inputMessageRenderer?: InputMessageRenderer | undefined;
    formMessageRenderer?: FormMessageRenderer | undefined;
    toastMessageRenderer?: ToastMessageRenderer | undefined;
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