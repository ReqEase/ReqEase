import { ActionButtons } from "./ActionButtons";
import { isUndefinedOrNull } from "../../root/utils";
var ActionType = ActionButtons.Actions.ActionType;
// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
export class ModalHandler {
    constructor(requester, options) {
        this.$modal = null;
        this.retry = () => { };
        this.options = options;
        this.requester = requester;
        this._modalCallbacks = [{
                onOpen: () => { },
                onClose: () => { },
                onAction: () => { },
                onBeforeAction: (_action, callback) => {
                    callback();
                },
            }];
        this._internalCallbacks = {
            onOpen: () => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onOpen))
                        continue;
                    this._modalCallbacks[i].onOpen();
                }
            },
            onClose: () => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onClose))
                        continue;
                    this._modalCallbacks[i].onClose();
                }
            },
            onAction: (action) => {
                if (ModalOptionsIsConfirmationOptions(this.options)) {
                    if (action === ActionType.CONFIRM) {
                        this.options.confirm();
                    }
                    else if (action === ActionType.CANCEL) {
                        this.options.cancel();
                    }
                }
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onAction))
                        continue;
                    this._modalCallbacks[i].onAction(action);
                }
            },
            onBeforeAction: (action, callback) => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onBeforeAction))
                        continue;
                    this._modalCallbacks[i].onBeforeAction(action, callback);
                }
            }
        };
        this.build();
    }
    get modalCallbacks() {
        return this._internalCallbacks;
    }
    set modalCallbacks(value) {
        this._modalCallbacks.push(value);
    }
    // method to show the modal
    show() { }
    // method to close the modal
    close() { }
    modalIsShowed() {
        return false;
    }
    build() {
        if (ModalOptionsIsLoadingOptions(this.options)) {
            this.buildLoadingModal(this.options);
        }
        else if (ModalOptionsIsProgressOptions(this.options)) {
            this.buildProgressModal(this.options);
        }
        else if (ModalOptionsIsMessageOptions(this.options)) {
            this.buildMessageModal(this.options);
        }
        else if (ModalOptionsIsConfirmationOptions(this.options)) {
            this.buildConfirmationModal(this.options);
        }
        else if (ModalOptionsIsDataNeededOptions(this.options)) {
            this.buildDataNeededModal(this.options);
        }
        else {
            this.buildCustomModal(this.options);
        }
    }
    buildLoadingModal(_options) { }
    buildProgressModal(_options) { }
    buildMessageModal(_options) { }
    buildConfirmationModal(_options) { }
    buildDataNeededModal(_options) { }
    buildCustomModal(_options) { }
    buildIcon() {
        if (!ModalOptionsIsMessageOptions(this.options))
            return "";
        if (isReadyMadeIcon(this.options.icon)) {
            return this.options.icon;
        }
        else {
            return this.options.icon;
        }
    }
}
export function isReadyMadeIcon(icon) {
    return [].includes(icon);
}
export function getLabelFromReadyModal(useReadyModal) {
    let label;
    if (useReadyModal !== false) {
        label = useReadyModal;
    }
    else {
        label = "bootstrap";
    }
    return label;
}
export function ModalOptionsIsLoadingOptions(modalOptions) {
    return modalOptions.hasOwnProperty('loadingMessage');
}
export function ModalOptionsIsProgressOptions(modalOptions) {
    return modalOptions.hasOwnProperty('progressMessage');
}
export function ModalOptionsIsMessageOptions(modalOptions) {
    return modalOptions.hasOwnProperty('buttons');
}
export function ModalOptionsIsConfirmationOptions(modalOptions) {
    return modalOptions.hasOwnProperty('confirm');
}
export function ModalOptionsIsDataNeededOptions(modalOptions) {
    return modalOptions.hasOwnProperty('inputs');
}
