import {RequesterOptions, RequesterOptionsEntered} from "./RequesterOptions";
import {getOkBtnFromForm} from "../root/HtmlGeneralElement";
import {collectModalHandlers} from "../view/modal/modals/HandlerCollector";
import {isUndefinedOrNull} from "../root/utils";
import {ReqEase} from "../ReqEase";
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
        this.requesterOptions.strings = $.extend(true, defaultRequesterStrings, requesterOptionsEntered.strings??{});
        this.reqEase = reqEase;
    }
    build() {
        collectModalHandlers();
        if (Array.isArray(this.requesterOptions.modalHandlersToRegister)) {
            collectModalHandlers(this.requesterOptions.modalHandlersToRegister);
        }
        else{
            collectModalHandlers([this.requesterOptions.modalHandlersToRegister]);
        }
        this.requesterOptions.showConfirmModal = this.requesterOptionsEntered.showConfirmModal??false;
        // add the form,okBtb
        [this.requesterOptions.form, this.requesterOptions.okBtn] = getOkBtnFromForm(this.requesterOptionsEntered.form, this.requesterOptionsEntered.okBtn);
        if (!isUndefinedOrNull(this.requesterOptions.form)) {
            this.requesterOptionsEntered.request = $.extend(true, {
                url: this.requesterOptions.form.attr('action')??null,
                method: this.requesterOptions.form.attr('method')??null,
                dataType: this.requesterOptions.form.attr('enctype ')??null,
            }, this.requesterOptionsEntered.request);
        }
        this.requesterOptions.fields = this.requesterOptionsEntered.fields??(isUndefinedOrNull(this.requesterOptions.form) ? [] : 'auto');
        this.requesterOptions.requestData = this.requesterOptionsEntered.requestData??{};
        this.requesterOptions.intendedRedirect = this.requesterOptionsEntered.intendedRedirect??'key:intendedRedirect';
        this.requesterOptions.intendedRedirectPriority = this.requesterOptionsEntered.intendedRedirectPriority??false;

        this.requesterOptions.request = this.requesterOptionsEntered.request;
        this.requesterOptions.response = this.requesterOptionsEntered.response;


        return this.requesterOptions;
    }
}