import {FormValidator} from "./FormValidator";
import {FieldValidator, FormValidatorOptions, FormValidatorOptionsInterface} from "./FormValidatorOptions";
import * as validate from "validate.js";
import {getJqueryElement, HtmlGeneralElement} from "../root/HtmlGeneralElement";
import {Constraint} from "./Constraint";
import {ReqEaseOptions} from "../ReqEaseOptions";
import {ValidatorsSource} from "./ValidatorsSource";
import {mergeArrays} from "./FormValidatorOptionsBuilder";
import {isUndefinedOrNull} from "../root/utils";
import {Messages} from "../view/Messages";
import {InputMessage, InputMessageRenderer} from "../view/messages/InputMessage";
import DefaultMessageData = Messages.DefaultMessageData;
import MessageStatus = Messages.MessageStatus;

export class FormValidatorBuilder {
    formValidator?: FormValidator
    fieldsValidators: FieldValidator[] = [];
    reqEaseOptions: ReqEaseOptions;

    constructor(options: Partial<FormValidatorOptionsInterface>, reqEaseOptions: ReqEaseOptions) {
        this.formValidator = new FormValidator(FormValidatorOptions.Builder(options)
            .build());
        this.reqEaseOptions = reqEaseOptions;
    }

    build(): FormValidator
    {
        // override default form,okBtn by ReqEaseOptions
        if (!isUndefinedOrNull(this.reqEaseOptions.form)) {
            this.formValidator.options.form = this.reqEaseOptions.form;
        }
        if (!isUndefinedOrNull(this.reqEaseOptions.okBtn)) {
            this.formValidator.options.okBtn = this.reqEaseOptions.okBtn;
        }
        this.#prepareValidateJs();
        this.#prepare();
        this.formValidator.fieldsValidators = this.fieldsValidators;
        this.formValidator.customValidations = this.formValidator.options.customValidations??[];
        this.formValidator.reqEaseOptions = this.reqEaseOptions;
        this.formValidator.validatorCallbacks = {
            ...{
                onSuccess: () => {
                    
                },
                onFailure: () => {
                    
                }
            },
            ...this.formValidator.options.callbacks??{}
        }
        return this.formValidator;
    }

