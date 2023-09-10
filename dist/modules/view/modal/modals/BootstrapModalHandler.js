import { ModalHandler } from '../ModalHandler';
import { colorIsColor, colorIsColorState } from "../../ViewUtils";
import { isUndefinedOrNull } from "../../../root/utils";
import { ActionButtons } from "../ActionButtons";
var ActionType = ActionButtons.Actions.ActionType;
var Actions = ActionButtons.Actions;
export class BootstrapModalHandler extends ModalHandler {
    constructor(requester, options) {
        super(requester, options);
        this.retry = () => { };
    }
    show() {
        let cl = this;
        this.$modal.on('shown.bs.modal', function () {
            cl.modalCallbacks.onOpen();
        });
        this.$modal.modal('show');
    }
    close() {
        this.$modal.modal('hide');
        this.modalCallbacks.onClose();
    }
    buildLoadingModal(options) {
        var _a;
        this.$modal = $(`
            <div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="d-flex justify-content-center align-items-center pt-3 pb-3">
                            <div class="spinner-border text-primary" role="status"></div>
                            <p class="ml-2 mb-0">${(_a = options.loadingMessage) !== null && _a !== void 0 ? _a : "Please wait..."}</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
    buildProgressModal(_option) { }
    buildMessageModal(options) {
        var _a, _b, _c, _d, _e, _f, _g;
        let icon = this.buildIcon();
        let buttonsStr = "";
        let buttons = [];
        if (!isUndefinedOrNull(options.buttons)) {
            for (let i = 0; i < options.buttons.length; i++) {
                buttons.push(this.buildButtonAction(options.buttons[i]));
            }
        }
        for (let i = 0; i < buttons.length; i++) {
            let color = "";
            if (isUndefinedOrNull(buttons[i].color)) {
                buttonsStr += `<button type="button" class="btn-primary" id="${(_a = buttons[i].id) !== null && _a !== void 0 ? _a : ''}">${(_b = buttons[i].text) !== null && _b !== void 0 ? _b : 'action'}</button>`;
            }
            else {
                let btnColor = buttons[i].color;
                if (colorIsColor(btnColor)) {
                    if (btnColor !== "") {
                        color = `background-color: ${btnColor};`;
                    }
                    buttonsStr += `<button type="button" class="btn" style="${color}" id="${(_c = buttons[i].id) !== null && _c !== void 0 ? _c : ''}">${(_d = buttons[i].text) !== null && _d !== void 0 ? _d : 'action'}</button>`;
                }
                else if (colorIsColorState(btnColor)) {
                    if (btnColor !== "") {
                        color = ` btn-${getBootstrapClassColorFromColor(btnColor)}`;
                    }
                    buttonsStr += `<button type="button" class="btn${color}" id="${(_e = buttons[i].id) !== null && _e !== void 0 ? _e : ''}">${(_f = buttons[i].text) !== null && _f !== void 0 ? _f : 'action'}</button>`;
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
            header = `<div class="modal-header"><div class="row"><h5 class="modal-title">${icon !== null && icon !== void 0 ? icon : ""}${(_g = options.title) !== null && _g !== void 0 ? _g : ""}</h5><div class="col-10"></div>`;
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
            this.$modal.find('#' + buttons[i].id).on('click', () => {
                var _a;
                cl.modalCallbacks.onBeforeAction((_a = buttons[i].actionType) !== null && _a !== void 0 ? _a : "unknown", () => {
                    var _a;
                    if (buttons[i].action(cl.$modal)) {
                        cl.$modal.modal('hide');
                    }
                    cl.modalCallbacks.onAction((_a = buttons[i].actionType) !== null && _a !== void 0 ? _a : "unknown");
                });
            });
        }
    }
    buildConfirmationModal(_options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        // create a ModalMessageOptions object from ModalConfirmationOptions with buttons yes / no and return after that buildMessageModal
        let options = {
            title: "",
            content: (_g = (_a = _options.confirmationMessage) !== null && _a !== void 0 ? _a : (_f = (_e = (_d = (_c = (_b = this.requester) === null || _b === void 0 ? void 0 : _b.requesterOptions) === null || _c === void 0 ? void 0 : _c.strings) === null || _d === void 0 ? void 0 : _d.response) === null || _e === void 0 ? void 0 : _e.modals) === null || _f === void 0 ? void 0 : _f.defaultConfirmationMsg) !== null && _g !== void 0 ? _g : "",
            buttons: [
                {
                    action: {
                        actionType: ActionType.CONFIRM,
                    },
                    text: (_m = (_l = (_k = (_j = (_h = this.requester) === null || _h === void 0 ? void 0 : _h.requesterOptions) === null || _j === void 0 ? void 0 : _j.strings) === null || _k === void 0 ? void 0 : _k.response) === null || _l === void 0 ? void 0 : _l.confirmButton) !== null && _m !== void 0 ? _m : "Confirm",
                    color: "info",
                },
                {
                    action: {
                        actionType: ActionType.CANCEL,
                    },
                    text: (_s = (_r = (_q = (_p = (_o = this.requester) === null || _o === void 0 ? void 0 : _o.requesterOptions) === null || _p === void 0 ? void 0 : _p.strings) === null || _q === void 0 ? void 0 : _q.response) === null || _r === void 0 ? void 0 : _r.cancelButton) !== null && _s !== void 0 ? _s : "Cancel",
                    color: "default",
                }
            ]
        };
        this.buildMessageModal(options);
    }
    buildButtonAction(button) {
        if (Actions.isCloseAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: () => {
                    return true;
                }
            };
        }
        else if (Actions.isRedirectAction(button.action)) {
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
            };
        }
        else if (Actions.isRefreshAction(button.action)) {
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
            };
        }
        else if (Actions.isCallFunctionAction(button.action)) {
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
                    if (typeof window[action.functionName] === 'function') {
                        window[action.functionName]();
                    }
                    else {
                        console.warn(`Function ${action.functionName} is not defined.`);
                    }
                    return true;
                }
            };
        }
        else if (Actions.isConfirmAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-confirm',
                action: () => {
                    return true;
                }
            };
        }
        else if (Actions.isCancelAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-cancel',
                action: () => {
                    return true;
                }
            };
        }
        else if (Actions.isRetryAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-retry',
                action: () => {
                    this.retry();
                    return true;
                }
            };
        }
    }
    modalIsShowed() {
        return this.$modal.hasClass('show');
    }
}
BootstrapModalHandler.label = 'bootstrap';
function getBootstrapClassColorFromColor(color) {
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
