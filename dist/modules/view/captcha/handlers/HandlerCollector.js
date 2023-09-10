import { CaptchaHandlerManager } from "../CaptchaHandlerManager";
import { GoogleRecaptchaHandler } from "./GoogleRecaptchaHandler";
export function collectCaptchaHandlers(captchaHandlersToRegister = null) {
    if (captchaHandlersToRegister !== null) {
        for (let i = 0; i < captchaHandlersToRegister.length; i++) {
            CaptchaHandlerManager.registerHandler(captchaHandlersToRegister[i]);
        }
    }
    else {
        CaptchaHandlerManager.registerHandler(GoogleRecaptchaHandler);
    }
    console.log("captchaHandlers", CaptchaHandlerManager.handlers);
}
