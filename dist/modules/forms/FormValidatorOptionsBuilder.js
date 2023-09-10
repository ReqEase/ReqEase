import { FormValidatorOptions } from "./FormValidatorOptions";
import { defaultStrings } from "./FormValidatorStrings";
import { defaultCallbacks } from "./ValidatorCallbacks";
import { defaultValidationSource } from "./ValidatorsSource";
import { getOkBtnFromForm } from "../root/HtmlGeneralElement";
import { collectCaptchaHandlers } from "../view/captcha/handlers/HandlerCollector";
import { isUndefinedOrNull } from "../root/utils";
import { defaultCaptchaOptions, isCaptchaOptions } from "../view/captcha/CaptchaHandler";
export class FormValidatorOptionsBuilder {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f;
        this.options = new FormValidatorOptions();
        this.formValidatorStrings = options.strings ? options.strings : {};
        this.validatorCallbacks = options.callbacks ? options.callbacks : {};
        this.options.defaultConstraints = options.defaultConstraints ? options.defaultConstraints : [];
        this.options.newConstraints = options.newConstraints ? options.newConstraints : [];
        this.options.validatorsSource = (_a = options.validatorsSource) !== null && _a !== void 0 ? _a : defaultValidationSource;
        this.options.customValidations = (_b = options.customValidations) !== null && _b !== void 0 ? _b : [];
        this.options.fieldsValidators = (_c = options.fieldsValidators) !== null && _c !== void 0 ? _c : [];
        this.options.inputMessageRenderer = (_d = options.inputMessageRenderer) !== null && _d !== void 0 ? _d : {};
        // add the form,okBtb
        [this.options.form, this.options.okBtn] = getOkBtnFromForm(options.form, options.okBtn);
        this.options.validationDuringLoading = (_e = options.validationDuringLoading) !== null && _e !== void 0 ? _e : true;
        this.options.captchaHandlersToRegister = (_f = options.captchaHandlersToRegister) !== null && _f !== void 0 ? _f : [];
        if (isUndefinedOrNull(this.options.captcha)) {
            let captcha = options.captcha;
            if (captcha === true) {
                this.options.captcha = defaultCaptchaOptions;
            }
            else if (isCaptchaOptions(captcha)) {
                this.options.captcha = Object.assign(Object.assign({}, defaultCaptchaOptions), captcha);
            }
        }
    }
    build() {
        collectCaptchaHandlers();
        if (Array.isArray(this.options.captchaHandlersToRegister)) {
            collectCaptchaHandlers(this.options.captchaHandlersToRegister);
        }
        else {
            collectCaptchaHandlers([this.options.captchaHandlersToRegister]);
        }
        this.options.strings = Object.assign(Object.assign({}, defaultStrings), this.formValidatorStrings);
        this.options.callbacks = Object.assign(Object.assign({}, defaultCallbacks), this.validatorCallbacks);
        this.options.defaultConstraints = this.buildDefaultConstraints();
        return this.options;
    }
    buildDefaultConstraints() {
        var _a, _b, _c;
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
                    tooShort: (_b = (_a = this.options.strings) === null || _a === void 0 ? void 0 : _a.length) === null || _b === void 0 ? void 0 : _b.passwordTooShort,
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
        ], (_c = this.options.defaultConstraints) !== null && _c !== void 0 ? _c : []);
    }
}
export function mergeArrays(array1, array2) {
    const mergedArray = [];
    for (const item1 of array1) {
        const matchingItem = array2.find(item2 => (item2 === null || item2 === void 0 ? void 0 : item2.name) === (item1 === null || item1 === void 0 ? void 0 : item1.name));
        if (matchingItem) {
            mergedArray.push(Object.assign(Object.assign({}, item1), matchingItem));
        }
        else {
            if (item1)
                mergedArray.push(item1);
        }
    }
    return mergedArray;
}
