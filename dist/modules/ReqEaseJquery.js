import { ReqEase } from "./ReqEase";
export function ReqEaseJquery(options) {
    let reqEase = $(this).data('reqease');
    if (typeof reqEase !== 'undefined')
        return reqEase;
    else {
        reqEase = new ReqEase($.extend(true, options, {
            form: $(this),
        }));
        $(this).data('reqease', reqEase);
        return reqEase;
    }
}
