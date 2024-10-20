import { Observable } from 'rxjs';
import type { api } from "aifoundry-vscode-shared";
import { consts, StreamingUtils } from "aifoundry-vscode-shared";
import { APIConfig } from "./config";
import ApiUtils from "../utils/ApiUtils";


namespace LanguageModelsAPI {
    export async function listLanguageModelsEmbedding(): Promise<api.ListLanguageModelsResponse> {
        return _listLanguageModels("embedding");
    }

    export async function listLanguageModelsChat(): Promise<api.ListLanguageModelsResponse> {
        return _listLanguageModels("conversational");
    }

    export function setupLmProvider(
        lmProviderId: string,
    ): Observable<string> {
        return new Observable<string>((subscriber) => {
            const body = JSON.stringify({ id: lmProviderId });
            const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/setup`;

            fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body,
            }).then(async (response) => {
                if (!response.body || !response.ok) {
                    const message = await response.text();
                    const messageJson = (typeof message === "string") ? {
                        type: "error",
                        message,
                    } : message;            
                    subscriber.next(JSON.stringify(messageJson));
                } else {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder("utf-8");
                    let finished = false;
                    while (!finished) {
                        const result: any = await reader!.read();
                        finished = result.done;
                        if (!finished) {
                            const message = {
                                type: "info",
                                message: decoder.decode(result.value),
                            };
                            subscriber.next(JSON.stringify(message));
                        }    
                    }
                    subscriber.complete();    
                }
            }).catch((err) => {
                subscriber.error(err);
            });
        });
    }

    export function downloadLanguageModel(
        lmProviderId: string,
        id: string
    ): Promise<string> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/crud/${lmProviderId}/${id}`;
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            return response.text();
        }).catch((err) => {
            throw new Error(`Failed to download language model: ${err}`);
        });
    }

    export async function deleteLanguageModel(
        lmProviderId: string,
        id: string
    ): Promise<api.DeleteLanguageModelResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/crud/${lmProviderId}/${id}`;
        return fetch(endpoint, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<api.DeleteLanguageModelResponse>);
        
    }

    export async function listLmProviders(force: boolean): Promise<api.ListLmProvidersResponse> {
        const forceParam = force ? `?${consts.QUERY_PARAM_FORCE}=true` : "";
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers${forceParam}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<api.ListLmProvidersResponse>);
    }

    export async function getLmProvider(id: string, force: boolean): Promise<api.LmProviderInfoResponse> {
        const forceParam = force ? `?${consts.QUERY_PARAM_FORCE}=true` : "";
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers/${id}${forceParam}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<api.LmProviderInfoResponse>);
    }

    export async function updateLmProviderInfo(
        request: api.UpdateLmProviderInfoRequest
    ): Promise<api.UpdateLmProviderResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`;
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
            .then(ApiUtils.processApiResponse<api.UpdateLmProviderResponse>);
    }

    export async function updateLmProviderModel(
        request: api.UpdateLmProviderModelRequest
    ): Promise<api.UpdateLmProviderResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers/models`;
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
            .then(ApiUtils.processApiResponse<api.UpdateLmProviderResponse>);
    }

    async function _listLanguageModels(
        llmFeature: api.LlmFeature
    ): Promise<api.ListLanguageModelsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/filter/${llmFeature}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<api.ListLanguageModelsResponse>);
    }
}

export default LanguageModelsAPI;
