import { BuildMode } from "./root/BuildMode";
import { getOkBtnFromForm } from "./root/HtmlGeneralElement";
import { isUndefinedOrNull } from "./root/utils";
export class ReqEaseOptionsBuilder {
    constructor(options) {
        this.options = options;
    }
    build() {
        var _a, _b;
        let [form, okBtn] = getOkBtnFromForm(this.options.form, this.options.okBtn);
        let buildMode = BuildMode.onInit;
        if (!isUndefinedOrNull(this.options.buildMode)) {
            if (typeof this.options.buildMode === "string") {
                if (Object.keys(BuildMode).includes(this.options.buildMode)) {
                    buildMode = BuildMode[this.options.buildMode];
                }
            }
            else {
                buildMode = this.options.buildMode;
            }
        }
        this.reqEaseOptions = {
            form: form,
            okBtn: okBtn,
            formValidator: (_a = this.options.formValidator) !== null && _a !== void 0 ? _a : {},
            buildMode: buildMode,
            requester: (_b = this.options.requester) !== null && _b !== void 0 ? _b : {}
        };
        return this.reqEaseOptions;
    }
}
