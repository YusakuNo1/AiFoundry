import { Observable } from 'rxjs';
import {
    ListLanguageModelsResponse,
    ListLmProvidersResponse,
    LmProviderInfoResponse,
    UpdateLmProviderInfoRequest,
    UpdateLmProviderModelRequest,
    UpdateLmProviderResponse,
    LlmFeature,
} from "../types/languageModels";
import { ADMIN_CTRL_PREFIX, QUERY_PARAM_FORCE } from '../../consts/misc';
import { Config } from "./config";
import ApiUtils from "./ApiUtils";
import ApiOutStreamMessageUtils from "../utils/ApiOutStreamMessageUtils";


namespace LanguageModelsAPI {
    export async function listLanguageModelsEmbedding(): Promise<ListLanguageModelsResponse> {
        return _listLanguageModels("embedding");
    }

    export async function listLanguageModelsChat(): Promise<ListLanguageModelsResponse> {
        return _listLanguageModels("conversational");
    }

    export function setupLmProvider(
        lmProviderId: string,
    ): Observable<string> {
        return new Observable<string>((subscriber) => {
            const body = JSON.stringify({ id: lmProviderId });
            const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/languagemodels/setup`;

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
                            subscriber.next(decoder.decode(result.value));
                        }    
                    }
                    subscriber.complete();    
                }
            }).catch((err) => {
                subscriber.error(err);
            });
        });
    }

    export function downloadLocalLanguageModel(
        lmProviderId: string,
        id: string
    ): Promise<void> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/languagemodels/crud/${lmProviderId}/${id}`;
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(response => ApiOutStreamMessageUtils.handleResponse(response.status, response?.body?.getReader()));
    }

    export async function deleteLocalLanguageModel(
        lmProviderId: string,
        id: string
    ): Promise<void> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/languagemodels/crud/${lmProviderId}/${id}`;
        fetch(endpoint, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(response => ApiOutStreamMessageUtils.handleResponse(response.status, response?.body?.getReader()));
    }

    export async function listLmProviders(force: boolean): Promise<ListLmProvidersResponse> {
        const forceParam = force ? `?${QUERY_PARAM_FORCE}=true` : "";
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/languagemodels/providers${forceParam}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<ListLmProvidersResponse>);
    }

    export async function getLmProvider(id: string, force: boolean): Promise<LmProviderInfoResponse> {
        const forceParam = force ? `?${QUERY_PARAM_FORCE}=true` : "";
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/languagemodels/providers/${id}${forceParam}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<LmProviderInfoResponse>);
    }

    export async function updateLmProviderInfo(
        request: UpdateLmProviderInfoRequest
    ): Promise<UpdateLmProviderResponse> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/languagemodels/providers`;
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
            .then(ApiUtils.processApiResponse<UpdateLmProviderResponse>);
    }

    export async function updateLmProviderModel(
        request: UpdateLmProviderModelRequest
    ): Promise<UpdateLmProviderResponse> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/languagemodels/providers/models`;
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        })
            .then(ApiUtils.processApiResponse<UpdateLmProviderResponse>);
    }

    async function _listLanguageModels(
        llmFeature: LlmFeature
    ): Promise<ListLanguageModelsResponse> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/languagemodels/filter/${llmFeature}`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<ListLanguageModelsResponse>);
    }
}

export default LanguageModelsAPI;
