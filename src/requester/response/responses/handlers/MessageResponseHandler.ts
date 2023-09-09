import {getSizeFromType, isModalSize, ResponseHandler} from "../../ResponseHandler";
import {Responses} from "../Responses";
import {getLabelFromReadyModal, ModalHandler, ModalMessageOptions} from "../../../../view/modal/ModalHandler";
import {ModalHandlerManager} from "../../../../view/modal/ModalHandlerManager";
import {FormMessage} from "../../../../view/messages/FormMessage";
import {ToastMessage} from "../../../../view/messages/ToastMessage";
import {isUndefinedOrNull} from "../../../../root/utils";

export class MessageResponseHandler extends ResponseHandler {
    static label = "message";
    response: Responses.Message.MessageResponse;
    modalHandler?: ReturnType<<T extends ModalHandler>() => T> | undefined;
    message: ToastMessage | FormMessage = null;
    retry: () => void = () => {};

    prepare() {
        if (isModalSize(this.response.type)) {
            let label = getLabelFromReadyModal(this.requester.requesterOptions.useReadyModal);
            this.modalHandler = ModalHandlerManager.createHandler(label, this.requester, {
                title: this.response?.content?.title ?? "",
                content: this.response?.content?.body ?? "",
                buttons: this.response?.buttons ?? [],
                color: this.response?.color ?? "primary",
                size: getSizeFromType(this.response.type),
            } as ModalMessageOptions);
            this.modalHandler.retry = this.retry;
        }
        else{
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
            else{
                console.error("Unknown response type ('" + this.response.type + "')");
            }
        }
    }

    renderResponse(): void {
        this.prepare();
        if (isModalSize(this.response.type)) {
            this.modalHandler.show();
        }
        else{
            if (!isUndefinedOrNull(this.message)) {
                this.message.show();
            }
        }
    }
}