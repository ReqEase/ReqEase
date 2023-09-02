import {RequesterOptions, RequesterOptionsEntered} from "./RequesterOptions";
import {getOneJqueryElement} from "../root/HtmlGeneralElement";
import {collectModalHandlers} from "../view/modal/modals/HandlerCollector";
import {collectResponseHandlers} from "./response/responses/handlers/HandlerCollector";
import {isUndefinedOrNull} from "../root/utils";
import {ReqEase} from "../ReqEase";
import {defaultInputMessageRenderer} from "../forms/FormValidatorBuilder";
import {defaultToastMessageRenderer} from "../view/messages/ToastMessage";
import {defaultFormMessageRenderer} from "../view/messages/FormMessage";
import {defaultRequesterStrings} from "./RequesterStrings";

export class RequesterOptionsBuilder {
    requesterOptions: RequesterOptions;
    requesterOptionsEntered: RequesterOptionsEntered;
    reqEase: ReqEase;

    constructor(requesterOptionsEntered: RequesterOptionsEntered, reqEase: ReqEase = null) {
        this.requesterOptions = new RequesterOptions();
        this.requesterOptionsEntered = requesterOptionsEntered;
        this.requesterOptions.useReadyModal = requesterOptionsEntered.useReadyModal??false;
        this.requesterOptions.loading = requesterOptionsEntered.loading;
        this.requesterOptions.modalHandlersToRegister = requesterOptionsEntered.modalHandlersToRegister??[];
        this.requesterOptions.responseHandlersToRegister = requesterOptionsEntered.responseHandlersToRegister??[];
        this.requesterOptions.strings = $.extend(true, defaultRequesterStrings, requesterOptionsEntered.strings??{});
        this.reqEase = reqEase;
    }
    build() {
        collectModalHandlers();
        collectResponseHandlers();
        if (Array.isArray(this.requesterOptions.modalHandlersToRegister)) {
            collectModalHandlers(this.requesterOptions.modalHandlersToRegister);
        }
        else{
            collectModalHandlers([this.requesterOptions.modalHandlersToRegister]);
        }
        if (Array.isArray(this.requesterOptions.responseHandlersToRegister)) {
            collectResponseHandlers(this.requesterOptions.responseHandlersToRegister);
        }
        else{
            collectResponseHandlers([this.requesterOptions.responseHandlersToRegister]);
        }
        this.requesterOptions.showConfirmModal = this.requesterOptionsEntered.showConfirmModal??true;
        // add the form,okBtb
        this.requesterOptions.form = getOneJqueryElement(this.requesterOptionsEntered.form);
        this.requesterOptions.okBtn = getOneJqueryElement(this.requesterOptionsEntered.okBtn);
        if (!isUndefinedOrNull(this.requesterOptions.form)) {
            this.requesterOptionsEntered.request = $.extend(true, {
                url: this.requesterOptions.form.attr('action')??null,
                method: this.requesterOptions.form.attr('method')??null,
                dataType: this.requesterOptions.form.attr('data-type')??null,
                contentType: this.requesterOptions.form.attr('content-type')??null,
            }, this.requesterOptionsEntered.request);
        }
        this.requesterOptions.fields = this.requesterOptionsEntered.fields??(isUndefinedOrNull(this.requesterOptions.form) ? [] : 'auto');
        this.requesterOptions.requestData = this.requesterOptionsEntered.requestData??{};
        this.requesterOptions.intendedRedirect = this.requesterOptionsEntered.intendedRedirect??'key:intendedRedirect';
        this.requesterOptions.intendedRedirectPriority = this.requesterOptionsEntered.intendedRedirectPriority??false;
        if (isUndefinedOrNull(this.requesterOptionsEntered.inputMessageRenderer)) {
            this.requesterOptions.inputMessageRenderer = this.reqEase?.formValidator?.inputMessageRenderer;
        }
        else{
            this.requesterOptions.inputMessageRenderer = {...defaultInputMessageRenderer, ...this.requesterOptions.inputMessageRenderer};
        }
        this.requesterOptions.formMessageRenderer = {...defaultFormMessageRenderer, ...this.requesterOptions.formMessageRenderer??{}};
        this.requesterOptions.toastMessageRenderer = {...defaultToastMessageRenderer, ...this.requesterOptions.toastMessageRenderer??{}};

        this.requesterOptions.request = this.requesterOptionsEntered.request;
        this.requesterOptions.response = this.requesterOptionsEntered.response;


        return this.requesterOptions;
    }
}