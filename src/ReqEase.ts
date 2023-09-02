// ReqEase.ts

import {ReqEaseOptions, ReqEaseOptionsEntered} from "./ReqEaseOptions";
import {FormValidator} from "./forms/FormValidator";
import {BuildMode} from "./root/BuildMode";
import {ReqEaseBuilder} from "./ReqEaseBuilder";
import {isUndefinedOrNull} from "./root/utils";
import {Requester} from "./requester/Requester";

export class ReqEase {
    reqEaseOptions: ReqEaseOptions;
    formValidator: FormValidator;
    requester: Requester;
    constructor(reqEaseOptions: ReqEaseOptionsEntered = {}) {
        this.reqEaseOptions = ReqEaseOptions.Builder(reqEaseOptions).build();
        ReqEase.Builder(reqEaseOptions, this).build();
        this.#prepare();
        this.start();
    }

    private static Builder(reqEaseOptions: ReqEaseOptionsEntered, instance: ReqEase): ReqEaseBuilder {
        return new ReqEaseBuilder(reqEaseOptions, instance);
    }

    #prepare() {
        this.formValidator = FormValidator.Builder(this.reqEaseOptions.validation??{}, this.reqEaseOptions).build();
        this.requester = Requester.Builder(this.reqEaseOptions.requester??{}, this).build();
    }

    start() {
        console.log(this.requester);
        if (this.reqEaseOptions.buildMode === BuildMode.EVERYTIME) {
            this.#prepare();
        }
        if (isUndefinedOrNull(this.reqEaseOptions.okBtn)) {
            console.error('okBtn is required');
            return;
        }
        this.formValidator.initiate();

        this.reqEaseOptions.okBtn.on('click', () => {
            new Promise<boolean>((resolve) => {
                if (this.formValidator.options.verificationDuringLoading) {
                    this.requester.loadingIndicator.startLoading().then(() => resolve(true));
                }
                else{
                    resolve(true);
                }
            }).then(() => {
                this.formValidator.validate({
                    onSuccess: () => {
                        this.requester.init();
                    },
                    onFailure: () => {
                        console.log("validation failed -_-", this.requester.loadingIndicator.isLoading());
                        this.requester.loadingIndicator.stopLoading();
                    }
                });
            });
        });
    }

    // Other methods for different features will be added in subsequent steps
}