var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FormValidator_instances, _FormValidator_executeValidate, _FormValidator_showAllErrors, _FormValidator_buildRealConstraints, _FormValidator_executeCustomValidation;
import { FormValidatorBuilder } from "./FormValidatorBuilder";
import { ReqEaseOptions } from "../ReqEaseOptions";
import { validate } from "validate.js";
import { InputMessage } from "../view/messages/InputMessage";
import { Messages } from "../view/Messages";
var MessageStatus = Messages.MessageStatus;
import { defaultCallbacks } from "./ValidatorCallbacks";
import { CaptchaHandlerManager } from "../view/captcha/CaptchaHandlerManager";
export class FormValidator {
    static Builder(options, reqEaseOptions = ReqEaseOptions.Builder({}).build()) {
        return new FormValidatorBuilder(options, reqEaseOptions);
    }
    constructor(options) {
        _FormValidator_instances.add(this);
        this.constraints = [];
        this.fieldsValidators = [];
        this.customValidations = [];
        this.options = options;
    }
    validate(internalValidatorCallbacks = defaultCallbacks) {
        new Promise((resolve, _reject) => {
            let realConstraint = __classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_buildRealConstraints).call(this);
            let errors = __classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_executeValidate).call(this, realConstraint);
            if (errors) {
                __classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_showAllErrors).call(this, errors);
                resolve(false);
                return;
            }
            __classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_executeCustomValidation).call(this, (validationSucceed) => {
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
            else {
                this.validatorCallbacks.onFailure(this);
                internalValidatorCallbacks.onFailure(this);
            }
        });
    }
    initiate() {
        var _a;
        let realConstraint = __classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_buildRealConstraints).call(this);
        let fieldsValidators = this.fieldsValidators;
        for (let i = 0; i < fieldsValidators.length; i++) {
            let field = fieldsValidators[i].field;
            let eventListener = (e) => {
                let errors = __classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_executeValidate).call(this, realConstraint);
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
            let captchaHandler = CaptchaHandlerManager.createHandler((_a = this.options.captcha.label) !== null && _a !== void 0 ? _a : "", this, this.options.captcha);
            captchaHandler.init(() => {
                console.log("captcha ready");
            });
        }
    }
    static showInputError(input, errorMsgs, inputMessageRenderer) {
        let messagesData = [];
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
}
_FormValidator_instances = new WeakSet(), _FormValidator_executeValidate = function _FormValidator_executeValidate(realConstraint) {
    return validate($(this.options.form), realConstraint, { fullMessages: false });
}, _FormValidator_showAllErrors = function _FormValidator_showAllErrors(errors) {
    let fieldsValidators = this.fieldsValidators;
    for (let i = 0; i < fieldsValidators.length; i++) {
        let field = fieldsValidators[i].field;
        let key = field.attr('name');
        if (errors[key])
            FormValidator.showInputError(field, errors[key], this.inputMessageRenderer);
    }
}, _FormValidator_buildRealConstraints = function _FormValidator_buildRealConstraints() {
    let realConstraints = {};
    let fieldsValidators = this.fieldsValidators;
    for (let i = 0; i < fieldsValidators.length; i++) {
        let key = fieldsValidators[i].field.attr('name');
        realConstraints[key] = fieldsValidators[i].constraint;
        delete realConstraints[key].name;
    }
    return realConstraints;
}, _FormValidator_executeCustomValidation = function _FormValidator_executeCustomValidation(done, index = 0) {
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
        __classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_executeCustomValidation).call(this, done, index + 1);
    });
};
