// ReqEase.ts
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ReqEase_instances, _ReqEase_prepare;
import { ReqEaseOptions } from "./ReqEaseOptions";
import { FormValidator } from "./forms/FormValidator";
import { BuildMode } from "./root/BuildMode";
import { ReqEaseBuilder } from "./ReqEaseBuilder";
import { isUndefinedOrNull } from "./root/utils";
import { Requester } from "./requester/Requester";
export class ReqEase {
    constructor(reqEaseOptions = {}) {
        _ReqEase_instances.add(this);
        this.reqEaseOptions = ReqEaseOptions.Builder(reqEaseOptions).build();
        ReqEase.Builder(reqEaseOptions, this).build();
        __classPrivateFieldGet(this, _ReqEase_instances, "m", _ReqEase_prepare).call(this);
        this.start();
    }
    static Builder(reqEaseOptions, instance) {
        return new ReqEaseBuilder(reqEaseOptions, instance);
    }
    start() {
        console.log(this.requester);
        if (this.reqEaseOptions.buildMode === BuildMode.everytime) {
            __classPrivateFieldGet(this, _ReqEase_instances, "m", _ReqEase_prepare).call(this);
        }
        if (isUndefinedOrNull(this.reqEaseOptions.okBtn)) {
            console.error('okBtn is required');
            return;
        }
        this.formValidator.initiate();
        this.reqEaseOptions.okBtn.on('click', () => {
            new Promise((resolve) => {
                if (this.formValidator.options.validationDuringLoading) {
                    this.requester.loadingIndicator.startLoading().then(() => resolve(true));
                }
                else {
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
}
_ReqEase_instances = new WeakSet(), _ReqEase_prepare = function _ReqEase_prepare() {
    var _a, _b;
    if (!isUndefinedOrNull(this.reqEaseOptions.form)) {
        this.reqEaseOptions.form.on('submit', (event) => {
            event.preventDefault(); // Prevent the form from submitting traditionally
        });
    }
    this.formValidator = FormValidator.Builder((_a = this.reqEaseOptions.formValidator) !== null && _a !== void 0 ? _a : {}, this.reqEaseOptions).build();
    this.requester = Requester.Builder((_b = this.reqEaseOptions.requester) !== null && _b !== void 0 ? _b : {}, this).build();
};
