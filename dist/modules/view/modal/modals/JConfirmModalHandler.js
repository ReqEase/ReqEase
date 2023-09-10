import { ModalHandler } from '../ModalHandler';
import { colorIsColor } from "../../ViewUtils";
import { isUndefinedOrNull } from "../../../root/utils";
import { ActionButtons } from "../ActionButtons";
var Actions = ActionButtons.Actions;
export class JConfirmModalHandler extends ModalHandler {
    constructor(requester, options) {
        super(requester, options);
        this.retry = () => { };
    }
    show() {
        let cl = this;
        // noinspection TypeScriptValidateJSTypes
        $.confirm(Object.assign(Object.assign({}, Object.assign({
            scrollToPreviousElement: false,
            scrollToPreviousElementAnimate: false,
            closeIcon: false,
            typeAnimated: true,
        }, this.jconfirmOptions)), {
            onOpen: function () {
                cl.$jconfirmModal = this;
                // noinspection JSUnresolvedReference
                cl.$modal = cl.$jconfirmModal.$el;
                cl.modalCallbacks.onOpen();
            },
            onClose: function () {
                cl.modalCallbacks.onClose();
            }
        }));
    }
    close() {
        this.$jconfirmModal.close();
    }
    modalIsShowed() {
        // noinspection JSUnresolvedReference
        return this.$jconfirmModal.isOpen();
    }
    buildLoadingModal(options) {
        this.jconfirmOptions = {
            icon: 'fa fa-spinner fa-spin',
            title: 'Loading',
            theme: getJConfirmTheme(options.theme),
            content: options.loadingMessage,
            buttons: '',
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        };
    }
    buildProgressModal(_options) { }
    buildMessageModal(options) {
        this.jconfirmOptions = {
            icon: this.buildIcon(),
            title: options.title,
            theme: getJConfirmTheme(options.theme),
            content: options.content,
            buttons: this.buildButtons(options.buttons),
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        };
    }
    buildConfirmationModal(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        this.jconfirmOptions = {
            icon: this.buildIcon(),
            title: 'Confirmation',
            theme: getJConfirmTheme(options.theme),
            content: (_g = (_a = options.confirmationMessage) !== null && _a !== void 0 ? _a : (_f = (_e = (_d = (_c = (_b = this.requester) === null || _b === void 0 ? void 0 : _b.requesterOptions) === null || _c === void 0 ? void 0 : _c.strings) === null || _d === void 0 ? void 0 : _d.response) === null || _e === void 0 ? void 0 : _e.modals) === null || _f === void 0 ? void 0 : _f.defaultConfirmationMsg) !== null && _g !== void 0 ? _g : "",
            buttons: this.buildButtons([
                {
                    action: {
                        actionType: Actions.ActionType.CONFIRM,
                    },
                    text: (_m = (_l = (_k = (_j = (_h = this.requester) === null || _h === void 0 ? void 0 : _h.requesterOptions) === null || _j === void 0 ? void 0 : _j.strings) === null || _k === void 0 ? void 0 : _k.response) === null || _l === void 0 ? void 0 : _l.confirmButton) !== null && _m !== void 0 ? _m : "Confirm",
                    color: getJConfirmColorFromColor("info"),
                },
                {
                    action: {
                        actionType: Actions.ActionType.CANCEL,
                    },
                    text: (_s = (_r = (_q = (_p = (_o = this.requester) === null || _o === void 0 ? void 0 : _o.requesterOptions) === null || _p === void 0 ? void 0 : _p.strings) === null || _q === void 0 ? void 0 : _q.response) === null || _r === void 0 ? void 0 : _r.cancelButton) !== null && _s !== void 0 ? _s : "Cancel",
                    color: getJConfirmColorFromColor("default"),
                }
            ]),
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        };
    }
    buildDataNeededModal(options) {
        var _a;
        //put in content a bootstrap form with inputs from options.inputs
        const inputs = options.inputs.map(input => `
            <div class="form-group">
                <label for="${input.name}">${input.label}</label>
                <input type="${input.type}" class="form-control" id="${input.name}" name="${input.name}">
            </div>
        `).join('');
        let msg = "";
        if (!isUndefinedOrNull(options.message))
            msg = `<p>${options.message}</p>`;
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
                    color: (_a = options.color) !== null && _a !== void 0 ? _a : "default",
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
        };
    }
    // noinspection JSUnresolvedReference
    buildButtonAction(button) {
        if (Actions.isCloseAction(button.action)) {
            return () => {
                return true;
            };
        }
        else if (Actions.isRedirectAction(button.action)) {
            let action = button.action;
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                window.location.href = action.url;
                return false;
            };
        }
        else if (Actions.isRefreshAction(button.action)) {
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                window.location.reload();
                return false;
            };
        }
        else if (Actions.isCallFunctionAction(button.action)) {
            let action = button.action;
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                if (typeof window[action.functionName] === 'function') {
                    window[action.functionName]();
                }
                else {
                    console.warn(`Function ${action.functionName} is not defined.`);
                }
                return true;
            };
        }
        else if (Actions.isConfirmAction(button.action)) {
            return () => {
                return true;
            };
        }
        else if (Actions.isCancelAction(button.action)) {
            return () => {
                return true;
            };
        }
        else if (Actions.isRetryAction(button.action)) {
            return () => {
                this.retry();
                return true;
            };
        }
    }
    buildButtons(buttons_) {
        let buttons = {};
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
                        if (close)
                            cl.$jconfirmModal.close();
                        cl.modalCallbacks.onAction(button.action.actionType);
                    });
                    return false;
                }
            };
        }
        return buttons;
    }
}
JConfirmModalHandler.label = 'jquery-confirm';
function getJConfirmColorFromColor(color, defaultColor = "default") {
    if (isUndefinedOrNull(color) || colorIsColor(color)) {
        return "blue";
    }
    else {
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
function getJConfirmTheme(theme) {
    if (isUndefinedOrNull(theme))
        return 'light';
    if (['dark', 'supervan', 'modern', 'material', 'bootstrap', 'light'].includes(theme))
        return theme;
    return 'light';
}
function getJConfirmColumnClassFromSize(size) {
    if (isUndefinedOrNull(size))
        return 'medium';
    if (['', 'small', 'medium', 'large', 'xlarge'].includes(size))
        return size;
    return 'medium';
}
