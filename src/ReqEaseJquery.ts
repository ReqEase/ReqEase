import {ReqEaseOptionsJquery} from "./ReqEaseOptions";
import {ReqEase} from "./ReqEase";

declare global {
    interface JQuery {
        ReqEase(options: ReqEaseOptionsJquery): ReqEase;
    }
}

export function ReqEaseJquery(options: ReqEaseOptionsJquery) {
    let reqEase = $(this).data('reqease');
    if (typeof reqEase !== 'undefined') return reqEase;
    else {
        reqEase = new ReqEase(
            $.extend(true, options, {
                form: $(this),
            })
        );
        $(this).data('reqease', reqEase);
        return reqEase;
    }
}