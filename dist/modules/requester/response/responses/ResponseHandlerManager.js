import { ActionButtons } from "../../../view/modal/ActionButtons";
var Actions = ActionButtons.Actions;
export class ResponseHandlerManager {
    // Register a response handler with a label
    static registerHandler(handler) {
        ResponseHandlerManager.handlers[handler.label] = handler;
    }
    static createHandler(label, requester, response) {
        const handlerClass = ResponseHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Response handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(requester, response);
    }
    static showUnknownErrorWithRetry(requester, retry) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        let handler = ResponseHandlerManager.createHandler("message", requester, {
            buttons: [
                {
                    action: {
                        actionType: Actions.ActionType.RETRY
                    },
                    color: 'error',
                    text: (_d = (_c = (_b = (_a = requester === null || requester === void 0 ? void 0 : requester.requesterOptions) === null || _a === void 0 ? void 0 : _a.strings) === null || _b === void 0 ? void 0 : _b.response) === null || _c === void 0 ? void 0 : _c.retryButton) !== null && _d !== void 0 ? _d : ""
                },
                {
                    action: {
                        actionType: Actions.ActionType.CLOSE
                    },
                    color: 'default',
                    text: (_h = (_g = (_f = (_e = requester === null || requester === void 0 ? void 0 : requester.requesterOptions) === null || _e === void 0 ? void 0 : _e.strings) === null || _f === void 0 ? void 0 : _f.response) === null || _g === void 0 ? void 0 : _g.closeButton) !== null && _h !== void 0 ? _h : ""
                }
            ],
            color: 'error',
            content: {
                body: (_p = (_o = (_m = (_l = (_k = (_j = requester === null || requester === void 0 ? void 0 : requester.requesterOptions) === null || _j === void 0 ? void 0 : _j.strings) === null || _k === void 0 ? void 0 : _k.response) === null || _l === void 0 ? void 0 : _l.modals) === null || _m === void 0 ? void 0 : _m.unknownErrorWithRetry) === null || _o === void 0 ? void 0 : _o.message) !== null && _p !== void 0 ? _p : "",
                title: (_v = (_u = (_t = (_s = (_r = (_q = requester === null || requester === void 0 ? void 0 : requester.requesterOptions) === null || _q === void 0 ? void 0 : _q.strings) === null || _r === void 0 ? void 0 : _r.response) === null || _s === void 0 ? void 0 : _s.modals) === null || _t === void 0 ? void 0 : _t.unknownErrorWithRetry) === null || _u === void 0 ? void 0 : _u.title) !== null && _v !== void 0 ? _v : ""
            },
            type: "medium",
        });
        handler.retry = retry;
        handler.renderResponse();
    }
}
ResponseHandlerManager.handlers = {};
