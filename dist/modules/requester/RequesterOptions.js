import { RequesterOptionsBuilder } from "./RequesterOptionsBuilder";
export class RequesterOptions {
    static Builder(requesterOptionsEntered, reqEase = null) {
        return new RequesterOptionsBuilder(requesterOptionsEntered, reqEase);
    }
}
export function isIntendedRedirectKey(key) {
    return key.startsWith("key:");
}
