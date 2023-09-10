// index.ts
import { ReqEase } from './ReqEase';
import { Requester } from './requester/Requester';
import { FormValidator } from './forms/FormValidator';
import { ReqEaseJquery } from "./ReqEaseJquery";
import { CaptchaHandler } from "./view/captcha/CaptchaHandler";
import { ResponseHandler } from "./requester/response/ResponseHandler";
import { ModalHandler } from "./view/modal/ModalHandler";
import { ModalHandlerManager } from "./view/modal/ModalHandlerManager";
(function ($) {
    $.fn.ReqEase = ReqEaseJquery;
})(jQuery);
window.ReqEase = ReqEase;
window.Requester = Requester;
window.FormValidator = FormValidator;
export { ReqEase, Requester, FormValidator, CaptchaHandler, ResponseHandler, ModalHandler, ModalHandlerManager };
