// Modal handler manager class
import {ModalHandler, ModalOptions} from "./ModalHandler";
import {Requester} from "../../requester/Requester";

export class ModalHandlerManager {
    public static handlers: Record<string, typeof ModalHandler> = {};

    // Register a modal handler with a label
    static registerHandler<T extends typeof ModalHandler>(handler: T) {
        ModalHandlerManager.handlers[handler.label] = handler;
    }

    static createHandler<T extends keyof typeof ModalHandlerManager.handlers>(label: T, requester: Requester, options: ModalOptions)
    {
        const handlerClass = ModalHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Modal handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(requester, options);
    }
}
