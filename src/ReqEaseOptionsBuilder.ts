import {ReqEaseOptions, ReqEaseOptionsEntered} from "./ReqEaseOptions";
import {BuildMode} from "./root/BuildMode";
import {getOkBtnFromForm, getOneJqueryElement} from "./root/HtmlGeneralElement";
import {isUndefinedOrNull} from "./root/utils";

export class ReqEaseOptionsBuilder {
    options: ReqEaseOptionsEntered;
    reqEaseOptions: ReqEaseOptions;

    constructor(options: ReqEaseOptionsEntered) {
        this.options = options;
    }

    build(): ReqEaseOptions {
        let [form, okBtn] = getOkBtnFromForm(this.options.form, this.options.okBtn);
        let buildMode: BuildMode = BuildMode.onInit;
        if (!isUndefinedOrNull(this.options.buildMode)) {
            if (typeof this.options.buildMode === "string") {
                if (Object.keys(BuildMode).includes(this.options.buildMode)) {
                    buildMode = BuildMode[this.options.buildMode as keyof typeof BuildMode];
                }
            } else {
                buildMode = this.options.buildMode;
            }
        }
        this.reqEaseOptions = {
            form: form,
            okBtn: okBtn,
            formValidator: this.options.formValidator??{},
            buildMode: buildMode,
            requester: this.options.requester??{}
        };
        return this.reqEaseOptions;
    }
}