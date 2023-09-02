import {FormValidationGlobalOptions} from "./forms/FormValidatorOptions";
import {BuildMode} from "./root/BuildMode";
import {ReqEaseOptionsBuilder} from "./ReqEaseOptionsBuilder";
import {RequesterOptionsEntered} from "./requester/RequesterOptions";
import {HtmlButtonGeneralElement, HtmlFormGeneralElement} from "./root/HtmlGeneralElement";



interface ReqEaseOptionsInterface {
    form: HtmlFormGeneralElement
    okBtn: HtmlButtonGeneralElement
    validation: FormValidationGlobalOptions;
    requester: RequesterOptionsEntered;
    buildMode: BuildMode;
}

export type ReqEaseOptionsEntered = Partial<ReqEaseOptionsInterface>;

export interface ReqEaseOptionsJquery extends ReqEaseOptionsEntered {
    validation: Omit<FormValidationGlobalOptions, "form">
}

export class ReqEaseOptions implements Omit<ReqEaseOptionsInterface, "form" | "okBtn">{
    buildMode: BuildMode;
    validation: FormValidationGlobalOptions;
    form: JQuery<HTMLElement> | undefined;
    okBtn: JQuery<HTMLElement> | undefined;
    requester: RequesterOptionsEntered;

    static Builder(options: ReqEaseOptionsEntered): ReqEaseOptionsBuilder
    {
        return new ReqEaseOptionsBuilder(options);
    }

}