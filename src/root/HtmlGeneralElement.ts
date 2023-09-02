import {isUndefinedOrNull} from "./utils";

export type HtmlGeneralElement = HTMLElement | JQuery<HTMLElement> | string;
export type HtmlFormGeneralElement = HTMLFormElement | null | JQuery | string | undefined;
export type HtmlButtonGeneralElement = HTMLButtonElement | null | JQuery | string | undefined;

export function getJqueryElement(htmlGeneralElement: HtmlGeneralElement | HtmlGeneralElement[]): JQuery<HTMLElement> | JQuery<HTMLElement>[] | undefined {
    if (Array.isArray(htmlGeneralElement)) {
        const jqueryElements: JQuery<HTMLElement>[] = [];
        for (const element of htmlGeneralElement) {
            if (typeof element === 'undefined' || element === null) continue;
            let x = getOneJqueryElementByName(element);
            if (typeof x === 'undefined') continue;
            jqueryElements.push(x);
        }
        return jqueryElements;
    }
    else {
        return getOneJqueryElementByName(htmlGeneralElement);
    }
}

export function getOneJqueryElement(htmlGeneralElement: HtmlGeneralElement): JQuery<HTMLElement> | undefined {
    if (isUndefinedOrNull(htmlGeneralElement)) return undefined;
    if (isHtmlGeneralElementString(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    } else if (isHtmlGeneralElementHTMLElement(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    } else if (isHtmlGeneralElementJQueryElement(htmlGeneralElement)) {
        return htmlGeneralElement;
    }
    return undefined;
}

export function getOneJqueryElementByName(htmlGeneralElement: HtmlGeneralElement): JQuery<HTMLElement> | undefined {
    if (isUndefinedOrNull(htmlGeneralElement)) return undefined;
    if (isHtmlGeneralElementString(htmlGeneralElement)) {
        if (htmlGeneralElement.startsWith('selector:')) {
            return $(htmlGeneralElement.substring(9));
        }
        return $('[name="' + htmlGeneralElement + '"]');
    } else if (isHtmlGeneralElementHTMLElement(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    } else if (isHtmlGeneralElementJQueryElement(htmlGeneralElement)) {
        return htmlGeneralElement;
    }
    return undefined;
}

function isHtmlGeneralElementString(htmlGeneralElement: HtmlGeneralElement): htmlGeneralElement is string {
    return typeof htmlGeneralElement === 'string';
}

function isHtmlGeneralElementHTMLElement(htmlGeneralElement: HtmlGeneralElement): htmlGeneralElement is HTMLElement {
    return typeof htmlGeneralElement !== 'string' && !("jquery" in htmlGeneralElement);
}

function isHtmlGeneralElementJQueryElement(htmlGeneralElement: HtmlGeneralElement): htmlGeneralElement is JQuery<HTMLElement> {
    return typeof htmlGeneralElement !== 'string' && typeof htmlGeneralElement !== 'undefined' && htmlGeneralElement !== null && "jquery" in htmlGeneralElement;
}