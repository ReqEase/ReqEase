import {
    ModalButton, ModalConfirmationOptions, ModalDataNeededOptions,
    ModalHandler,
    ModalLoadingOptions,
    ModalMessageOptions,
    ModalOptions,
    ModalProgressOptions, ModalTheme, Size
} from '../ModalHandler';
import {Color, colorIsColor, ColorState} from "../../ViewUtils";
import {isUndefinedOrNull} from "../../../root/utils";
import {ActionButtons} from "../ActionButtons";
import Actions = ActionButtons.Actions;
import {Requester} from "../../../requester/Requester";

declare var $: any; // Assuming you've included jQuery and jConfirm properly

export class JConfirmModalHandler extends ModalHandler {
    static label: string = 'jquery-confirm';
    jconfirmOptions: Record<string, any>;
    $jconfirmModal: any;
    retry: () => void = () => {};

    constructor(requester: Requester, options: ModalOptions) {
        super(requester, options);
    }

    show(): void {
        let cl = this;
        // noinspection TypeScriptValidateJSTypes
        $.confirm({
            ...{
                ...{
                    scrollToPreviousElement: false,
                    scrollToPreviousElementAnimate: false,
                    closeIcon: false,
                    typeAnimated: true,
                },
                ...this.jconfirmOptions
            },
            ...{
                onOpen: function () {
                    cl.$jconfirmModal = this;
                    // noinspection JSUnresolvedReference
                    cl.$modal = cl.$jconfirmModal.$el;
                    cl.modalCallbacks.onOpen();
                },
                onClose: function () {
                    cl.modalCallbacks.onClose();
                }
            }
        });
    }

    close(): void {
        this.$jconfirmModal.close();
    }

    modalIsShowed(): boolean {
        // noinspection JSUnresolvedReference
        return this.$jconfirmModal.isOpen();
    }

    protected buildLoadingModal(options: ModalLoadingOptions) {
        this.jconfirmOptions = {
            icon: 'fa fa-spinner fa-spin',
            title: 'Loading',
            theme: getJConfirmTheme(options.theme),
            content: options.loadingMessage,
            buttons: '',
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        }
    }

    protected buildProgressModal(_options: ModalProgressOptions) {}

    protected buildMessageModal(options: ModalMessageOptions) {
        this.jconfirmOptions = {
            icon: this.buildIcon(),
            title: options.title,
            theme: getJConfirmTheme(options.theme),
            content: options.content,
            buttons: this.buildButtons(options.buttons),
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        }
    }

    protected buildConfirmationModal(options: ModalConfirmationOptions) {
        this.jconfirmOptions = {
            icon: this.buildIcon(),
            title: 'Confirmation',
            theme: getJConfirmTheme(options.theme),
            content: options.confirmationMessage??this.requester?.requesterOptions?.strings?.response?.modals?.defaultConfirmationMsg??"",
            buttons: this.buildButtons([
                {
                    action: {
                        actionType: Actions.ActionType.CONFIRM,
                    },
                    text: this.requester?.requesterOptions?.strings?.response?.confirmButton??"Confirm",
                    color: getJConfirmColorFromColor("info"),
                },
                {
                    action: {
                        actionType: Actions.ActionType.CANCEL,
                    },
                    text: this.requester?.requesterOptions?.strings?.response?.cancelButton??"Cancel",
                    color: getJConfirmColorFromColor("default"),
                }
            ]),
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        }
    }

    protected buildDataNeededModal(options: ModalDataNeededOptions) {
        //put in content a bootstrap form with inputs from options.inputs
        const inputs: string = options.inputs.map(input => `
            <div class="form-group">
                <label for="${input.name}">${input.label}</label>
                <input type="${input.type}" class="form-control" id="${input.name}" name="${input.name}">
            </div>
        `).join('');

        let msg = "";
        if (!isUndefinedOrNull(options.message)) msg = `<p>${options.message}</p>`;

        const content = `
            <div class="form pr-2 pl-2">
                ${msg}
                ${inputs}
            </div>
        `;
        this.jconfirmOptions = {
            icon: this.buildIcon(),
            title: options.title,
            theme: getJConfirmTheme(options.theme),
            content: content,
            buttons: this.buildButtons([
                {
                    action: {
                        actionType: Actions.ActionType.CONFIRM,
                    },
                    text: "Confirm",
                    color: options.color??"default",
                },
                {
                    action: {
                        actionType: Actions.ActionType.CANCEL,
                    },
                    text: "Cancel",
                    color: "default",
                }
            ]),
            type: getJConfirmColorFromColor(options.color, "blue"),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        }
    }

    // noinspection JSUnresolvedReference
    buildButtonAction(button: ModalButton): ButtonAction {
        if (Actions.isCloseAction(button.action)) {
            return () => {
                return true;
            }
        } else if (Actions.isRedirectAction(button.action)) {
            let action = button.action;
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                window.location.href = action.url;
                return false;
            }
        } else if (Actions.isRefreshAction(button.action)) {
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                window.location.reload();
                return false;
            }
        } else if (Actions.isCallFunctionAction(button.action)) {
            let action = button.action;
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                if (typeof (window as any)[action.functionName] === 'function') {
                    (window as any)[action.functionName]();
                }
                else{
                    console.warn(`Function ${action.functionName} is not defined.`);
                }
                return true;
            }
        } else if (Actions.isConfirmAction(button.action)) {
            return () => {
                return true;
            }
        } else if (Actions.isCancelAction(button.action)) {
            return () => {
                return true;
            }
        } else if (Actions.isRetryAction(button.action)) {
            return () => {
                this.retry();
                return true;
            }
        }
    }

    buildButtons(buttons_: ActionButtons.ActionButton[]): any {
        let buttons: Record<string, Record<string, any>> = {};
        for (let i = 0; i < buttons_.length; i++) {
            let button = buttons_[i];
            let cl = this;
            buttons[button.text] = {
                text: button.text,
                btnClass: 'btn-' + getJConfirmColorFromColor(button.color),
                action: function () {
                    cl.modalCallbacks.onBeforeAction(button.action.actionType, () => {
                        let ac = cl.buildButtonAction(button);
                        let close = true;
                        if (!isUndefinedOrNull(ac)) { // noinspection JSUnresolvedReference
                            close = ac(cl.$jconfirmModal, cl.$jconfirmModal.buttons[button.text].el);
                        }
                        if (close) cl.$jconfirmModal.close();
                        cl.modalCallbacks.onAction(button.action.actionType);
                    });
                    return false;
                }
            }
        }
        return buttons;
    }
}

function getJConfirmColorFromColor(color: ColorState | Color, defaultColor: string = "default") {
    if (isUndefinedOrNull(color) || colorIsColor(color)) {
        return "blue";
    }
    else{
        switch (color) {
            case "success":
                return "green";
            case "error":
                return "red";
            case "warning":
                return "orange";
            case "info":
                return "blue";
            case "default":
            default:
                return defaultColor;
        }
    }
}

function getJConfirmTheme(theme: ModalTheme) {
    if (isUndefinedOrNull(theme)) return 'light';
    if (['dark', 'supervan', 'modern', 'material', 'bootstrap', 'light'].includes(theme)) return theme;
    return 'light';
}

function getJConfirmColumnClassFromSize(size: Size) {
    if (isUndefinedOrNull(size)) return 'medium';
    if (['', 'small', 'medium', 'large', 'xlarge'].includes(size)) return size as string;
    return 'medium';
}

type ButtonAction = (modal: any, btn: JQuery) => boolean;