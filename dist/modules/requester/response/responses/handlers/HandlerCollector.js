import { ResponseHandlerManager } from "../ResponseHandlerManager";
import { MessageResponseHandler } from "./MessageResponseHandler";
import { FieldsValidationResponseHandler } from "./FieldsValidationResponseHandler";
export function collectResponseHandlers(responseHandlersToRegister = null) {
    if (responseHandlersToRegister !== null) {
        for (let i = 0; i < responseHandlersToRegister.length; i++) {
            ResponseHandlerManager.registerHandler(responseHandlersToRegister[i]);
        }
    }
    else {
        ResponseHandlerManager.registerHandler(MessageResponseHandler);
        ResponseHandlerManager.registerHandler(FieldsValidationResponseHandler);
        //ResponseHandlerManager.registerHandler(DataNeededResponseHandler);
    }
}
