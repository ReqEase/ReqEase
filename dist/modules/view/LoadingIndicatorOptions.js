import { isUndefinedOrNull } from "../root/utils";
export var LoadingState;
(function (LoadingState) {
    LoadingState["LOADING"] = "loading";
    LoadingState["NOT_LOADING"] = "not-loading";
})(LoadingState || (LoadingState = {}));
const defaultButtonAffect = (loadingIndicator, _loadingIndicatorActions, toState) => {
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
export const defaultLoadingIndicatorOptions = {
    loadingInModal: true,
    modalOptions: {
        loadingMessage: "Verifying in progress...",
    },
    loadingIndicatorActions: {
        affectButton: defaultButtonAffect
    }
};
