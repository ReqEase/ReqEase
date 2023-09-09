import {FormValidatorOptions, FormValidatorOptionsInterface} from "./FormValidatorOptions";
import {defaultStrings, FormValidatorStrings} from "./FormValidatorStrings";
import {defaultCallbacks, ValidatorCallbacks} from "./ValidatorCallbacks";
import {Constraint} from "./Constraint";
import {defaultValidationTrigger} from "./ValidationTrigger";
import {defaultValidationSource} from "./ValidatorsSource";
import {getOkBtnFromForm, getOneJqueryElement} from "../root/HtmlGeneralElement";
import {collectCaptchaHandlers} from "../view/captcha/handlers/HandlerCollector";
import {isUndefinedOrNull} from "../root/utils";
import {CaptchaEnteredOptions, defaultCaptchaOptions, isCaptchaOptions} from "../view/captcha/CaptchaHandler";

export class FormValidatorOptionsBuilder {
    private readonly options: FormValidatorOptions;
    formValidatorStrings : Partial<FormValidatorStrings> | undefined;
    validatorCallbacks : Partial<ValidatorCallbacks> | undefined;

    constructor(options: Partial<FormValidatorOptionsInterface> | undefined = {}) {
        this.options = new FormValidatorOptions();
        this.formValidatorStrings = options.strings ? options.strings : {};
        this.validatorCallbacks = options.callbacks ? options.callbacks : {};
        this.options.defaultConstraints = options.defaultConstraints ? options.defaultConstraints : [];
        this.options.newConstraints = options.newConstraints ? options.newConstraints : [];
        this.options.validatorsSource = options.validatorsSource ?? defaultValidationSource;
        this.options.customValidations = options.customValidations ?? [];
        this.options.fieldsValidators = options.fieldsValidators ?? [];
        this.options.inputMessageRenderer = options.inputMessageRenderer ?? {};
        // add the form,okBtb
        [this.options.form, this.options.okBtn] = getOkBtnFromForm(options.form, options.okBtn);
        this.options.validationDuringLoading = options.validationDuringLoading ?? true;
        this.options.captchaHandlersToRegister = options.captchaHandlersToRegister??[];
        if (isUndefinedOrNull(this.options.captcha)) {
            let captcha: boolean | CaptchaEnteredOptions = options.captcha;
            if (captcha === true) {
                this.options.captcha = defaultCaptchaOptions;
            }
            else if (isCaptchaOptions(captcha)) {
                this.options.captcha = {...defaultCaptchaOptions, ...captcha};
            }
        }
    }

    build(): FormValidatorOptions {
        collectCaptchaHandlers();
        if (Array.isArray(this.options.captchaHandlersToRegister)) {
            collectCaptchaHandlers(this.options.captchaHandlersToRegister);
        }
        else{
            collectCaptchaHandlers([this.options.captchaHandlersToRegister]);
        }

        this.options.strings = {...defaultStrings, ...this.formValidatorStrings};
        this.options.callbacks = {...defaultCallbacks, ...this.validatorCallbacks};
        this.options.defaultConstraints = this.buildDefaultConstraints();
        return this.options;
    }

    private buildDefaultConstraints(): Constraint[] {
        return mergeArrays([
            {
                name: "phoneNumber",
                presence: true,
                length: {
                    minimum: 10,
                    maximum: 10
                },
                format: {
                    pattern: "/^[0-9]+$/",
                }
            },
            {
                name: "username",
                presence: true,
                length: {
                    minimum: 4,
                    maximum: 255
                },
                format: {
                    pattern: "[a-z0-9.]*",
                }
            },
            {
                name: "email",
                presence: true,
                email: true,
                length: {
                    maximum: 255
                }
            },
            {
                name: "password",
                presence: true,
                length: {
                    minimum: 6,
                    maximum: 255,
                    tooShort: this.options.strings?.length?.passwordTooShort,
                }
            },
            {
                name: "password_confirmation",
                presence: true,
                equality: "password"
            },
            {
                name: "fname",
                presence: true,
                length: {
                    minimum: 3,
                    maximum: 255
                },
                format: {
                    pattern: "[a-zA-Z]+(?:\\s[a-zA-Z]+)*",
                }
            },
            {
                name: "lname",
                presence: true,
                length: {
                    minimum: 3,
                    maximum: 255
                },
                format: {
                    pattern: "[a-zA-Z]+(?:\\s[a-zA-Z]+)*",
                }
            },
            {
                name: "required",
                presence: true
            }
        ], this.options.defaultConstraints??[]);
    }
}

export function mergeArrays(array1: Partial<Constraint[]>, array2: Partial<Constraint[]>): Constraint[] {
    const mergedArray: Constraint[] = [];

    for (const item1 of array1) {
        const matchingItem = array2.find(item2 => item2?.name === item1?.name);

        if (matchingItem) {
            mergedArray.push({ ...item1, ...matchingItem });
        } else {
            if (item1) mergedArray.push(item1);
        }
    }
    return mergedArray;
}