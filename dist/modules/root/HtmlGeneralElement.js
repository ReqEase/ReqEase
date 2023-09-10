import { isUndefinedOrNull } from "./utils";
export function getJqueryElement(htmlGeneralElement) {
    if (Array.isArray(htmlGeneralElement)) {
        const jqueryElements = [];
        for (const element of htmlGeneralElement) {
            if (typeof element === 'undefined' || element === null)
                continue;
            let x = getOneJqueryElementByName(element);
            if (typeof x === 'undefined')
                continue;
            jqueryElements.push(x);
        }
        return jqueryElements;
    }
    else {
        return getOneJqueryElementByName(htmlGeneralElement);
    }
}
export function getOneJqueryElement(htmlGeneralElement) {
    if (isUndefinedOrNull(htmlGeneralElement))
        return undefined;
    if (isHtmlGeneralElementString(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    }
    else if (isHtmlGeneralElementHTMLElement(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    }
    else if (isHtmlGeneralElementJQueryElement(htmlGeneralElement)) {
        return htmlGeneralElement;
    }
    return undefined;
}
export function getOneJqueryElementByName(htmlGeneralElement) {
    if (isUndefinedOrNull(htmlGeneralElement))
        return undefined;
    if (isHtmlGeneralElementString(htmlGeneralElement)) {
        if (htmlGeneralElement.startsWith('selector:')) {
            return $(htmlGeneralElement.substring(9));
        }
        return $('[name="' + htmlGeneralElement + '"]');
    }
    else if (isHtmlGeneralElementHTMLElement(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    }
    else if (isHtmlGeneralElementJQueryElement(htmlGeneralElement)) {
        return htmlGeneralElement;
    }
    return undefined;
}
export function getOkBtnFromForm(form, okBtn) {
    form = getOneJqueryElement(form);
    okBtn = getOneJqueryElement(okBtn);
    if (!isUndefinedOrNull(form) && form.length !== 0) {
        if (isUndefinedOrNull(okBtn) || okBtn.length === 0) {
            okBtn = form.find('button[type="submit"], #okBtn').last();
        }
    }
    return [form, okBtn];
}
function isHtmlGeneralElementString(htmlGeneralElement) {
    return typeof htmlGeneralElement === 'string';
}
function isHtmlGeneralElementHTMLElement(htmlGeneralElement) {
    return typeof htmlGeneralElement !== 'string' && !("jquery" in htmlGeneralElement);
}
function isHtmlGeneralElementJQueryElement(htmlGeneralElement) {
    return typeof htmlGeneralElement !== 'string' && typeof htmlGeneralElement !== 'undefined' && htmlGeneralElement !== null && "jquery" in htmlGeneralElement;
}
