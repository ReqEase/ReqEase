import {
    FieldValidator,
    FormValidatorOptions,
    FormValidatorOptionsInterface
} from "./FormValidatorOptions";
import {FormValidatorBuilder} from "./FormValidatorBuilder";
import {CustomValidation} from "./CustomValidation";
import {ReqEaseOptions} from "../ReqEaseOptions";
import {Constraint, RealConstraints} from "./Constraint";
import {validate} from "validate.js";
import {InputMessage, InputMessageRenderer} from "../view/messages/InputMessage";
import { Messages } from "../view/Messages";
import MessageStatus = Messages.MessageStatus;
import DefaultMessageData = Messages.DefaultMessageData;
import {defaultCallbacks, ValidatorCallbacks} from "./ValidatorCallbacks";
import {CaptchaHandlerManager} from "../view/captcha/CaptchaHandlerManager";

type ValidationErrors = {
    [key: string]: string[];
} | undefined;
export class FormValidator {
    reqEaseOptions: ReqEaseOptions;
    options: FormValidatorOptions;
    constraints: Constraint[] = [];
    fieldsValidators: FieldValidator[] = [];
    customValidations: CustomValidation[] = [];
    inputMessageRenderer: InputMessageRenderer;
    validatorCallbacks: ValidatorCallbacks;

    static Builder(options: Partial<FormValidatorOptionsInterface>, reqEaseOptions: ReqEaseOptions = ReqEaseOptions.Builder({}).build()): FormValidatorBuilder
    {
        return new FormValidatorBuilder(options, reqEaseOptions);
    }

    constructor(options: FormValidatorOptions) {
        this.options = options;
    }

    validate(internalValidatorCallbacks: ValidatorCallbacks = defaultCallbacks): void {

        new Promise((resolve: (v: boolean) => void, _reject) => {
            let realConstraint: RealConstraints = this.#buildRealConstraints();
            let errors = this.#executeValidate(realConstraint);
            if (errors) {
                this.#showAllErrors(errors);
                resolve(false);
                return;
            }
            this.#executeCustomValidation((validationSucceed: boolean) => {
                if (!validationSucceed) {
                    resolve(false);
                    return;
                }
                resolve(true);
            });

        }).then(r => {
            if (r) {
                this.validatorCallbacks.onSuccess(this);
                internalValidatorCallbacks.onSuccess(this);
            }
            else{
                this.validatorCallbacks.onFailure(this);
                internalValidatorCallbacks.onFailure(this);
            }
        });
    }

    initiate() {
        let realConstraint: RealConstraints = this.#buildRealConstraints();
        let fieldsValidators = this.fieldsValidators;
        for (let i = 0; i < fieldsValidators.length; i++) {
            let field = fieldsValidators[i].field;
            let eventListener:  JQuery.TypeEventHandler<Element, undefined, Element, HTMLElement, "change"> = (e) => {
                let errors = this.#executeValidate(realConstraint);
                let target = $(e.target);
                let key = target.attr('name');
                if (errors && errors[key]) {
                    FormValidator.showInputError(target, errors[key], this.inputMessageRenderer);
                }
            };
            field.off('change', eventListener);
            field.on('change', eventListener);
        }

        //captcha
        if (this.options.captcha) {
            let captchaHandler = CaptchaHandlerManager.createHandler(this.options.captcha.label??"", this, this.options.captcha);
            captchaHandler.init(() => {
                console.log("captcha ready");
            });
        }
    }

    #executeValidate(realConstraint: RealConstraints): ValidationErrors
    {
        return validate($(this.options.form), realConstraint, {fullMessages: false});
    }

    #showAllErrors(errors: ValidationErrors) {
        let fieldsValidators = this.fieldsValidators;
        for (let i = 0; i < fieldsValidators.length; i++) {
            let field = fieldsValidators[i].field;
            let key = field.attr('name');
            if (errors[key]) FormValidator.showInputError(field, errors[key], this.inputMessageRenderer);
        }
    }

    static showInputError(input: JQuery<HTMLElement>, errorMsgs: string[], inputMessageRenderer: InputMessageRenderer): void
    {
        let messagesData: DefaultMessageData[] = [];
        for (let i = 0; i < errorMsgs.length; i++) {
            messagesData.push({
                status: MessageStatus.DANGER,
                message: errorMsgs[i]
            });
        }
        let inputMessage = new InputMessage(messagesData, inputMessageRenderer);
        inputMessage.targetElement = input;
        inputMessage.show();
    }

    #buildRealConstraints():RealConstraints
    {
        let realConstraints: RealConstraints = {};
        let fieldsValidators = this.fieldsValidators;
        for (let i = 0; i < fieldsValidators.length; i++) {
            let key = fieldsValidators[i].field.attr('name');
            realConstraints[key] = fieldsValidators[i].constraint;
            delete realConstraints[key].name;
        }
        return realConstraints;
    }

    #executeCustomValidation(done: (result: boolean) => void, index: number = 0)
    {
        if (index >= this.customValidations.length) {
            done(true);
            return;
        }
        let customValidation = this.customValidations[index];
        customValidation((validationSucceed) => {
            if (!validationSucceed) {
                done(false);
                return;
            }
            this.#executeCustomValidation(done, index + 1);
        });
    }
}