import { ResponseHandler } from "../../ResponseHandler";
import { getLabelFromReadyModal } from "../../../../view/modal/ModalHandler";
import { ModalHandlerManager } from "../../../../view/modal/ModalHandlerManager";
import { ActionButtons } from "../../../../view/modal/ActionButtons";
import { isUndefinedOrNull } from "../../../../root/utils";
import { FormValidator } from "../../../../forms/FormValidator";
var ActionType = ActionButtons.Actions.ActionType;
export class DataNeededResponseHandler extends ResponseHandler {
    prepare() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        let label = getLabelFromReadyModal(this.requester.requesterOptions.useReadyModal);
        this.modalHandler = ModalHandlerManager.createHandler(label, this.requester, {
            title: (_j = (_b = (_a = this.response) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : (_h = (_g = (_f = (_e = (_d = (_c = this.requester) === null || _c === void 0 ? void 0 : _c.requesterOptions) === null || _d === void 0 ? void 0 : _d.strings) === null || _e === void 0 ? void 0 : _e.response) === null || _f === void 0 ? void 0 : _f.modals) === null || _g === void 0 ? void 0 : _g.data_needed) === null || _h === void 0 ? void 0 : _h.title) !== null && _j !== void 0 ? _j : "",
            inputs: (_l = (_k = this.response) === null || _k === void 0 ? void 0 : _k.neededData) !== null && _l !== void 0 ? _l : [],
            message: (_v = (_o = (_m = this.response) === null || _m === void 0 ? void 0 : _m.message) !== null && _o !== void 0 ? _o : (_u = (_t = (_s = (_r = (_q = (_p = this.requester) === null || _p === void 0 ? void 0 : _p.requesterOptions) === null || _q === void 0 ? void 0 : _q.strings) === null || _r === void 0 ? void 0 : _r.response) === null || _s === void 0 ? void 0 : _s.modals) === null || _t === void 0 ? void 0 : _t.data_needed) === null || _u === void 0 ? void 0 : _u.message) !== null && _v !== void 0 ? _v : "",
            color: (_w = this.response) === null || _w === void 0 ? void 0 : _w.color,
            size: "large",
        });
        let formValidator;
        this.modalHandler.modalCallbacks.onOpen = () => {
            formValidator = FormValidator.Builder({
                form: this.modalHandler.$modal.find('.form'),
            }).build();
        };
        this.modalHandler.modalCallbacks.onBeforeAction = (action, callback) => {
            if (action === ActionType.CONFIRM) {
                formValidator.validatorCallbacks.onSuccess = () => {
                    callback();
                };
                formValidator.validate();
            }
            else {
                callback();
            }
        };
        this.modalHandler.modalCallbacks.onAction = (action) => {
            if (action === ActionType.CONFIRM) {
                console.log(this.modalHandler, this.modalHandler.$modal);
                let newData = {};
                if (!isUndefinedOrNull(this.response.neededData)) {
                    for (let i = 0; i < this.response.neededData.length; i++) {
                        if (isUndefinedOrNull(this.response.neededData[i].name))
                            continue;
                        let inp = this.modalHandler.$modal.find('[name="' + this.response.neededData[i].name + '"]');
                        if (inp.length !== 0) {
                            if (inp.is('textarea')) {
                                newData[this.response.neededData[i].name] = inp.html();
                            }
                            else {
                                newData[this.response.neededData[i].name] = inp.val();
                            }
                        }
                    }
                }
                this.requester.addParams(newData);
                this.requester.retry();
                console.log("confirmed & data added !");
            }
        };
    }
    renderResponse() {
        this.prepare();
        this.modalHandler.show();
    }
}
DataNeededResponseHandler.label = "data_needed";
