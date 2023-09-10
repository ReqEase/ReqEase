import { RequesterOptions } from "./RequesterOptions";
import { getOkBtnFromForm } from "../root/HtmlGeneralElement";
import { collectModalHandlers } from "../view/modal/modals/HandlerCollector";
import { isUndefinedOrNull } from "../root/utils";
import { defaultRequesterStrings } from "./RequesterStrings";
export class RequesterOptionsBuilder {
    constructor(requesterOptionsEntered, reqEase = null) {
        var _a, _b, _c;
        this.requesterOptions = new RequesterOptions();
        this.requesterOptionsEntered = requesterOptionsEntered;
        this.requesterOptions.useReadyModal = (_a = requesterOptionsEntered.useReadyModal) !== null && _a !== void 0 ? _a : false;
        this.requesterOptions.loading = requesterOptionsEntered.loading;
        this.requesterOptions.modalHandlersToRegister = (_b = requesterOptionsEntered.modalHandlersToRegister) !== null && _b !== void 0 ? _b : [];
        this.requesterOptions.strings = $.extend(true, defaultRequesterStrings, (_c = requesterOptionsEntered.strings) !== null && _c !== void 0 ? _c : {});
        this.reqEase = reqEase;
    }
    build() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        collectModalHandlers();
        if (Array.isArray(this.requesterOptions.modalHandlersToRegister)) {
            collectModalHandlers(this.requesterOptions.modalHandlersToRegister);
        }
        else {
            collectModalHandlers([this.requesterOptions.modalHandlersToRegister]);
        }
        this.requesterOptions.showConfirmModal = (_a = this.requesterOptionsEntered.showConfirmModal) !== null && _a !== void 0 ? _a : false;
        // add the form,okBtb
        [this.requesterOptions.form, this.requesterOptions.okBtn] = getOkBtnFromForm(this.requesterOptionsEntered.form, this.requesterOptionsEntered.okBtn);
        if (!isUndefinedOrNull(this.requesterOptions.form)) {
            this.requesterOptionsEntered.request = $.extend(true, {
                url: (_b = this.requesterOptions.form.attr('action')) !== null && _b !== void 0 ? _b : null,
                method: (_c = this.requesterOptions.form.attr('method')) !== null && _c !== void 0 ? _c : null,
                dataType: (_d = this.requesterOptions.form.attr('enctype ')) !== null && _d !== void 0 ? _d : null,
            }, this.requesterOptionsEntered.request);
        }
        this.requesterOptions.fields = (_e = this.requesterOptionsEntered.fields) !== null && _e !== void 0 ? _e : (isUndefinedOrNull(this.requesterOptions.form) ? [] : 'auto');
        this.requesterOptions.requestData = (_f = this.requesterOptionsEntered.requestData) !== null && _f !== void 0 ? _f : {};
        this.requesterOptions.intendedRedirect = (_g = this.requesterOptionsEntered.intendedRedirect) !== null && _g !== void 0 ? _g : 'key:intendedRedirect';
        this.requesterOptions.intendedRedirectPriority = (_h = this.requesterOptionsEntered.intendedRedirectPriority) !== null && _h !== void 0 ? _h : false;
        this.requesterOptions.request = this.requesterOptionsEntered.request;
        this.requesterOptions.response = this.requesterOptionsEntered.response;
        return this.requesterOptions;
    }
}
