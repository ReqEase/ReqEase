import {ReqEaseOptionsEntered} from "./ReqEaseOptions";
import {ReqEase} from "./ReqEase";

export class ReqEaseBuilder {
    reqEaseOptions: ReqEaseOptionsEntered
    reqEase: ReqEase
    constructor(reqEaseOptions: ReqEaseOptionsEntered, reqEase: ReqEase) {
        this.reqEaseOptions = reqEaseOptions;
        this.reqEase = reqEase;
    }

    build(): void
    {

    }
}