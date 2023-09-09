import {BaseCaptchaOptions} from "./BaseCaptchaOptions";
import {FormValidator} from "../../forms/FormValidator";

// noinspection JSUnusedGlobalSymbols
export class CaptchaHandler {
    captchaOptions: BaseCaptchaOptions;
    formValidator: FormValidator;
    static label: string;

    public constructor(formValidator: FormValidator, captchaOptions: BaseCaptchaOptions) {
        this.formValidator = formValidator;
        this.captchaOptions = captchaOptions;
    }

    init(ready: () => void): void {
        ready();
    }

    triggerRequiredError(): void {}
}

export interface CaptchaEnteredOptions extends BaseCaptchaOptions {
    label: string;
}

export function isCaptchaOptions(object: unknown): object is CaptchaEnteredOptions {
    return typeof object === 'object' && "label" in object;
}

export const defaultCaptchaOptions: CaptchaEnteredOptions = {
    label: 'easycaptchajs',
}