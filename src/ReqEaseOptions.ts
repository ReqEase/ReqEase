import {FormValidationOptionsEntered} from "./forms/FormValidatorOptions";
import {BuildMode, BuildModeString} from "./root/BuildMode";
import {ReqEaseOptionsBuilder} from "./ReqEaseOptionsBuilder";
import {RequesterOptionsEntered} from "./requester/RequesterOptions";
import {HtmlButtonGeneralElement, HtmlFormGeneralElement} from "./root/HtmlGeneralElement";



interface ReqEaseOptionsInterface {
    form: HtmlFormGeneralElement
    okBtn: HtmlButtonGeneralElement
    formValidator: FormValidationOptionsEntered;
    requester: RequesterOptionsEntered;
    buildMode: BuildMode | BuildModeString;
}

export type ReqEaseOptionsEntered = Partial<ReqEaseOptionsInterface>;

export interface ReqEaseOptionsJquery extends Partial<ReqEaseOptionsEntered> {
    formValidator?: Omit<FormValidationOptionsEntered, "form">
}

export class ReqEaseOptions implements Omit<ReqEaseOptionsInterface, "form" | "okBtn">{
    buildMode: BuildMode;
    formValidator: FormValidationOptionsEntered;
    form: JQuery<HTMLElement> | undefined;
    okBtn: JQuery<HTMLElement> | undefined;
    requester: RequesterOptionsEntered;

    static Builder(options: ReqEaseOptionsEntered): ReqEaseOptionsBuilder
    {
        return new ReqEaseOptionsBuilder(options);
    }

}