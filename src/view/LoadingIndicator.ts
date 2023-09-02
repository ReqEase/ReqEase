import {Requester} from "../requester/Requester";
import {LoadingIndicatorOptions, LoadingIndicatorOptionsEntered, LoadingState} from "./LoadingIndicatorOptions";
import {LoadingIndicatorOptionsBuilder} from "./LoadingIndicatorOptionsBuilder";

export class LoadingIndicator {
    requester: Requester;
    loadingIndicatorOptions: LoadingIndicatorOptions;

    constructor(requester: Requester, loadingIndicatorOptionsEntered: LoadingIndicatorOptionsEntered)
    {
        this.requester = requester;
        this.loadingIndicatorOptions = (new LoadingIndicatorOptionsBuilder(requester, loadingIndicatorOptionsEntered)).build();
    }

    startLoading() {
        return new Promise<boolean>((resolve) => {
            this.loadingIndicatorOptions.loadingIndicatorActions.affectButton(this, this.loadingIndicatorOptions.loadingIndicatorActions, LoadingState.LOADING);
            if (this.loadingIndicatorOptions.loadingInModal) {
                this.loadingIndicatorOptions.loadingIndicatorActions.modalHandler.show();
                this.loadingIndicatorOptions.loadingIndicatorActions.modalHandler.modalCallbacks.onOpen = () => {
                    resolve(true);
                };
            }
            else{
                resolve(true);
            }
        });
    }

    stopLoading() {
        if (this.isLoading()) {
            if (this.loadingIndicatorOptions.loadingInModal) {
                this.loadingIndicatorOptions.loadingIndicatorActions.modalHandler.close();
            }
            this.loadingIndicatorOptions.loadingIndicatorActions.affectButton(this, this.loadingIndicatorOptions.loadingIndicatorActions, LoadingState.NOT_LOADING);
        }
    }

    isLoading(): boolean {
        return this.loadingIndicatorOptions.loadingInModal ? this.loadingIndicatorOptions.loadingIndicatorActions.modalHandler.modalIsShowed() : (
            this.requester.requesterOptions.okBtn ? this.requester.requesterOptions.okBtn.prop("disabled") : false
        );
    }
}