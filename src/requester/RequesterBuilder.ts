import {RequesterOptions, RequesterOptionsEntered} from "./RequesterOptions";
import {Requester} from "./Requester";
import {LoadingIndicator} from "../view/LoadingIndicator";
import {ReqEase} from "../ReqEase";

export class RequesterBuilder {
    requesterOptionsEntered: RequesterOptionsEntered
    reqEase: ReqEase;
    requester: Requester
    constructor(requesterOptionsEntered: RequesterOptionsEntered, reqEase: ReqEase) {
        this.requesterOptionsEntered = requesterOptionsEntered;
        this.requester = new Requester();
        this.reqEase = reqEase;
    }
    build() {
        // override default form,okBtn by ReqEaseOptions
        this.requesterOptionsEntered.form = this.requesterOptionsEntered.form??this.reqEase.reqEaseOptions.form;
        this.requesterOptionsEntered.okBtn = this.requesterOptionsEntered.okBtn??this.reqEase.reqEaseOptions.okBtn;
        this.requester.requesterOptions = RequesterOptions.Builder(this.requesterOptionsEntered, this.reqEase).build();
        this.requester.reqEaseOptions = this.reqEase.reqEaseOptions;

        this.requester.loadingIndicator = new LoadingIndicator(this.requester, this.requester.requesterOptions.loading);
        return this.requester;
    }
}