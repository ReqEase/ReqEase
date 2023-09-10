export var ActionButtons;
(function (ActionButtons) {
    let Actions;
    (function (Actions) {
        let ActionType;
        (function (ActionType) {
            ActionType["CLOSE"] = "close";
            ActionType["REDIRECT"] = "redirect";
            ActionType["REFRESH"] = "refresh";
            ActionType["CONFIRM"] = "confirm";
            ActionType["CANCEL"] = "cancel";
            ActionType["RETRY"] = "retry";
            ActionType["CALL_FUNCTION"] = "call-function";
        })(ActionType = Actions.ActionType || (Actions.ActionType = {}));
        // build Predicates types checking for each action type
        function isCloseAction(action) {
            return action.actionType === ActionType.CLOSE;
        }
        Actions.isCloseAction = isCloseAction;
        function isRedirectAction(action) {
            return action.actionType === ActionType.REDIRECT;
        }
        Actions.isRedirectAction = isRedirectAction;
        function isRefreshAction(action) {
            return action.actionType === ActionType.REFRESH;
        }
        Actions.isRefreshAction = isRefreshAction;
        function isConfirmAction(action) {
            return action.actionType === ActionType.CONFIRM;
        }
        Actions.isConfirmAction = isConfirmAction;
        function isCancelAction(action) {
            return action.actionType === ActionType.CANCEL;
        }
        Actions.isCancelAction = isCancelAction;
        function isRetryAction(action) {
            return action.actionType === ActionType.RETRY;
        }
        Actions.isRetryAction = isRetryAction;
        function isCallFunctionAction(action) {
            return action.actionType === ActionType.CALL_FUNCTION;
        }
        Actions.isCallFunctionAction = isCallFunctionAction;
    })(Actions = ActionButtons.Actions || (ActionButtons.Actions = {}));
})(ActionButtons || (ActionButtons = {}));
