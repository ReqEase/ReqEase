import { ModalHandlerManager } from "../ModalHandlerManager";
import { JConfirmModalHandler } from "./JConfirmModalHandler";
import { BootstrapModalHandler } from "./BootstrapModalHandler";
export function collectModalHandlers(modalHandlersToRegister = null) {
    if (modalHandlersToRegister !== null) {
        for (let i = 0; i < modalHandlersToRegister.length; i++) {
            ModalHandlerManager.registerHandler(modalHandlersToRegister[i]);
        }
    }
    else {
        ModalHandlerManager.registerHandler(JConfirmModalHandler);
        ModalHandlerManager.registerHandler(BootstrapModalHandler);
    }
    console.log("modalHandlers", ModalHandlerManager.handlers);
}
