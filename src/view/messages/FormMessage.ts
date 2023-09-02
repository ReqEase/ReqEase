import {Messages} from "../Messages";
import {ActionButtons} from "../modal/ActionButtons";
import ActionButton = ActionButtons.ActionButton;
import DefaultMessageRenderer = Messages.DefaultMessageRenderer;
import DefaultMessageData = Messages.DefaultMessageData;
import DefaultMessage = Messages.DefaultMessage;
import {isUndefinedOrNull} from "../../root/utils";

export class FormMessage extends DefaultMessage<FormMessageData, FormMessageRenderer>{

    form: JQuery<HTMLElement>

    constructor(messageData: FormMessageData[], messageRenderer: FormMessageRenderer, form: JQuery<HTMLElement>) {
        super(messageData, messageRenderer);
        this.form = form;
    }

    destroy(): void {
        this.messageRenderer.removeMessages(this.messageRenderer, this);
    }

    show(): void {
        this.messageRenderer.renderMessages(this.messageRenderer, this, this.messageData);
    }

}

export interface FormMessageData extends DefaultMessageData{
    buttons?: ActionButton[];
}

export interface FormMessageRenderer extends DefaultMessageRenderer<FormMessageData, FormMessage>{}

export const defaultFormMessageRenderer: FormMessageRenderer = {
    buildMessage: (_messageRenderer: FormMessageRenderer, _message: FormMessage, messageData: FormMessageData) : JQuery<HTMLElement> => {
        let buttons = "";
        if (!isUndefinedOrNull(messageData.buttons)) {
            for (let button of messageData.buttons) {
                buttons += `<button class="btn btn-sm btn-outline-${button.color??messageData.status}" type="button">${button.text}</button>`;
            }
        }
        if (buttons !== "") {
            buttons = `<hr><div class="buttons mt-3 mb-2">${buttons}</div>`;
        }
        let hideIcon = '<button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
            '    <span aria-hidden="true">&times;</span>\n' +
            '  </button>';
        return $("<div class='form-message alert alert-" + messageData.status + " alert-dismissible fade show'>"+ hideIcon + messageData.message + buttons + "</div>");
    },
    renderMessages: (messageRenderer: FormMessageRenderer, message: FormMessage, messagesData: FormMessageData[]) => {
        if (isUndefinedOrNull(message.form)) {
            console.error("FormMessageRenderer: form is undefined");
            return;
        }
        let form = message.form;
        let messages = form.find(".form-messages-parent");
        if (isUndefinedOrNull(messages) || messages.length === 0) {
            let messages_tmp = $('<div class="form-messages-parent"></div>');
            let okBtn = form.find('.btn').last();
            if (okBtn.length === 0) {
                okBtn = form.find('button[type="submit"]').last();
            }
            if (okBtn.parent().hasClass('form-group')) {
                okBtn = okBtn.parent();
            }
            messages_tmp.insertBefore(okBtn);
            messages = messages_tmp;
        }

        messageRenderer.removeMessages(messageRenderer, message);

        for (let messageData of messagesData) {
            let messageElement = messageRenderer.buildMessage(messageRenderer, message, messageData);
            messageElement.appendTo(messages);
        }
    },
    removeMessages: (_messageRenderer: FormMessageRenderer, message: FormMessage) => {
        message.form.find('.form-messages-parent .form-message').each(function (_index, element) {
            $(element).remove();
        });
    }
};