export var Messages;
(function (Messages) {
    class DefaultMessage {
        constructor(messageData, messageRenderer) {
            this.messageData = messageData;
            this.messageRenderer = messageRenderer;
        }
    }
    Messages.DefaultMessage = DefaultMessage;
    // noinspection JSUnusedGlobalSymbols
    let MessageStatus;
    (function (MessageStatus) {
        MessageStatus["SUCCESS"] = "success";
        MessageStatus["DANGER"] = "danger";
        MessageStatus["WARNING"] = "warning";
        MessageStatus["INFO"] = "info";
    })(MessageStatus = Messages.MessageStatus || (Messages.MessageStatus = {}));
})(Messages || (Messages = {}));
