import {Color} from "./ViewUtils";

export namespace Messages {
    export abstract class DefaultMessage<
        MessageData extends DefaultMessageData,
        MessageRenderer extends DefaultMessageRenderer<MessageData, any>
    >{
        messageData: MessageData[]
        messageRenderer: MessageRenderer
        protected constructor(messageData: MessageData[], messageRenderer: MessageRenderer){
            this.messageData = messageData;
            this.messageRenderer = messageRenderer;
        }

        abstract show(): void;

        abstract destroy(): void;
    }
    export interface DefaultMessageRenderer<MessageData extends DefaultMessageData, Message extends DefaultMessage<MessageData, any>> {
        buildMessage: (messageRenderer: this, message: Message, messageData: MessageData) => JQuery<HTMLElement>;
        renderMessages: (messageRenderer: this, message: Message, messagesData: MessageData[]) => void;
        removeMessages: (messageRenderer: this, message: Message) => void;
    }
    export interface DefaultMessageData {
        status: MessageStatus | Color;
        message: string;
    }

    // noinspection JSUnusedGlobalSymbols
    export enum MessageStatus{
        SUCCESS = "success",
        DANGER = "danger",
        WARNING = "warning",
        INFO = "info"
    }
}