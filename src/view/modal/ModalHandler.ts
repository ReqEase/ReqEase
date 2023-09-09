import {Color, ColorState} from "../ViewUtils";
import {ModalCallbacks} from "./ModalCallbacks";
import {ActionButtons} from "./ActionButtons";
import {Requester} from "../../requester/Requester";
import {ModalHandlerType} from "./ReadyModalHandler";
import {isUndefinedOrNull} from "../../root/utils";
import ActionType = ActionButtons.Actions.ActionType;

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
export class ModalHandler {
    protected options: ModalOptions;
    requester: Requester;
    static label: string;
    private readonly _modalCallbacks: ModalCallbacks[];
    private readonly _internalCallbacks: ModalCallbacks;
    $modal: JQuery = null;
    retry: () => void = () => {};

    public constructor(requester: Requester, options: ModalOptions) {
        this.options = options;
        this.requester = requester;
        this._modalCallbacks = [{
            onOpen: () => {},
            onClose: () => {},
            onAction: () => {},
            onBeforeAction: (_action, callback) => {
                callback();
            },
        }];
        this._internalCallbacks = {
            onOpen: () => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onOpen)) continue;
                    this._modalCallbacks[i].onOpen();
                }
            },
            onClose: () => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onClose)) continue;
                    this._modalCallbacks[i].onClose();
                }
            },
            onAction: (action: string) => {
                if (ModalOptionsIsConfirmationOptions(this.options)) {
                    if (action === ActionType.CONFIRM) {
                        this.options.confirm();
                    }
                    else if (action === ActionType.CANCEL) {
                        this.options.cancel();
                    }
                }
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onAction)) continue;
                    this._modalCallbacks[i].onAction(action);
                }
            },
            onBeforeAction: (action: string, callback: () => void) => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onBeforeAction)) continue;
                    this._modalCallbacks[i].onBeforeAction(action, callback);
                }
            }
        };
        this.build();
    }

    get modalCallbacks(): ModalCallbacks {
        return this._internalCallbacks;
    }

    set modalCallbacks(value: ModalCallbacks) {
        this._modalCallbacks.push(value);
    }

    // method to show the modal
    show(): void {}

    // method to close the modal
    close(): void {}

    modalIsShowed(): boolean {
        return false;
    }

    protected build() {
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
        else{
            this.buildCustomModal(this.options);
        }
    }

    protected buildLoadingModal(_options: ModalLoadingOptions) {}

    protected buildProgressModal(_options: ModalProgressOptions) {}

    protected buildMessageModal(_options: ModalMessageOptions) {}

    protected buildConfirmationModal(_options: ModalConfirmationOptions) {}

    protected buildDataNeededModal(_options: ModalDataNeededOptions) {}

    protected buildCustomModal(_options: ModalDataNeededOptions) {}

    protected buildIcon(): string
    {
        if (!ModalOptionsIsMessageOptions(this.options)) return "";
        if (isReadyMadeIcon(this.options.icon)) {
            return this.options.icon;
        }
        else{
            return this.options.icon;
        }
    }
}

interface ModalBaseOptions {
    theme?: ModalTheme;
    color?: ColorState | Color;
    size?: Size;
    icon?: ModalIcon;
}

export interface ModalLoadingOptions extends ModalBaseOptions {
    loadingMessage: string;
}
export interface ModalProgressOptions extends ModalBaseOptions {
    progressMessage: string;
    updateProgress: (progress: number) => void;
}
export interface ModalMessageOptions extends ModalBaseOptions {
    title?: string;
    content?: string;
    buttons: ModalButton[];
}
export interface ModalConfirmationOptions extends ModalBaseOptions {
    confirmationMessage?: string;
    confirm: () => void;
    cancel?: () => void;
}

export interface ModalDataNeededOptions extends ModalBaseOptions {
    inputs: ModalInput[];
    title?: string;
    message?: string;
}

export type ModalOptions = ModalLoadingOptions | ModalProgressOptions | ModalMessageOptions | ModalConfirmationOptions | ModalDataNeededOptions;

export interface ModalInput {
    type: ModalInputType | string;
    name: string;
    label: string;
}

export type ModalInputType = "text" | "number" | "email" | "password" | "url" | "tel" | "range" | "date" | "time" | "datetime-local" | "month" | "week" | "color" | "file" | "image" | "hidden" | "search" | "button" | "submit" | "reset" | "textarea" | "select" | "checkbox" | "radio" | "switch"
    | "range-slider" | "range-progress" | "range-progress-slider" | "range-progress-input" | "range-progress-slider-input" | "range-slider-input" | "range-slider-progress"
    | "range-slider-progress-input";

export type ModalTheme = "dark" | "light" | string;

//size from this : 'small', 'medium', 'large', 'xlarge'
export type Size = 'small' | 'medium' | 'large' | 'xlarge' | string;

export type ModalButton = ActionButtons.ActionButton;

export type ReadyMadeModalIcon = ColorState | 'question';

export type ModalIcon = ReadyMadeModalIcon | string;

export function isReadyMadeIcon(icon: ModalIcon): icon is ReadyMadeModalIcon {
    return [].includes(icon as ReadyMadeModalIcon);
}

export function getLabelFromReadyModal(useReadyModal: ModalHandlerType | string | false): string
{
    let label;
    if (useReadyModal !== false) {
        label = useReadyModal;
    } else {
        label = "bootstrap";
    }
    return label;
}

export function ModalOptionsIsLoadingOptions(modalOptions: ModalOptions): modalOptions is ModalLoadingOptions
{
    return modalOptions.hasOwnProperty('loadingMessage');
}

export function ModalOptionsIsProgressOptions(modalOptions: ModalOptions): modalOptions is ModalProgressOptions
{
    return modalOptions.hasOwnProperty('progressMessage');
}

export function ModalOptionsIsMessageOptions(modalOptions: ModalOptions): modalOptions is ModalMessageOptions
{
    return modalOptions.hasOwnProperty('buttons');
}

export function ModalOptionsIsConfirmationOptions(modalOptions: ModalOptions): modalOptions is ModalConfirmationOptions
{
    return modalOptions.hasOwnProperty('confirm');
}

export function ModalOptionsIsDataNeededOptions(modalOptions: ModalOptions): modalOptions is ModalDataNeededOptions
{
    return modalOptions.hasOwnProperty('inputs');
}