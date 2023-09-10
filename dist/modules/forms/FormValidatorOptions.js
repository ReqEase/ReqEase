import { FormValidatorOptionsBuilder } from "./FormValidatorOptionsBuilder";
export class FormValidatorOptions {
    constructor() { }
    static Builder(options) {
        return new FormValidatorOptionsBuilder(options);
    }
}
