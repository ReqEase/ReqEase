import {ResponseHandler} from "../../ResponseHandler";
import {Responses} from "../Responses";
import {getLabelFromReadyModal, ModalDataNeededOptions, ModalHandler} from "../../../../view/modal/ModalHandler";
import {ModalHandlerManager} from "../../../../view/modal/ModalHandlerManager";
import {ActionButtons} from "../../../../view/modal/ActionButtons";
import {isUndefinedOrNull} from "../../../../root/utils";
import {FormValidator} from "../../../../forms/FormValidator";
import ActionType = ActionButtons.Actions.ActionType;

export class DataNeededResponseHandler extends ResponseHandler {
    static label = "data_needed";
    response: Responses.DataNeeded.DataNeededResponse;
    modalHandler?: ReturnType<<T extends ModalHandler>() => T> | undefined;

    prepare() {
        let label = getLabelFromReadyModal(this.requester.requesterOptions.useReadyModal);
        this.modalHandler = ModalHandlerManager.createHandler(label, this.requester, {
            title: this.response?.title ?? this.requester?.requesterOptions?.strings?.response?.modals?.data_needed?.title??"",
            inputs: this.response?.neededData ?? [],
            message: this.response?.message ?? this.requester?.requesterOptions?.strings?.response?.modals?.data_needed?.message??"",
            color: this.response?.color,
            size: "large",
        } as ModalDataNeededOptions);
        let formValidator: FormValidator;
        this.modalHandler.modalCallbacks.onOpen = () => {
            formValidator = FormValidator.Builder({
                form: this.modalHandler.$modal.find('.form'),
            }).build();
        };
        this.modalHandler.modalCallbacks.onBeforeAction = (action: string, callback: () => void) => {
            if (action === ActionType.CONFIRM) {
                formValidator.validatorCallbacks.onSuccess = () => {
                    callback();
                };
                formValidator.validate();
            } else {
                callback();
            }
        };
        this.modalHandler.modalCallbacks.onAction = (action: string) => {
            if (action === ActionType.CONFIRM) {
                console.log(this.modalHandler, this.modalHandler.$modal);
                let newData: Record<string, any> = {};
                if (!isUndefinedOrNull(this.response.neededData)) {
                    for (let i = 0; i < this.response.neededData.length; i++) {
                        if (isUndefinedOrNull(this.response.neededData[i].name)) continue;
                        let inp = (this.modalHandler.$modal as JQuery).find('[name="' + this.response.neededData[i].name + '"]');
                        if (inp.length !== 0) {
                            if (inp.is('textarea')) {
                                newData[this.response.neededData[i].name] = inp.html();
                            } else {
                                newData[this.response.neededData[i].name] = inp.val();
                            }
                        }
                    }
                }
                this.requester.addParams(newData);
                this.requester.retry();
                console.log("confirmed & data added !");
            }
        };
    }

    renderResponse(): void {
        this.prepare();
        this.modalHandler.show();
    }
}