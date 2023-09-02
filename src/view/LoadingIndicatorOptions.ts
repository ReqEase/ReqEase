import {LoadingIndicator} from "./LoadingIndicator";
import {ModalHandler, ModalOptions} from "./modal/ModalHandler";
import {isUndefinedOrNull} from "../root/utils";

export interface LoadingIndicatorOptions {
    loadingInModal: boolean;
    loadingIndicatorActions: LoadingIndicatorActions;
    spinnerIcon?: string;
}

export interface LoadingIndicatorOptionsEntered extends Partial<Omit<LoadingIndicatorOptions, "loadingIndicatorActions">> {
    modalOptions?: ModalOptions
    loadingIndicatorActions: Omit<LoadingIndicatorActions, "modalHandler">;
}

export enum LoadingState {
    LOADING = "loading",
    NOT_LOADING = "not-loading"
}

interface LoadingIndicatorActions {
    modalHandler?: ReturnType<<T extends ModalHandler>() => T> | undefined;
    affectButton(loadingIndicator: LoadingIndicator, loadingIndicatorActions: this, toState: LoadingState): void;
}

const defaultButtonAffect = (loadingIndicator: LoadingIndicator, _loadingIndicatorActions: LoadingIndicatorActions, toState: LoadingState): void => {
    if (isUndefinedOrNull(loadingIndicator.requester.requesterOptions.okBtn)) {
        return;
    }
    loadingIndicator.requester.requesterOptions.okBtn.prop("disabled", toState !== LoadingState.NOT_LOADING);
    if (toState === LoadingState.LOADING) {
        loadingIndicator.requester.requesterOptions.okBtn.data('original-content', loadingIndicator.requester.requesterOptions.okBtn.html());
        loadingIndicator.requester.requesterOptions.okBtn.html(loadingIndicator.loadingIndicatorOptions.spinnerIcon);
    }
    else {
        loadingIndicator.requester.requesterOptions.okBtn.html(loadingIndicator.requester.requesterOptions.okBtn.data('original-content'));
    }
    loadingIndicator.requester.requesterOptions.okBtn.data('data-loading-state', toState);
};

export const defaultLoadingIndicatorOptions: LoadingIndicatorOptionsEntered = {
    loadingInModal: true,
    modalOptions: {
        loadingMessage: "Verifying in progress...",
    },
    loadingIndicatorActions: {
        affectButton: defaultButtonAffect
    }
}