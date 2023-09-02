import {
    ModalButton,
    ModalConfirmationOptions,
    ModalHandler,
    ModalLoadingOptions,
    ModalMessageOptions,
    ModalOptions,
    ModalProgressOptions
} from '../ModalHandler';
import {Color, colorIsColor, colorIsColorState, ColorState} from "../../ViewUtils";
import {isUndefinedOrNull} from "../../../root/utils";
import {ActionButtons} from "../ActionButtons";
import ActionType = ActionButtons.Actions.ActionType;
import Actions = ActionButtons.Actions;
import {Requester} from "../../../requester/Requester";

export class BootstrapModalHandler extends ModalHandler {
    static label: string = 'bootstrap';
    retry: () => void = () => {};

    constructor(requester: Requester, options: ModalOptions) {
        super(requester, options);
    }

    show(): void {
        let cl = this;
        this.$modal.on('shown.bs.modal', function () {
            cl.modalCallbacks.onOpen();
        })
        this.$modal.modal('show');
    }

    close(): void {
        this.$modal.modal('hide');
        this.modalCallbacks.onClose();
    }

    protected buildLoadingModal(options: ModalLoadingOptions) {
        this.$modal = $( `
            <div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="d-flex justify-content-center align-items-center pt-3 pb-3">
                            <div class="spinner-border text-primary" role="status"></div>
                            <p class="ml-2 mb-0">${options.loadingMessage??"Please wait..."}</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    protected buildProgressModal(_option: ModalProgressOptions) {}

    protected buildMessageModal(options: ModalMessageOptions) {
        let icon = this.buildIcon();
        let buttonsStr: string = "";
        let buttons: Button[] = [];
        if (!isUndefinedOrNull(options.buttons)) {
            for (let i = 0; i < options.buttons.length; i++) {
                buttons.push(this.buildButtonAction(options.buttons[i]));
            }
        }
        for (let i = 0; i < buttons.length; i++) {
            let color = "";
            if (isUndefinedOrNull(buttons[i].color)) {
                buttonsStr += `<button type="button" class="btn-primary" id="${buttons[i].id??''}">${buttons[i].text??'action'}</button>`;
            }
            else {
                let btnColor: ColorState | Color = buttons[i].color;
                if (colorIsColor(btnColor)) {
                    if (btnColor !== "") {
                        color = `background-color: ${btnColor};`;
                    }
                    buttonsStr += `<button type="button" class="btn" style="${color}" id="${buttons[i].id??''}">${buttons[i].text??'action'}</button>`;
                } else if (colorIsColorState(btnColor)) {
                    if (btnColor !== "") {
                        color = ` btn-${getBootstrapClassColorFromColor(btnColor)}`;
                    }
                    buttonsStr += `<button type="button" class="btn${color}" id="${buttons[i].id??''}">${buttons[i].text??'action'}</button>`;
                }
            }
        }

        let content = options.content;
        if (!isUndefinedOrNull(content) && content !== "") {
            content = '<div class="modal-body">' + content + '</div>';
        }

        //same thing with buttonsStr
        if (buttonsStr !== "") {
            buttonsStr = '<div class="modal-footer">' + buttonsStr + '</div>';
        }

        let header = "";
        if (icon !== "" || options.title !== "") {
            header = `<div class="modal-header"><div class="row"><h5 class="modal-title">${icon??""}${options.title??""}</h5><div class="col-10"></div>`;
        }

        this.$modal = $(`
            <div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        ${header}
                        ${content}
                        ${buttonsStr}
                    </div>
                </div>
            </div>
        `);



        this.$modal.find('.close').on('click', () => {
            this.$modal.modal('hide');
        });

        let cl = this;
        for (let i = 0; i < buttons.length; i++) {
            this.$modal.find('#'+buttons[i].id).on('click', () => {
                cl.modalCallbacks.onBeforeAction(buttons[i].actionType??"unknown", () => {
                    if (buttons[i].action(cl.$modal)) {
                        cl.$modal.modal('hide');
                    }
                    cl.modalCallbacks.onAction(buttons[i].actionType??"unknown");
                });
            });
        }
    }

    protected buildConfirmationModal(_options: ModalConfirmationOptions) {
        // create a ModalMessageOptions object from ModalConfirmationOptions with buttons yes / no and return after that buildMessageModal
        let options: ModalMessageOptions = {
            title: "",
            content: _options.confirmationMessage??this.requester?.requesterOptions?.strings?.response?.modals?.defaultConfirmationMsg??"",
            buttons: [
                {
                    action: {
                        actionType: ActionType.CONFIRM,
                    },
                    text: this.requester?.requesterOptions?.strings?.response?.confirmButton??"Confirm",
                    color: "info",
                },
                {
                    action: {
                        actionType: ActionType.CANCEL,
                    },
                    text: this.requester?.requesterOptions?.strings?.response?.cancelButton??"Cancel",
                    color: "default",
                }
            ]
        };
        this.buildMessageModal(options);
    }

    buildButtonAction(button: ModalButton): Button {
        if (Actions.isCloseAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: () => {
                    return true;
                }
            }
        } else if (Actions.isRedirectAction(button.action)) {
            let action = button.action;
            let cl = this;
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: ($modal) => {
                    $modal.find('.modal-footer .btn').prop('disabled', true);
                    $(this).html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                    window.location.href = action.url;
                    return false;
                }
            }
        } else if (Actions.isRefreshAction(button.action)) {
            let cl = this;
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: ($modal) => {
                    $modal.find('.modal-footer .btn').prop('disabled', true);
                    $(this).html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                    window.location.reload();
                    return false;
                }
            }
        } else if (Actions.isCallFunctionAction(button.action)) {
            let action = button.action;
            let cl = this;
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: ($modal) => {
                    $modal.find('.modal-footer .btn').prop('disabled', true);
                    $(this).html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                    if (typeof (window as any)[action.functionName] === 'function') {
                        (window as any)[action.functionName]();
                    } else {
                        console.warn(`Function ${action.functionName} is not defined.`);
                    }
                    return true;
                }
            };
        } else if (Actions.isConfirmAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-confirm',
                action: () => {
                    return true;
                }
            };
        } else if (Actions.isCancelAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-cancel',
                action: () => {
                    return true;
                }
            }
        } else if (Actions.isRetryAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-retry',
                action: () => {
                    this.retry();
                    return true;
                }
            }
        }
    }

    modalIsShowed(): boolean {
        return this.$modal.hasClass('show');
    }
}

interface Button extends Omit<ModalButton, "action"> {
    actionType?: string;
    id: string;
    action: ($modal: JQuery) => boolean;
}

function getBootstrapClassColorFromColor(color: ColorState) {
    switch (color) {
        case "success":
        case "warning":
            return color;
        case "error":
            return "danger";
        case "info":
        case "default":
            return "primary";
    }
}