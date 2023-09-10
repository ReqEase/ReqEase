import { ResponseHandler } from "../../ResponseHandler";
import { FormValidator } from "../../../../forms/FormValidator";
import { isUndefinedOrNull } from "../../../../root/utils";
export class FieldsValidationResponseHandler extends ResponseHandler {
    prepare() {
        if (!isUndefinedOrNull(this.response.fieldsWithErrors)) {
            for (let fieldName in this.response.fieldsWithErrors) {
                let field = $('[name="' + fieldName + '"]');
                if (field.length === 0) {
                    console.error("Field with name '" + fieldName + "' not found");
                    continue;
                }
                FormValidator.showInputError(field, this.response.fieldsWithErrors[fieldName], this.requester.httpResponse.httpResponseOptions.inputMessageRenderer);
            }
        }
    }
    renderResponse() {
        this.prepare();
    }
}
FieldsValidationResponseHandler.label = "fields_validation_error";
