import {ResponseHandler} from "../../ResponseHandler";
import {Responses} from "../Responses";
import {FormValidator} from "../../../../forms/FormValidator";
import {isUndefinedOrNull} from "../../../../root/utils";

export class FieldsValidationResponseHandler extends ResponseHandler {
    static label = "fields_validation_error";
    response: Responses.FieldsValidation.FieldsValidationErrorResponse;

    prepare() {
        if (!isUndefinedOrNull(this.response.fieldsWithErrors)) {
            for (let fieldName in this.response.fieldsWithErrors) {
                let field = $('[name="' + fieldName + '"]');
                if (field.length === 0) {
                    console.error("Field with name '" + fieldName + "' not found");
                    continue;
                }
                FormValidator.showInputError(field, this.response.fieldsWithErrors[fieldName], this.requester.requesterOptions.inputMessageRenderer);
            }
        }
    }

    renderResponse(): void {
        this.prepare();
    }
}