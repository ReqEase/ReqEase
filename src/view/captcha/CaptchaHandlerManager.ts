import {CaptchaHandler} from "./CaptchaHandler";
import {BaseCaptchaOptions} from "./BaseCaptchaOptions";
import {FormValidator} from "../../forms/FormValidator";

export class CaptchaHandlerManager {
    public static handlers: Record<string, typeof CaptchaHandler> = {};

    // Register a modal handler with a label
    static registerHandler<T extends typeof CaptchaHandler>(handler: T) {
        CaptchaHandlerManager.handlers[handler.label] = handler;
    }

    static createHandler<T extends keyof typeof CaptchaHandlerManager.handlers>(label: T, formValidator: FormValidator, options: BaseCaptchaOptions)
    {
        const handlerClass = CaptchaHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Captcha handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(formValidator, options);
    }
}