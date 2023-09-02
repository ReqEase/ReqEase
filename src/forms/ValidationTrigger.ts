export enum ValidationTrigger {
    /**
     * validate() is called automatically when the ReqEase starts.
     */
    Auto = 'auto',
    /**
     * validate() is called manually.
     */
    Manual = 'manual',
}

export const defaultValidationTrigger = ValidationTrigger.Auto;