import { Messages } from "../Messages";
var DefaultMessage = Messages.DefaultMessage;
export class InputMessage extends DefaultMessage {
    constructor(messageData, messageRenderer) {
        super(messageData, messageRenderer);
    }
    set targetElement(value) {
        this._targetElement = value;
    }
    get targetElement() {
        return this._targetElement;
    }
    show() {
        this.messageRenderer.renderMessages(this.messageRenderer, this, this.messageData);
        this.eventListener = () => {
            this.destroy();
        };
        this.targetElement.on("input", this.eventListener);
        this.messageRenderer.affectInput(this.messageRenderer, this, this.messageData);
    }
    destroy() {
        if (typeof this.eventListener !== 'undefined') {
            this.targetElement.off("input", this.eventListener);
        }
        this.messageRenderer.removeMessages(this.messageRenderer, this);
    }
}
