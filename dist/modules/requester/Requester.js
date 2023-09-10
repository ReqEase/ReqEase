var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Requester_instances, _Requester_prepare;
import { RequesterBuilder } from "./RequesterBuilder";
import { isUndefinedOrNull } from "../root/utils";
import { HttpRequest } from "./request/HttpRequest";
import { HttpResponse } from "./response/HttpResponse";
import { ModalHandlerManager } from "../view/modal/ModalHandlerManager";
import { getLabelFromReadyModal } from "../view/modal/ModalHandler";
export class Requester {
    constructor() {
        _Requester_instances.add(this);
    }
    static Builder(requesterOptionsEntered, reqEase = null) {
        return new RequesterBuilder(requesterOptionsEntered, reqEase);
    }
    /**
     * in case you're not using ReqEase but the module Requester independently.
     */
    init() {
        if (isUndefinedOrNull(this.reqEaseOptions)) {
            if (isUndefinedOrNull(this.requesterOptions.okBtn)) {
                console.error('okBtn is required');
                return;
            }
            this.requesterOptions.okBtn.on('click', () => {
                this.start();
            });
        }
        else {
            this.start();
        }
    }
    addParams(data) {
        this.httpRequest.requestOptions.data = Object.assign(Object.assign({}, this.httpRequest.requestOptions.data), data);
    }
    start() {
        __classPrivateFieldGet(this, _Requester_instances, "m", _Requester_prepare).call(this);
        console.log("Requester started");
        this.httpRequest.callbacks_ = {
            onResponseSuccess: (response, _autoHandled, ajaxDoneParams) => {
                this.httpResponse.handle(response, ajaxDoneParams);
            },
            onResponseError: (response, _autoHandled, ajaxFailParams) => {
                this.httpResponse.handle(response, ajaxFailParams);
            },
            onResponse: (_response, _autoHandled, _ajaxParams) => {
                this.loadingIndicator.stopLoading();
            },
            onInternalError: (error) => {
                console.error("internal error", error);
                this.loadingIndicator.stopLoading();
            }
        };
        new Promise((resolve) => {
            if (this.requesterOptions.showConfirmModal) {
                let label = getLabelFromReadyModal(this.requesterOptions.useReadyModal);
                let modal = ModalHandlerManager.createHandler(label, this, {
                    confirm: () => {
                        resolve(true);
                    },
                    cancel: () => {
                        resolve(false);
                    }
                });
                modal === null || modal === void 0 ? void 0 : modal.show();
            }
            else {
                resolve(true);
            }
        }).then((go) => {
            if (!go)
                return;
            new Promise((resolve) => {
                if (!this.loadingIndicator.isLoading()) {
                    this.loadingIndicator.startLoading().then(() => resolve(true));
                }
                else {
                    resolve(true);
                }
            }).then(() => {
                this.httpRequest.startRequest();
            });
        });
    }
    retry() {
        this.start();
    }
}
_Requester_instances = new WeakSet(), _Requester_prepare = function _Requester_prepare() {
    console.log("Requester prepare", this.requesterOptions);
    this.httpRequest = HttpRequest.Builder(this.requesterOptions, this.requesterOptions.request).build();
    this.httpResponse = HttpResponse.Builder(this.requesterOptions, this.requesterOptions.response).build();
    this.httpRequest.requester = this;
    this.httpResponse.requester = this;
    this.httpRequest.requesterOptions = this.requesterOptions;
    this.httpResponse.requesterOptions = this.requesterOptions;
};
