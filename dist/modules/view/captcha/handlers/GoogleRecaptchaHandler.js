import { CaptchaHandler } from "../CaptchaHandler";
import { isUndefinedOrNull } from "../../../root/utils";
export class GoogleRecaptchaHandler extends CaptchaHandler {
    init(ready) {
        this.prepare();
        if (isUndefinedOrNull(this.captchaOptions.ApiToken)) {
            let meta = $("meta[name='" + this.captchaOptions.metaName + "']");
            if (meta.length === 0) {
                console.error("ApiToken is not defined, and no meta defined under name: " + this.captchaOptions.metaName);
            }
            else {
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
    prepare() {
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
        this.captchaOptions = Object.assign(Object.assign({}, defaultGoogleRecaptchaOptions), this.formValidator.options.captcha);
    }
    triggerRequiredError() {
    }
}
GoogleRecaptchaHandler.label = "easycaptchajs";
export const defaultGoogleRecaptchaOptions = {
    metaName: "google-recaptcha-api-token"
};
