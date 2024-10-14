import { Observable } from 'rxjs';
import type { types } from "aifoundry-vscode-shared";
import { consts, StreamingUtils } from "aifoundry-vscode-shared";
import { APIConfig } from "./config";
import ApiUtils from "../utils/ApiUtils";


namespace LanguageModelsAPI {
    export async function listLanguageModelsEmbedding(): Promise<types.api.ListLanguageModelsResponse> {
        return _listLanguageModels("embedding");
    }

    export async function listLanguageModelsChat(): Promise<types.api.ListLanguageModelsResponse> {
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
    ): Promise<types.api.DeleteLanguageModelResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/crud/${lmProviderId}/${id}`;
        return fetch(endpoint, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.api.DeleteLanguageModelResponse>);
        
    }

    export async function listLmProviders(force: boolean): Promise<types.api.ListLmProvidersResponse> {
        const forceParam = force ? `?${consts.QUERY_PARAM_FORCE}=true` : "";
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers${forceParam}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.api.ListLmProvidersResponse>);
    }

    export async function getLmProvider(id: string, force: boolean): Promise<types.api.LmProviderInfoResponse> {
        const forceParam = force ? `?${consts.QUERY_PARAM_FORCE}=true` : "";
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers/${id}${forceParam}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.api.LmProviderInfoResponse>);
    }

    export async function updateLmProviderInfo(
        request: types.api.UpdateLmProviderInfoRequest
    ): Promise<types.api.UpdateLmProviderResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`;
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
            .then(ApiUtils.processApiResponse<types.api.UpdateLmProviderResponse>);
    }

    export async function updateLmProviderModel(
        request: types.api.UpdateLmProviderModelRequest
    ): Promise<types.api.UpdateLmProviderResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers/models`;
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
            .then(ApiUtils.processApiResponse<types.api.UpdateLmProviderResponse>);
    }

    async function _listLanguageModels(
        llmFeature: types.api.LlmFeature
    ): Promise<types.api.ListLanguageModelsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/filter/${llmFeature}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.api.ListLanguageModelsResponse>);
    }
}

export default LanguageModelsAPI;
