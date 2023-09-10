export var ValidationTrigger;
(function (ValidationTrigger) {
    /**
     * validate() is called automatically when the ReqEase starts.
     */
    ValidationTrigger["Auto"] = "auto";
    /**
     * validate() is called manually.
     */
    ValidationTrigger["Manual"] = "manual";
})(ValidationTrigger || (ValidationTrigger = {}));
export const defaultValidationTrigger = ValidationTrigger.Auto;
