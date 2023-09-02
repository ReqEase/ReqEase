import {Messages} from "../Messages";
import DefaultMessage = Messages.DefaultMessage;
import DefaultMessageData = Messages.DefaultMessageData;
import DefaultMessageRenderer = Messages.DefaultMessageRenderer;

export class InputMessage extends DefaultMessage<DefaultMessageData, InputMessageRenderer>{
    private _targetElement: JQuery<HTMLElement>;
    private eventListener:  JQuery.TypeEventHandler<Element, undefined, Element, HTMLElement, "input">;
    constructor(messageData: DefaultMessageData[], messageRenderer: InputMessageRenderer){
        super(messageData, messageRenderer);
    }

    set targetElement(value: JQuery<HTMLElement>) {
        this._targetElement = value;
    }

    get targetElement(): JQuery<HTMLElement> {
        return this._targetElement;
    }

    show(): void {
        this.messageRenderer.renderMessages(this.messageRenderer, this, this.messageData);
        this.eventListener = () => {
            this.destroy();
        };
        this.targetElement.on("input", this.eventListener);
        this.messageRenderer.affectInput(this.messageRenderer, this, this.messageData);
    }

    destroy(): void {
        if (typeof this.eventListener !== 'undefined') {
            this.targetElement.off("input", this.eventListener);
        }
        this.messageRenderer.removeMessages(this.messageRenderer, this);
    }
}

export interface InputMessageRenderer extends DefaultMessageRenderer<DefaultMessageData, InputMessage> {
    affectInput: (messageRenderer: this, message: InputMessage, messagesData: DefaultMessageData[]) => void;
}