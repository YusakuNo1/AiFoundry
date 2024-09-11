import { APIConfig } from "./config";
import type { types } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import ApiUtils from "../utils/ApiUtils";


namespace AgentsAPI {
    export async function list(): Promise<types.api.ListAgentsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/agents`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.api.ListAgentsResponse>);
    }

    export async function createAgent(
        baseModelUri: string,
        name: string | undefined,
        systemPrompt: string | undefined,
        ragAssetIds: string[] | undefined,
        funcCallAssetIds: string[] | undefined,
    ): Promise<types.api.CreateOrUpdateAgentResponse> {
        return _createOrupdateAgent(true, undefined, undefined, baseModelUri, name, systemPrompt, ragAssetIds, funcCallAssetIds);
    }

    export async function updateAgent(
        id: string,
        agentUri: string,
        baseModelUri: string | undefined,
        name: string | undefined,
        systemPrompt: string | undefined,
        ragAssetIds: string[],
        funcCallAssetIds: string[],
    ): Promise<types.api.CreateOrUpdateAgentResponse> {
        return _createOrupdateAgent(false, id, agentUri, baseModelUri, name, systemPrompt, ragAssetIds, funcCallAssetIds);
    }

    export async function deleteAgent(
        embeddingAssetId: string,
    ): Promise<void> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/agents/${embeddingAssetId}`;

        return fetch(endpoint, {
            method: "DELETE",
        })
            .then(ApiUtils.processApiResponse<void>);
    }

    async function _createOrupdateAgent(
        isCreate: boolean,
        id: string | undefined,
        agentUri: string | undefined,
        baseModelUri: string | undefined,
        name: string | undefined,
        systemPrompt: string | undefined,
        ragAssetIds: string[] | undefined,
        funcCallAssetIds: string[] | undefined,
    ): Promise<types.api.CreateOrUpdateAgentResponse> {
        const apiEndpoint = APIConfig.getApiEndpoint();
        const endpoint = isCreate ? `${apiEndpoint}${consts.ADMIN_CTRL_PREFIX}/agents/` : `${apiEndpoint}${consts.ADMIN_CTRL_PREFIX}/agents/${id}`;

        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        let body: types.api.CreateAgentRequest | types.api.UpdateAgentRequest;
        if (isCreate) {
            const _body: types.api.CreateAgentRequest = {
                base_model_uri: baseModelUri!,
                name: name,
                system_prompt: systemPrompt,
                rag_asset_ids: ragAssetIds,
                function_asset_ids: funcCallAssetIds,
            };
            body = _body;
        } else {
            const _body: types.api.UpdateAgentRequest = {
                agent_uri: agentUri!,
                base_model_uri: baseModelUri,
                name: name,
                system_prompt: systemPrompt,
                rag_asset_ids: ragAssetIds,
                function_asset_ids: funcCallAssetIds,
            };
            body = _body;
        }

        return fetch(endpoint, {
            method: isCreate ? "POST" : "PUT",
            headers: headers,
            body: JSON.stringify(body),
        })
            .then(ApiUtils.processApiResponse<types.api.CreateOrUpdateAgentResponse>);
    }
}

export default AgentsAPI;
