import { getSizeFromType, isModalSize, ResponseHandler } from "../../ResponseHandler";
import { getLabelFromReadyModal } from "../../../../view/modal/ModalHandler";
import { ModalHandlerManager } from "../../../../view/modal/ModalHandlerManager";
import { FormMessage } from "../../../../view/messages/FormMessage";
import { ToastMessage } from "../../../../view/messages/ToastMessage";
import { isUndefinedOrNull } from "../../../../root/utils";
export class MessageResponseHandler extends ResponseHandler {
    constructor() {
        super(...arguments);
        this.message = null;
        this.retry = () => { };
    }
    prepare() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (isModalSize(this.response.type)) {
            let label = getLabelFromReadyModal(this.requester.requesterOptions.useReadyModal);
            this.modalHandler = ModalHandlerManager.createHandler(label, this.requester, {
                title: (_c = (_b = (_a = this.response) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.title) !== null && _c !== void 0 ? _c : "",
                content: (_f = (_e = (_d = this.response) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.body) !== null && _f !== void 0 ? _f : "",
                buttons: (_h = (_g = this.response) === null || _g === void 0 ? void 0 : _g.buttons) !== null && _h !== void 0 ? _h : [],
                color: (_k = (_j = this.response) === null || _j === void 0 ? void 0 : _j.color) !== null && _k !== void 0 ? _k : "primary",
                size: getSizeFromType(this.response.type),
            });
            this.modalHandler.retry = this.retry;
        }
        else {
            if (this.response.type === "msg-in-form") {
                let message = (this.response.content.title !== '' ? '<b>' + this.response.content.title + '</b>: ' : '') + this.response.content.body;
                this.message = new FormMessage([
                    {
                        message: message,
                        status: this.response.color,
                        buttons: this.response.buttons
                    }
                ], this.requester.httpResponse.httpResponseOptions.formMessageRenderer, this.requester.requesterOptions.form);
            }
            else if (this.response.type === "msg-in-toast") {
                this.message = new ToastMessage([
                    {
                        message: this.response.content.body,
                        status: this.response.color,
                    }
                ], this.requester.httpResponse.httpResponseOptions.toastMessageRenderer);
            }
            else {
                console.error("Unknown response type ('" + this.response.type + "')");
            }
        }
    }
    renderResponse() {
        this.prepare();
        if (isModalSize(this.response.type)) {
            this.modalHandler.show();
        }
        else {
            if (!isUndefinedOrNull(this.message)) {
                this.message.show();
            }
        }
    }
}
MessageResponseHandler.label = "message";
