import { RequesterOptions } from "./RequesterOptions";
import { Requester } from "./Requester";
import { LoadingIndicator } from "../view/LoadingIndicator";
export class RequesterBuilder {
    constructor(requesterOptionsEntered, reqEase) {
        this.requesterOptionsEntered = requesterOptionsEntered;
        this.requester = new Requester();
        this.reqEase = reqEase;
    }
    build() {
        var _a, _b;
        // override default form,okBtn by ReqEaseOptions
        this.requesterOptionsEntered.form = (_a = this.requesterOptionsEntered.form) !== null && _a !== void 0 ? _a : this.reqEase.reqEaseOptions.form;
        this.requesterOptionsEntered.okBtn = (_b = this.requesterOptionsEntered.okBtn) !== null && _b !== void 0 ? _b : this.reqEase.reqEaseOptions.okBtn;
        this.requester.requesterOptions = RequesterOptions.Builder(this.requesterOptionsEntered, this.reqEase).build();
        this.requester.reqEaseOptions = this.reqEase.reqEaseOptions;
        this.requester.loadingIndicator = new LoadingIndicator(this.requester, this.requester.requesterOptions.loading);
        return this.requester;
    }
}
