// noinspection JSUnusedGlobalSymbols
export class CaptchaHandler {
    constructor(formValidator, captchaOptions) {
        this.formValidator = formValidator;
        this.captchaOptions = captchaOptions;
    }
    init(ready) {
        ready();
    }
    triggerRequiredError() { }
}
export function isCaptchaOptions(object) {
    return typeof object === 'object' && "label" in object;
}
export const defaultCaptchaOptions = {
    label: 'easycaptchajs',
};
