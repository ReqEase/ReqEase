import {ValidatorCallbacks} from "./ValidatorCallbacks";
import {FormValidatorStrings} from "./FormValidatorStrings";
import {FormValidatorOptionsBuilder} from "./FormValidatorOptionsBuilder";
import {Constraint} from "./Constraint";
import {ValidationTrigger} from "./ValidationTrigger";
import {CustomValidation} from "./CustomValidation";
import {HtmlButtonGeneralElement, HtmlFormGeneralElement, HtmlGeneralElement} from "../root/HtmlGeneralElement";
import {ValidatorsSource} from "./ValidatorsSource";
import {InputMessageRenderer} from "../view/messages/InputMessage";
import {CaptchaEnteredOptions, CaptchaHandler} from "../view/captcha/CaptchaHandler";

export interface FieldValidatorEntered {
    constraint: Constraint | string | undefined;
    /**
     * field can be either a html element(s) instance(s) (document or jquery).
     * or can be a string representing the name attr of an element, or string starts with (selector:) it specify the selector and not the name.
     * or a function that returns HtmlGeneralElement | HtmlGeneralElement[]
     */
    field: HtmlGeneralElement | HtmlGeneralElement[] | (() => HtmlGeneralElement[]) | undefined;
}
export interface FieldValidator {
    constraint: Constraint;
    field: JQuery<HTMLElement>;
    name: string;
}

export type FormValidationGlobalOptions = Partial<FormValidatorOptionsInterface>;
export interface FormValidatorOptionsInterface {
    validationTrigger: ValidationTrigger | undefined;
    validatorsSource: ValidatorsSource | undefined;
    callbacks: Partial<ValidatorCallbacks> | undefined
    defaultConstraints: Constraint[] | undefined;
    newConstraints: Constraint[] | undefined;
    strings: Partial<FormValidatorStrings> | undefined;
    customValidations?: CustomValidation[];
    fieldsValidators?: FieldValidatorEntered[] | undefined;
    inputMessageRenderer?: Partial<InputMessageRenderer> | undefined;
    form: HtmlFormGeneralElement;
    okBtn: HtmlButtonGeneralElement;
    loadWhileValidating: boolean;
    verificationDuringLoading: boolean;
    captchaHandlersToRegister: (typeof CaptchaHandler)[] | typeof CaptchaHandler;
    captcha?: boolean | CaptchaEnteredOptions;
}

interface FormValidatorOptionsImplemented extends FormValidatorOptionsInterface{
    form: JQuery<HTMLElement> | undefined;
    okBtn: JQuery<HTMLElement> | undefined;
    captcha?: false | CaptchaEnteredOptions;
}

export class FormValidatorOptions implements FormValidatorOptionsImplemented{
    validationTrigger: ValidationTrigger | undefined;
    validatorsSource: ValidatorsSource | undefined;
    callbacks: Partial<ValidatorCallbacks> | undefined;
    defaultConstraints: Constraint[] | undefined;
    newConstraints: Constraint[] | undefined;
    strings: Partial<FormValidatorStrings> | undefined;
    customValidations: CustomValidation[] | undefined;
    fieldsValidators: FieldValidatorEntered[] | undefined;
    inputMessageRenderer: Partial<InputMessageRenderer> | undefined;
    form: JQuery<HTMLElement> | undefined;
    okBtn: JQuery<HTMLElement> | undefined;
    loadWhileValidating: boolean;
    verificationDuringLoading: boolean;
    captchaHandlersToRegister: (typeof CaptchaHandler)[] | typeof CaptchaHandler;
    captcha?: false | CaptchaEnteredOptions;

    public constructor() {}

    static Builder(
        options: Partial<FormValidatorOptionsInterface>
    ): FormValidatorOptionsBuilder {
        return new FormValidatorOptionsBuilder(options);
    }

}