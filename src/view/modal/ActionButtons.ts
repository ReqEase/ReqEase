import {Color, ColorState} from "../ViewUtils";

export namespace ActionButtons{
    export interface ActionButton {
        action: Actions.Action;
        text: string;
        color: ColorState | Color;
    }

    export namespace Actions{

        export type Action = CloseAction | RedirectAction | RefreshAction | ConfirmAction | CancelAction | RetryAction | CallFunctionAction;
        export interface BaseAction {
            actionType: ActionType | string;
        }
        export enum ActionType {
            CLOSE = "close",
            REDIRECT = "redirect",
            REFRESH = "refresh",
            CONFIRM = "confirm",
            CANCEL = "cancel",
            RETRY = "retry",
            CALL_FUNCTION = "call-function",
        }
        export interface CloseAction extends BaseAction {
            actionType: ActionType.CLOSE;
        }
        export interface RedirectAction extends BaseAction {
            actionType: ActionType.REDIRECT;
            url: string;
        }
        export interface RefreshAction extends BaseAction {
            actionType: ActionType.REFRESH;
        }
        export interface ConfirmAction extends BaseAction {
            actionType: ActionType.CONFIRM;
        }
        export interface CancelAction extends BaseAction {
            actionType: ActionType.CANCEL;
        }
        export interface RetryAction extends BaseAction {
            actionType: ActionType.RETRY;
        }
        export interface CallFunctionAction extends BaseAction {
            actionType: ActionType.CALL_FUNCTION;
            functionName: string;
        }
        // build Predicates types checking for each action type

        export function isCloseAction(action: Action): action is CloseAction {
            return action.actionType === ActionType.CLOSE;
        }
        export function isRedirectAction(action: Action): action is RedirectAction {
            return action.actionType === ActionType.REDIRECT;
        }
        export function isRefreshAction(action: Action): action is RefreshAction {
            return action.actionType === ActionType.REFRESH;
        }
        export function isConfirmAction(action: Action): action is ConfirmAction {
            return action.actionType === ActionType.CONFIRM;
        }
        export function isCancelAction(action: Action): action is CancelAction {
            return action.actionType === ActionType.CANCEL;
        }
        export function isRetryAction(action: Action): action is RetryAction {
            return action.actionType === ActionType.RETRY;
        }
        export function isCallFunctionAction(action: Action): action is CallFunctionAction {
            return action.actionType === ActionType.CALL_FUNCTION;
        }
    }
}