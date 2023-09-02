import {EasyCaptchaSettings} from "../../../../EasyCaptchaJS";

export interface FormValidatorStrings {
    format: {
        defaultInvalid: string;
    }
    length: {
        defaultTooShort: string;
        defaultTooLong: string;
        passwordTooShort: string;
        passwordTooLong: string;
    },
    required: string,
    captcha: Omit<EasyCaptchaSettings, "ReCAPTCHA_API_KEY_CLIENT"> | Record<string, any>,
}

export const defaultStrings: FormValidatorStrings = {
    format: {
        defaultInvalid: "Invalid format"
    },
    length: {
        defaultTooShort: "Value is too short",
        defaultTooLong: "Value is too long",
        passwordTooShort: "Password must be at least %{count} characters",
        passwordTooLong: "Password must be at most %{count} characters",
    },
    required: "This field is required",
    captcha: {},
}
