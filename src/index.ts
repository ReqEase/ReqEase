// index.ts

import { ReqEase } from './ReqEase';
import { Requester } from './requester/Requester';
import { FormValidator } from './forms/FormValidator';
import {ReqEaseJquery} from "./ReqEaseJquery";

(function ($) {
    $.fn.ReqEase = ReqEaseJquery;
})(jQuery);

(window as any).ReqEase = ReqEase;
(window as any).Requester = Requester;
(window as any).FormValidator = FormValidator;

export { ReqEase, Requester, FormValidator };