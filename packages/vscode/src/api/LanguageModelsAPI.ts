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

    export async function setupLmProvider(
        lmProviderId: string,
    ): Promise<Observable<string>> {
        const body = JSON.stringify({ id: lmProviderId });
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/languagemodels/setup`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
        });

        if (!response.body || !response.ok) {
            const message = await response.text();
            return StreamingUtils.createErrorObservable(message ?? "Fail to setup language model provider");
        } else {
            return StreamingUtils.convertReadableStreamToObservable(response.body.getReader());
        }
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
