export class ModalHandlerManager {
    // Register a modal handler with a label
    static registerHandler(handler) {
        ModalHandlerManager.handlers[handler.label] = handler;
    }
    static createHandler(label, requester, options) {
        const handlerClass = ModalHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Modal handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(requester, options);
    }
}
ModalHandlerManager.handlers = {};
