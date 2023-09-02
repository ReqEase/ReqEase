import {
    defaultLoadingIndicatorOptions,
    LoadingIndicatorOptions,
    LoadingIndicatorOptionsEntered
} from "./LoadingIndicatorOptions";
import {isUndefinedOrNull} from "../root/utils";
import {ModalHandlerManager} from "./modal/ModalHandlerManager";
import {Requester} from "../requester/Requester";
import {ModalLoadingOptions} from "./modal/ModalHandler";

export class LoadingIndicatorOptionsBuilder {
    loadingIndicatorOptionsEntered: LoadingIndicatorOptionsEntered;
    requester: Requester
    constructor(requester: Requester, loadingIndicatorOptionsEntered: LoadingIndicatorOptionsEntered) {
        this.loadingIndicatorOptionsEntered = loadingIndicatorOptionsEntered;
        this.requester = requester;
    }
    build(): LoadingIndicatorOptions {
        let loadingOptions: LoadingIndicatorOptionsEntered;
        loadingOptions = $.extend(true, defaultLoadingIndicatorOptions, {
            modalOptions: {
                loadingMessage: this.requester?.requesterOptions?.strings?.loading?.loadingMessage??(defaultLoadingIndicatorOptions.modalOptions as ModalLoadingOptions).loadingMessage,
            }
        });
        let label;
        if (this.requester.requesterOptions.useReadyModal !== false) {
            label = this.requester.requesterOptions.useReadyModal;
        }
        else{
            label = "bootstrap";
        }
        if (!isUndefinedOrNull(this.loadingIndicatorOptionsEntered)) {
            loadingOptions = $.extend(true, loadingOptions, this.loadingIndicatorOptionsEntered);
        }
        let loadingIndicatorOptions: LoadingIndicatorOptions;
        loadingIndicatorOptions = {
            loadingInModal: loadingOptions.loadingInModal??false,
            loadingIndicatorActions: $.extend(true,loadingOptions.loadingIndicatorActions,
                {
                    modalHandler: ModalHandlerManager.createHandler(label, this.requester, loadingOptions.modalOptions)
                }
            ),
            spinnerIcon: loadingOptions.spinnerIcon??'<div class="spinner-border" role="status"></div>'
        }
        return loadingIndicatorOptions;
    }
}