    #prepareValidateJs(): void {
        validate.validators.length.tooShort = isUndefinedOrNull(this.formValidator.options.strings?.length?.defaultTooShort) ? validate.validators.length.tooShort : this.formValidator.options.strings?.length?.defaultTooShort;
        validate.validators.length.tooLong = isUndefinedOrNull(this.formValidator.options.strings?.length?.defaultTooLong) ? validate.validators.length.tooLong : this.formValidator.options.strings?.length?.defaultTooLong;
        validate.validators.email.message = isUndefinedOrNull(this.formValidator.options.strings?.format?.defaultInvalid) ? validate.validators.email.message : this.formValidator.options.strings?.format?.defaultInvalid;
        validate.validators.presence.message = isUndefinedOrNull(this.formValidator.options.strings?.required) ? validate.validators.presence.message : this.formValidator.options.strings?.required;
    }

    #prepare() {
        this.#prepareFieldsValidator();
        this.#prepareRenderer();
    }

    #prepareFieldsValidator() {
        if (this.formValidator.options.validatorsSource === ValidatorsSource.FULL) {
            this.formValidator.constraints = mergeArrays(this.formValidator.options.defaultConstraints, this.formValidator.options.newConstraints);
            this.#prepareFormFieldsValidator();
        }
        else if (this.formValidator.options.validatorsSource === ValidatorsSource.ONLY_DEFINED) {
            this.formValidator.constraints = this.formValidator.options.newConstraints;
        }
        this.#prepareGivenFieldsValidator();
    }

    #prepareFormFieldsValidator() {
        if (isUndefinedOrNull(this.formValidator.options.form)) {
            if (this.formValidator.options.validatorsSource === ValidatorsSource.FULL) {
                console.error("Form is not defined. when you use 'validatorsSource' as 'FULL', you must define 'form' in ReqEaseOptions.");
            }
            return;
        }

        let form: JQuery<HTMLElement> = this.formValidator.options.form;
        let inputs = form.find('input, textarea, select');

        for (let i = 0; i < inputs.length; i++) {
            let fieldElement: JQuery<HTMLElement> = $(inputs[i]);
            let constraintName = fieldElement.attr('name');
            let fieldsValidator = this.#buildFieldsValidatorOfOneInstance(fieldElement, constraintName);
            this.fieldsValidators = [...this.fieldsValidators, ...fieldsValidator];
        }
    }

    #prepareGivenFieldsValidator() {
        if (isUndefinedOrNull(this.formValidator.options.fieldsValidators)) return;
        for (let i = 0; i < this.formValidator.options.fieldsValidators.length; i++) {
            let fieldComplex = this.formValidator.options.fieldsValidators[i].field;
            let constraintName = this.formValidator.options.fieldsValidators[i].constraint;
            let fieldElements: JQuery<HTMLElement> | JQuery<HTMLElement>[];
            if (isUndefinedOrNull(fieldComplex)) continue;
            let jq;
            if (fieldsAreVoid(fieldComplex)) {
                jq = getJqueryElement(fieldComplex());
            } else if (fieldsIsHtmlGeneralElement(fieldComplex)) {
                jq = getJqueryElement(fieldComplex);
            } else {
                continue;
            }
            if (isUndefinedOrNull(jq)) continue;
            fieldElements = jq;
            let fieldsValidator = this.#buildFieldsValidatorOfOneInstance(fieldElements, constraintName);
            this.fieldsValidators = [...this.fieldsValidators, ...fieldsValidator];
        }
    }

    #buildFieldsValidatorOfOneInstance(fieldElements: JQuery<HTMLElement> | JQuery<HTMLElement>[], constraint: Constraint | string | undefined): FieldValidator[]
    {
        let constraintSearched: Constraint | undefined = this.#searchConstraint(constraint);
        if (typeof constraintSearched === 'undefined') return [];
        let fieldValidator: FieldValidator[] = [];
        if (Array.isArray(fieldElements)) {
            for (let i = 0; i < fieldElements.length; i++) {
                let x = this.#buildOneFieldValidatorOfOneInstance(fieldElements[i], constraintSearched);
                if (typeof x === 'undefined') continue;
                fieldValidator.push(x);
            }
        }
        else{
            let x = this.#buildOneFieldValidatorOfOneInstance(fieldElements, constraintSearched);
            if (typeof x === 'undefined') return fieldValidator;
            fieldValidator.push(x);
        }
        return fieldValidator;
    }

    #buildOneFieldValidatorOfOneInstance(fieldElement: JQuery<HTMLElement>, constraintSearched: Constraint): FieldValidator | undefined
    {
        let attr = fieldElement.attr('data-validator-key');
        if (attr === 'ignore' || constraintSearched === 'ignore') return undefined;
        let assignedConstraint: Constraint | undefined = (attr && attr !== "") ? this.#searchConstraint(attr) : constraintSearched;
        if (typeof assignedConstraint === 'undefined') return undefined;
        assignedConstraint = {...assignedConstraint};
        //generate random number from 10000 to 99999 to add to prefix "fieldValidator_"
        let random = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
        let fieldValidatorName = `fieldValidator_${random}`;
        assignedConstraint.name = fieldValidatorName;
        return {
            field: fieldElement,
            constraint: assignedConstraint,
            name: fieldValidatorName
        };
    }

    #searchConstraint(constraintSearch: Constraint | string | undefined): Constraint | undefined
    {
        if (typeof constraintSearch !== 'undefined' && typeof constraintSearch !== 'string') {
            return constraintSearch;
        }
        let constraint = this.formValidator.constraints?.find((constraint: Constraint) => constraint.name === constraintSearch);
        if (typeof constraint === 'undefined' || constraint === null) {
            constraint = this.formValidator.constraints?.find((constraint: Constraint) => constraint.name === 'required');
        }
        return constraint;
    }

    #prepareRenderer() {
        this.formValidator.inputMessageRenderer = {...defaultInputMessageRenderer, ...this.formValidator.options.inputMessageRenderer};
    }
}

export const defaultInputMessageRenderer: InputMessageRenderer = {
    buildMessage: (_messageRenderer: InputMessageRenderer, _message: InputMessage, messageData: DefaultMessageData) : JQuery<HTMLElement> => {
        return $("<p class='validator-message text-"+messageData.status+"'>"+messageData.message+"</p>");
    },
    renderMessages: (messageRenderer: InputMessageRenderer, message: InputMessage, messagesData: DefaultMessageData[]) => {
        let formGroup = message.targetElement.parent(".form-group")??message.targetElement.parent();
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
    removeMessages: (_messageRenderer: InputMessageRenderer, message: InputMessage) => {
        let formGroup = message.targetElement.parent(".form-group")??message.targetElement.parent();
        formGroup.find('.is-invalid').removeClass('is-invalid');
        formGroup.find('.is-valid').removeClass('is-valid');
        formGroup.find('.validator-messages-parent .validator-message').each(function (_index, element) {
            $(element).remove();
        });
    },
    affectInput: (_messageRenderer: InputMessageRenderer, message: InputMessage, messageData: DefaultMessageData[]) => {
        let firstMessageData = messageData[0];
        if (firstMessageData.status === MessageStatus.SUCCESS) {
            message.targetElement.addClass('is-valid');
        }
        else if (firstMessageData.status === MessageStatus.DANGER) {
            message.targetElement.addClass('is-invalid');
        }
    }
};

function fieldsAreVoid(fields: HtmlGeneralElement | HtmlGeneralElement[] | (() => HtmlGeneralElement[]) | undefined): fields is (() => HtmlGeneralElement[]) {
    return typeof fields === 'function';
}

function fieldsIsHtmlGeneralElement(value: HtmlGeneralElement | HtmlGeneralElement[] | (() => HtmlGeneralElement[]) | undefined): value is HtmlGeneralElement[] | HtmlGeneralElement {
    return typeof value !== 'undefined' && typeof value !== "function";
}