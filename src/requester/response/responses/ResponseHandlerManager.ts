import {ResponseHandler} from "../ResponseHandler";
import {Responses} from "./Responses";
import BaseCustomResponse = Responses.BaseCustomResponse;
import MessageResponse = Responses.Message.MessageResponse;
import {ActionButtons} from "../../../view/modal/ActionButtons";
import Actions = ActionButtons.Actions;
import {Requester} from "../../Requester";

export class ResponseHandlerManager {
    private static handlers: Record<string, typeof ResponseHandler> = {};

    // Register a response handler with a label
    static registerHandler<T extends typeof ResponseHandler>(handler: T) {
        ResponseHandlerManager.handlers[handler.label] = handler;
    }

    static createHandler<T extends keyof typeof ResponseHandlerManager.handlers>(label: T, requester: Requester, response: Responses.Response | BaseCustomResponse) {
        const handlerClass = ResponseHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Response handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(requester, response);
    }

    static showUnknownErrorWithRetry(requester: Requester, retry: () => void) {
        let handler = ResponseHandlerManager.createHandler("message", requester, {
            buttons: [
                {
                    action: {
                        actionType: Actions.ActionType.RETRY
                    },
                    color: 'error',
                    text: requester?.requesterOptions?.strings?.response?.retryButton??""
                },
                {
                    action: {
                        actionType: Actions.ActionType.CLOSE
                    },
                    color: 'default',
                    text: requester?.requesterOptions?.strings?.response?.closeButton??""
                }
            ],
            color: 'error',
            content: {
                body: requester?.requesterOptions?.strings?.response?.modals?.unknownErrorWithRetry?.message??"",
                title: requester?.requesterOptions?.strings?.response?.modals?.unknownErrorWithRetry?.title??""
            },
            type: "medium",
        } as MessageResponse);
        handler.retry = retry;
        handler.renderResponse();
    }
}