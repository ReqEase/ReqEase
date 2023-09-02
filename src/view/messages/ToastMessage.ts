import {Messages} from "../Messages";
import DefaultMessageRenderer = Messages.DefaultMessageRenderer;
import DefaultMessageData = Messages.DefaultMessageData;
import DefaultMessage = Messages.DefaultMessage;
import {isUndefinedOrNull} from "../../root/utils";

export class ToastMessage extends DefaultMessage<ToastMessageData, ToastMessageRenderer>{

    constructor(messageData: ToastMessageData[], messageRenderer: ToastMessageRenderer) {
        super(messageData, messageRenderer);
    }

    destroy(): void {}

    show(): void {
        this.messageRenderer.renderMessages(this.messageRenderer, this, this.messageData);
    }

}

export interface ToastMessageData extends DefaultMessageData{}

export interface ToastMessageRenderer extends DefaultMessageRenderer<ToastMessageData, ToastMessage>{}

export const defaultToastMessageRenderer: ToastMessageRenderer = {
    buildMessage: (_messageRenderer: ToastMessageRenderer, _message: ToastMessage, messageData: ToastMessageData) : JQuery<HTMLElement> => {
        return $("<div class=\"toast\" role=\"alert\" aria-live=\"assertive\" aria-atomic=\"true\" data-autohide=\"false\"><div class=\"toast-header\">\n" +
            "    <button type=\"button\" class=\"ml-2 mb-1 close\" data-dismiss=\"toast\" aria-label=\"Close\">\n" +
            "      <span aria-hidden=\"true\">&times;</span>\n" +
            "    </button>\n" +
            "  </div><div class=\"toast-body\">" + messageData.message + "</div></div>");
    },
    renderMessages: (messageRenderer: ToastMessageRenderer, message: ToastMessage, messagesData: ToastMessageData[]) => {
        let messages = $('body').find(".form-messages-parent");
        if (isUndefinedOrNull(messages) || messages.length === 0) {
            let messages_tmp = $('<div style="position: fixed; bottom: 0; right: 0;" class="pr-4 pb-4"></div>');
            messages_tmp.appendTo('body');
            messages = messages_tmp;
        }

        for (let messageData of messagesData) {
            let messageElement = messageRenderer.buildMessage(messageRenderer, message, messageData);
            messageElement.appendTo(messages).toast('show');
        }
    },
    removeMessages: (_messageRenderer: ToastMessageRenderer, _message: ToastMessage) => {}
};