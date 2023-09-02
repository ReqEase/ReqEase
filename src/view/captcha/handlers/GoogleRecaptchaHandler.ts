import {CaptchaHandler} from "../CaptchaHandler";
import {BaseCaptchaOptions} from "../BaseCaptchaOptions";
import {isUndefinedOrNull} from "../../../root/utils";

export class GoogleRecaptchaHandler extends CaptchaHandler {
    static label = "easycaptchajs";
    captchaOptions: GoogleRecaptchaOptions;
    target: JQuery;

    init(ready: () => void): void {
        this.prepare();
        if (isUndefinedOrNull(this.captchaOptions.ApiToken)) {
            let meta = $("meta[name='" + this.captchaOptions.metaName + "']");
            if (meta.length === 0) {
                console.error("ApiToken is not defined, and no meta defined under name: " + this.captchaOptions.metaName);
            }
            else{
                this.captchaOptions.ApiToken = meta.attr('content');
            }
        }
        $(this.target).EasyCaptcha($.extend(true, this.formValidator.options.strings.captcha, {
            ReCAPTCHA_API_KEY_CLIENT: this.captchaOptions.ApiToken,
            autoVerification: {
                okBtn: this.formValidator.options.okBtn,
            }
        }));
        ready();
    }

    prepare(): void {
        if (isUndefinedOrNull(this.formValidator.options.form)) {
            console.error("Form is not defined.");
            return;
        }
        if (isUndefinedOrNull(this.formValidator.options.okBtn)) {
            console.error("OkBtn is not defined.");
            return;
        }
        let captchaTarget = $('#ReCaptchaTarget');
        if (captchaTarget.length === 0) {
            captchaTarget = $('<div id="ReCaptchaTarget"></div>');
            captchaTarget.insertBefore(this.formValidator.options.okBtn);
        }
        this.target = captchaTarget;

        this.captchaOptions = {...defaultGoogleRecaptchaOptions, ...this.formValidator.options.captcha};
    }

    triggerRequiredError(): void {

    }

}

export interface GoogleRecaptchaOptions extends BaseCaptchaOptions {
    ApiToken?: string;
    metaName?: string;
}

export const defaultGoogleRecaptchaOptions: GoogleRecaptchaOptions = {
    metaName: "google-recaptcha-api-token"
}