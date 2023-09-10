import { ReqEaseOptionsBuilder } from "./ReqEaseOptionsBuilder";
export class ReqEaseOptions {
    static Builder(options) {
        return new ReqEaseOptionsBuilder(options);
    }
}
