var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FormValidatorBuilder_instances, _FormValidatorBuilder_prepareValidateJs, _FormValidatorBuilder_prepare, _FormValidatorBuilder_prepareFieldsValidator, _FormValidatorBuilder_prepareFormFieldsValidator, _FormValidatorBuilder_prepareGivenFieldsValidator, _FormValidatorBuilder_buildFieldsValidatorOfOneInstance, _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance, _FormValidatorBuilder_searchConstraint, _FormValidatorBuilder_prepareRenderer;
import { FormValidator } from "./FormValidator";
import { FormValidatorOptions } from "./FormValidatorOptions";
import * as validate from "validate.js";
import { getJqueryElement } from "../root/HtmlGeneralElement";
import { ValidatorsSource } from "./ValidatorsSource";
import { mergeArrays } from "./FormValidatorOptionsBuilder";
import { isUndefinedOrNull } from "../root/utils";
import { Messages } from "../view/Messages";
var MessageStatus = Messages.MessageStatus;
export class FormValidatorBuilder {
    constructor(options, reqEaseOptions) {
        _FormValidatorBuilder_instances.add(this);
        this.fieldsValidators = [];
        this.formValidator = new FormValidator(FormValidatorOptions.Builder(options)
            .build());
        this.reqEaseOptions = reqEaseOptions;
    }
    build() {
        var _a, _b;
        // override default form,okBtn by ReqEaseOptions
        if (!isUndefinedOrNull(this.reqEaseOptions.form)) {
            this.formValidator.options.form = this.reqEaseOptions.form;
        }
        if (!isUndefinedOrNull(this.reqEaseOptions.okBtn)) {
            this.formValidator.options.okBtn = this.reqEaseOptions.okBtn;
        }
        __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareValidateJs).call(this);
        __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepare).call(this);
        this.formValidator.fieldsValidators = this.fieldsValidators;
        this.formValidator.customValidations = (_a = this.formValidator.options.customValidations) !== null && _a !== void 0 ? _a : [];
        this.formValidator.reqEaseOptions = this.reqEaseOptions;
        this.formValidator.validatorCallbacks = Object.assign({
            onSuccess: () => {
            },
            onFailure: () => {
            }
        }, (_b = this.formValidator.options.callbacks) !== null && _b !== void 0 ? _b : {});
        return this.formValidator;
    }
}
_FormValidatorBuilder_instances = new WeakSet(), _FormValidatorBuilder_prepareValidateJs = function _FormValidatorBuilder_prepareValidateJs() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    validate.validators.length.tooShort = isUndefinedOrNull((_b = (_a = this.formValidator.options.strings) === null || _a === void 0 ? void 0 : _a.length) === null || _b === void 0 ? void 0 : _b.defaultTooShort) ? validate.validators.length.tooShort : (_d = (_c = this.formValidator.options.strings) === null || _c === void 0 ? void 0 : _c.length) === null || _d === void 0 ? void 0 : _d.defaultTooShort;
    validate.validators.length.tooLong = isUndefinedOrNull((_f = (_e = this.formValidator.options.strings) === null || _e === void 0 ? void 0 : _e.length) === null || _f === void 0 ? void 0 : _f.defaultTooLong) ? validate.validators.length.tooLong : (_h = (_g = this.formValidator.options.strings) === null || _g === void 0 ? void 0 : _g.length) === null || _h === void 0 ? void 0 : _h.defaultTooLong;
    validate.validators.email.message = isUndefinedOrNull((_k = (_j = this.formValidator.options.strings) === null || _j === void 0 ? void 0 : _j.format) === null || _k === void 0 ? void 0 : _k.defaultInvalid) ? validate.validators.email.message : (_m = (_l = this.formValidator.options.strings) === null || _l === void 0 ? void 0 : _l.format) === null || _m === void 0 ? void 0 : _m.defaultInvalid;
    validate.validators.presence.message = isUndefinedOrNull((_o = this.formValidator.options.strings) === null || _o === void 0 ? void 0 : _o.required) ? validate.validators.presence.message : (_p = this.formValidator.options.strings) === null || _p === void 0 ? void 0 : _p.required;
}, _FormValidatorBuilder_prepare = function _FormValidatorBuilder_prepare() {
    __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareFieldsValidator).call(this);
    __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareRenderer).call(this);
}, _FormValidatorBuilder_prepareFieldsValidator = function _FormValidatorBuilder_prepareFieldsValidator() {
    if (this.formValidator.options.validatorsSource === ValidatorsSource.FULL) {
        this.formValidator.constraints = mergeArrays(this.formValidator.options.defaultConstraints, this.formValidator.options.newConstraints);
        __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareFormFieldsValidator).call(this);
    }
    else if (this.formValidator.options.validatorsSource === ValidatorsSource.ONLY_DEFINED) {
        this.formValidator.constraints = this.formValidator.options.newConstraints;
    }
    __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareGivenFieldsValidator).call(this);
}, _FormValidatorBuilder_prepareFormFieldsValidator = function _FormValidatorBuilder_prepareFormFieldsValidator() {
    if (isUndefinedOrNull(this.formValidator.options.form)) {
        if (this.formValidator.options.validatorsSource === ValidatorsSource.FULL) {
            console.error("Form is not defined. when you use 'validatorsSource' as 'FULL', you must define 'form' in ReqEaseOptions.");
        }
        return;
    }
    let form = this.formValidator.options.form;
    let inputs = form.find('input, textarea, select');
    for (let i = 0; i < inputs.length; i++) {
        let fieldElement = $(inputs[i]);
        let constraintName = fieldElement.attr('name');
        if (isUndefinedOrNull(constraintName) || constraintName === "")
            continue;
        let fieldsValidator = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_buildFieldsValidatorOfOneInstance).call(this, fieldElement, constraintName);
        this.fieldsValidators = [...this.fieldsValidators, ...fieldsValidator];
    }
}, _FormValidatorBuilder_prepareGivenFieldsValidator = function _FormValidatorBuilder_prepareGivenFieldsValidator() {
    if (isUndefinedOrNull(this.formValidator.options.fieldsValidators))
        return;
    for (let i = 0; i < this.formValidator.options.fieldsValidators.length; i++) {
        let fieldComplex = this.formValidator.options.fieldsValidators[i].field;
        let constraintName = this.formValidator.options.fieldsValidators[i].constraint;
        let fieldElements;
        if (isUndefinedOrNull(fieldComplex))
            continue;
        let jq;
        if (fieldsAreVoid(fieldComplex)) {
            jq = getJqueryElement(fieldComplex());
        }
        else if (fieldsIsHtmlGeneralElement(fieldComplex)) {
            jq = getJqueryElement(fieldComplex);
        }
        else {
            continue;
        }
        if (isUndefinedOrNull(jq))
            continue;
        fieldElements = jq;
        let fieldsValidator = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_buildFieldsValidatorOfOneInstance).call(this, fieldElements, constraintName);
        this.fieldsValidators = [...this.fieldsValidators, ...fieldsValidator];
    }
}, _FormValidatorBuilder_buildFieldsValidatorOfOneInstance = function _FormValidatorBuilder_buildFieldsValidatorOfOneInstance(fieldElements, constraint) {
    let constraintSearched = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_searchConstraint).call(this, constraint);
    if (typeof constraintSearched === 'undefined')
        return [];
    let fieldValidator = [];
    if (Array.isArray(fieldElements)) {
        for (let i = 0; i < fieldElements.length; i++) {
            let x = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance).call(this, fieldElements[i], constraintSearched);
            if (typeof x === 'undefined')
                continue;
            fieldValidator.push(x);
        }
    }
    else {
        let x = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance).call(this, fieldElements, constraintSearched);
        if (typeof x === 'undefined')
            return fieldValidator;
        fieldValidator.push(x);
    }
    return fieldValidator;
}, _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance = function _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance(fieldElement, constraintSearched) {
    let attr = fieldElement.attr('data-validator-key');
    if (attr === 'ignore' || constraintSearched === 'ignore')
        return undefined;
    let assignedConstraint = (attr && attr !== "") ? __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_searchConstraint).call(this, attr) : constraintSearched;
    if (typeof assignedConstraint === 'undefined')
        return undefined;
    assignedConstraint = Object.assign({}, assignedConstraint);
    //generate random number from 10000 to 99999 to add to prefix "fieldValidator_"
    let random = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    let fieldValidatorName = `fieldValidator_${random}`;
    assignedConstraint.name = fieldValidatorName;
    return {
        field: fieldElement,
        constraint: assignedConstraint,
        name: fieldValidatorName
    };
}, _FormValidatorBuilder_searchConstraint = function _FormValidatorBuilder_searchConstraint(constraintSearch) {
    var _a, _b;
    if (typeof constraintSearch !== 'undefined' && typeof constraintSearch !== 'string') {
        return constraintSearch;
    }
    let constraint = (_a = this.formValidator.constraints) === null || _a === void 0 ? void 0 : _a.find((constraint) => constraint.name === constraintSearch);
    if (typeof constraint === 'undefined' || constraint === null) {
        constraint = (_b = this.formValidator.constraints) === null || _b === void 0 ? void 0 : _b.find((constraint) => constraint.name === 'required');
    }
    return constraint;
}, _FormValidatorBuilder_prepareRenderer = function _FormValidatorBuilder_prepareRenderer() {
    this.formValidator.inputMessageRenderer = Object.assign(Object.assign({}, defaultInputMessageRenderer), this.formValidator.options.inputMessageRenderer);
};
export const defaultInputMessageRenderer = {
    buildMessage: (_messageRenderer, _message, messageData) => {
        return $("<p class='validator-message text-" + messageData.status + "'>" + messageData.message + "</p>");
    },
    renderMessages: (messageRenderer, message, messagesData) => {
        var _a;
        let formGroup = (_a = message.targetElement.parent(".form-group")) !== null && _a !== void 0 ? _a : message.targetElement.parent();
        let messages = formGroup.find(".validator-messages-parent");
        if (isUndefinedOrNull(messages) || messages.length === 0) {
            let messages_tmp = $('<div class="validator-messages-parent"></div>');
            messages_tmp.appendTo(formGroup);
            messages = messages_tmp;
        }
        messageRenderer.removeMessages(messageRenderer, message);
        for (let messageData of messagesData) {
            let messageElement = messageRenderer.buildMessage(messageRenderer, message, messageData);
            messageElement.appendTo(messages);
        }
    },
    removeMessages: (_messageRenderer, message) => {
        var _a;
        let formGroup = (_a = message.targetElement.parent(".form-group")) !== null && _a !== void 0 ? _a : message.targetElement.parent();
        formGroup.find('.is-invalid').removeClass('is-invalid');
        formGroup.find('.is-valid').removeClass('is-valid');
        formGroup.find('.validator-messages-parent .validator-message').each(function (_index, element) {
            $(element).remove();
        });
    },
    affectInput: (_messageRenderer, message, messageData) => {
        let firstMessageData = messageData[0];
        if (firstMessageData.status === MessageStatus.SUCCESS) {
            message.targetElement.addClass('is-valid');
        }
        else if (firstMessageData.status === MessageStatus.DANGER) {
            message.targetElement.addClass('is-invalid');
        }
    }
};
function fieldsAreVoid(fields) {
    return typeof fields === 'function';
}
function fieldsIsHtmlGeneralElement(value) {
    return typeof value !== 'undefined' && typeof value !== "function";
}
