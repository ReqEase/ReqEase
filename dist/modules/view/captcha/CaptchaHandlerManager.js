export class CaptchaHandlerManager {
    // Register a modal handler with a label
    static registerHandler(handler) {
        CaptchaHandlerManager.handlers[handler.label] = handler;
    }
    static createHandler(label, formValidator, options) {
        const handlerClass = CaptchaHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Captcha handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(formValidator, options);
    }
}
CaptchaHandlerManager.handlers = {};
