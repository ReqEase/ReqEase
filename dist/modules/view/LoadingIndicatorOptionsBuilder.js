import { defaultLoadingIndicatorOptions } from "./LoadingIndicatorOptions";
import { isUndefinedOrNull } from "../root/utils";
import { ModalHandlerManager } from "./modal/ModalHandlerManager";
export class LoadingIndicatorOptionsBuilder {
    constructor(requester, loadingIndicatorOptionsEntered) {
        this.loadingIndicatorOptionsEntered = loadingIndicatorOptionsEntered;
        this.requester = requester;
    }
    build() {
        var _a, _b, _c, _d, _e, _f, _g;
        let loadingOptions;
        loadingOptions = $.extend(true, defaultLoadingIndicatorOptions, {
            modalOptions: {
                loadingMessage: (_e = (_d = (_c = (_b = (_a = this.requester) === null || _a === void 0 ? void 0 : _a.requesterOptions) === null || _b === void 0 ? void 0 : _b.strings) === null || _c === void 0 ? void 0 : _c.loading) === null || _d === void 0 ? void 0 : _d.loadingMessage) !== null && _e !== void 0 ? _e : defaultLoadingIndicatorOptions.modalOptions.loadingMessage,
            }
        });
        let label;
        if (this.requester.requesterOptions.useReadyModal !== false) {
            label = this.requester.requesterOptions.useReadyModal;
        }
        else {
            label = "bootstrap";
        }
        if (!isUndefinedOrNull(this.loadingIndicatorOptionsEntered)) {
            loadingOptions = $.extend(true, loadingOptions, this.loadingIndicatorOptionsEntered);
        }
        let loadingIndicatorOptions;
        loadingIndicatorOptions = {
            loadingInModal: (_f = loadingOptions.loadingInModal) !== null && _f !== void 0 ? _f : false,
            loadingIndicatorActions: $.extend(true, loadingOptions.loadingIndicatorActions, {
                modalHandler: ModalHandlerManager.createHandler(label, this.requester, loadingOptions.modalOptions)
            }),
            spinnerIcon: (_g = loadingOptions.spinnerIcon) !== null && _g !== void 0 ? _g : '<div class="spinner-border" role="status"></div>'
        };
        return loadingIndicatorOptions;
    }
}
