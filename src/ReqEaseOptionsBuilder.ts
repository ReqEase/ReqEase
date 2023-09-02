import {ReqEaseOptions, ReqEaseOptionsEntered} from "./ReqEaseOptions";
import {BuildMode} from "./root/BuildMode";
import {getOneJqueryElement} from "./root/HtmlGeneralElement";

export class ReqEaseOptionsBuilder {
    options: ReqEaseOptionsEntered;
    reqEaseOptions: ReqEaseOptions;

    constructor(options: ReqEaseOptionsEntered) {
        this.options = options;
    }

    build(): ReqEaseOptions {
        this.reqEaseOptions = {
            form: getOneJqueryElement(this.options.form),
            okBtn: getOneJqueryElement(this.options.okBtn),
            validation: this.options.validation??{},
            buildMode: this.options.buildMode??BuildMode.ON_INIT,
            requester: this.options.requester??{}
        };
        return this.reqEaseOptions;
    }
}