import {Color} from "../../../view/ViewUtils";
import {ActionButtons} from "../../../view/modal/ActionButtons";
import {isUndefinedOrNull} from "../../../root/utils";
import {ModalInput} from "../../../view/modal/ModalHandler";

export namespace Responses {

    export type Response = Message.MessageResponse | Progress.ProgressResponse | DataNeeded.DataNeededResponse | FieldsValidation.FieldsValidationErrorResponse;

    export interface AjaxDoneParams {
        data: any;
        textStatus: string;
        jqXHR: JQueryXHR;
    }

    export interface AjaxFailParams {
        jqXHR: JQueryXHR;
        textStatus: string;
        errorThrown: string;
    }

    export interface Callbacks {
        /**
         * <span style="color: #007bff;">**onResponseSuccess**</span>
         * and <span style="color: #007bff;">**onResponseError**</span>
         * are called after <span style="color: #007bff;">onResponse</span> and in case the response is valid and can be cast to a <span style="color: #007bff;">Response</span>
         */
        onResponseSuccess: (response: any, autoHandled: boolean, ajaxDoneParams: AjaxDoneParams) => void;
        onResponseError: (response: any, autoHandled: boolean, ajaxFailParams: AjaxFailParams) => void;
        /**
         *
         * this is called before <span style="color: #007bff;">**onResponseSuccess**</span> and <span style="color: #007bff;">**onResponseError**</span>
         */
        onResponse: (response: any, autoHandled: boolean, ajaxParams: AjaxDoneParams | AjaxFailParams) => void;
        onInternalError: (error: any) => void;
    }

    export interface BaseCustomResponse {
        label: string;
    }

    export interface BaseResponse {
        version: string;
        environment: string;
        timestamp: number;
        httpCode: number;
        color: Color;
    }

    export namespace Message {
        import ActionButton = ActionButtons.ActionButton;
        export type MessageResponseType = 'modal-big' | 'modal-medium' | 'msg-in-form' | 'msg-in-toast' | string;

        export interface Content {
            body: string;
            title: string;
        }
        export interface MessageResponse extends BaseResponse {
            type: MessageResponseType;
            content: Content;
            buttons: ActionButton[];
        }
    }



    //TODO: Coming soon
    export namespace Progress {
        export interface ProgressResponse extends BaseResponse {
            progress: number;
            maxProgress: number;
            estimatedTimeRemaining: number;
            title: string;
        }
    }

    //TODO: Coming soon
    export namespace DataNeeded {
        export interface DataNeededResponse extends BaseResponse {
            neededData: ModalInput[];
            title?: string;
            message?: string;
        }
    }

    export namespace FieldsValidation {
        export interface FieldsValidationErrorResponse extends BaseResponse {
            fieldsWithErrors: Record<string, string[]>
        }
    }

    export function isResponse(response: unknown): response is Response {
        return !isUndefinedOrNull(response) && typeof response === 'object' && 'version' in response && 'httpCode' in response;
    }

    export function isCustomResponse(response: unknown): response is BaseCustomResponse {
        return !isUndefinedOrNull(response) && typeof response === 'object' && 'label' in response && !isUndefinedOrNull(response.label);
    }

    //add function to check type of responses who extends BaseResponse
    export function isMessageResponse(response: Response): response is Message.MessageResponse {
        return 'type' in response && !isUndefinedOrNull(response.type) && 'content' in response;
    }

    export function isProgressResponse(response: Response): response is Progress.ProgressResponse {
        return 'progress' in response && !isUndefinedOrNull(response.progress) && 'maxProgress' in response && !isUndefinedOrNull(response.maxProgress);
    }

    export function isDataNeededResponse(response: Response): response is DataNeeded.DataNeededResponse {
        return 'neededData' in response && !isUndefinedOrNull(response.neededData);
    }

    export function isFieldsValidationErrorResponse(response: Response): response is FieldsValidation.FieldsValidationErrorResponse {
        return 'fieldsWithErrors' in response;
    }

    export function getResponseLabel(response: Response | BaseCustomResponse): string {
        if (isResponse(response)) {
            if (isMessageResponse(response)) {
                return "message";
            }
            else if (isProgressResponse(response)) {
                return 'progress';
            }
            else if (isDataNeededResponse(response)) {
                return 'data_needed';
            }
            else if (isFieldsValidationErrorResponse(response)) {
                return 'fields_validation_error';
            }
        }
        return response.label;
    }
}
