import { isUndefinedOrNull } from "../../../root/utils";
export var Responses;
(function (Responses) {
    function isResponse(response) {
        return !isUndefinedOrNull(response) && typeof response === 'object' && 'version' in response && 'httpCode' in response;
    }
    Responses.isResponse = isResponse;
    function isCustomResponse(response) {
        return !isUndefinedOrNull(response) && typeof response === 'object' && 'label' in response && !isUndefinedOrNull(response.label);
    }
    Responses.isCustomResponse = isCustomResponse;
    //add function to check type of responses who extends BaseResponse
    function isMessageResponse(response) {
        return 'type' in response && !isUndefinedOrNull(response.type) && 'content' in response;
    }
    Responses.isMessageResponse = isMessageResponse;
    function isProgressResponse(response) {
        return 'progress' in response && !isUndefinedOrNull(response.progress) && 'maxProgress' in response && !isUndefinedOrNull(response.maxProgress);
    }
    Responses.isProgressResponse = isProgressResponse;
    function isDataNeededResponse(response) {
        return 'neededData' in response && !isUndefinedOrNull(response.neededData);
    }
    Responses.isDataNeededResponse = isDataNeededResponse;
    function isFieldsValidationErrorResponse(response) {
        return 'fieldsWithErrors' in response;
    }
    Responses.isFieldsValidationErrorResponse = isFieldsValidationErrorResponse;
    function getResponseLabel(response) {
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
    Responses.getResponseLabel = getResponseLabel;
})(Responses || (Responses = {}));
