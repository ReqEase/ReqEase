import {RequesterOptions, RequesterOptionsEntered} from "./RequesterOptions";
import {RequesterBuilder} from "./RequesterBuilder";
import {ReqEaseOptions} from "../ReqEaseOptions";
import {LoadingIndicator} from "../view/LoadingIndicator";
import {isUndefinedOrNull} from "../root/utils";
import {ReqEase} from "../ReqEase";
import {HttpRequest} from "./request/HttpRequest";
import {HttpResponse} from "./response/HttpResponse";
import {ModalHandlerManager} from "../view/modal/ModalHandlerManager";
import {getLabelFromReadyModal, ModalConfirmationOptions} from "../view/modal/ModalHandler";

export class Requester {
    requesterOptions: RequesterOptions;
    reqEaseOptions: ReqEaseOptions;
    loadingIndicator: LoadingIndicator;
    httpRequest: HttpRequest;
    httpResponse: HttpResponse;

    static Builder(requesterOptionsEntered: RequesterOptionsEntered, reqEase: ReqEase = null): RequesterBuilder
    {
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
        else{
            this.start();
        }
    }

    addParams(data: Record<string, any>) {
        this.httpRequest.requestOptions.data = {
            ...this.httpRequest.requestOptions.data,
            ...data
        };
    }

    #prepare(): void {
        console.log("Requester prepare", this.requesterOptions);
        this.httpRequest = HttpRequest.Builder(this.requesterOptions, this.requesterOptions.request).build();
        this.httpResponse = HttpResponse.Builder(this.requesterOptions, this.requesterOptions.response).build();
        this.httpRequest.requester = this;
        this.httpResponse.requester = this;
        this.httpRequest.requesterOptions = this.requesterOptions;
        this.httpResponse.requesterOptions = this.requesterOptions;
    }

    start() {
        this.#prepare();
        console.log("Requester started");
        this.httpRequest.callbacks_ = {
            onResponseSuccess: (response: any, _autoHandled: boolean, ajaxDoneParams: any) => {
                this.httpResponse.handle(response, ajaxDoneParams);
            },
            onResponseError: (response: any, _autoHandled: boolean, ajaxFailParams: any) => {
                this.httpResponse.handle(response, ajaxFailParams);
            },
            onResponse: (_response: any, _autoHandled: boolean, _ajaxParams: any) => {
                this.loadingIndicator.stopLoading();
            },
            onInternalError: (error: any) => {
                console.error("internal error", error);
                this.loadingIndicator.stopLoading();
            }
        }
        new Promise<boolean>((resolve) => {
            if (this.requesterOptions.showConfirmModal) {
                let label = getLabelFromReadyModal(this.requesterOptions.useReadyModal);
                let modal = ModalHandlerManager.createHandler(label, this, {
                    confirm: () => {
                        resolve(true);
                    },
                    cancel: () => {
                        resolve(false);
                    }
                } as ModalConfirmationOptions);
                modal?.show();
            }
            else{
                resolve(true);
            }
        }).then((go: boolean) => {
            if (!go) return;
            new Promise<boolean>((resolve) => {
                if (!this.loadingIndicator.isLoading()) {
                    this.loadingIndicator.startLoading().then(() => resolve(true));
                }
                else{
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