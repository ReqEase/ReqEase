import {FormValidator} from "./FormValidator";

type OnSuccess = (formValidator: FormValidator) => void;
type OnFailure = (formValidator: FormValidator) => void;

export interface ValidatorCallbacks {
    onSuccess: OnSuccess
    onFailure: OnFailure
}

export const defaultCallbacks: ValidatorCallbacks = {
    onSuccess: () => {},
    onFailure: () => {}
}