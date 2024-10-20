import { APIConfig } from "./config";
import type { api } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import ApiUtils from "../utils/ApiUtils";


namespace AgentsAPI {
    export async function list(): Promise<api.ListAgentsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/agents`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<api.ListAgentsResponse>);
    }

    export async function createAgent(
        baseModelUri: string,
        name: string | undefined,
        systemPrompt: string | undefined,
        ragAssetIds: string[] | undefined,
        funcCallAssetIds: string[] | undefined,
    ): Promise<api.CreateOrUpdateAgentResponse> {
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
    ): Promise<api.CreateOrUpdateAgentResponse> {
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
    ): Promise<api.CreateOrUpdateAgentResponse> {
        const apiEndpoint = APIConfig.getApiEndpoint();
        const endpoint = isCreate ? `${apiEndpoint}${consts.ADMIN_CTRL_PREFIX}/agents/` : `${apiEndpoint}${consts.ADMIN_CTRL_PREFIX}/agents/${id}`;

        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        let body: api.CreateAgentRequest | api.UpdateAgentRequest;
        if (isCreate) {
            if (!name || !baseModelUri || !ragAssetIds || !funcCallAssetIds) {
                throw new Error("Missing required fields");
            }

            const _body: api.CreateAgentRequest = {
                basemodelUri: baseModelUri!,
                name: name,
                systemPrompt: systemPrompt,
                ragAssetIds: ragAssetIds,
                functionAssetIds: funcCallAssetIds,
            };
            body = _body;
        } else {
            const _body: api.UpdateAgentRequest = {
                agentUri: agentUri!,
                basemodelUri: baseModelUri,
                name: name,
                systemPrompt: systemPrompt,
                ragAssetIds: ragAssetIds,
                functionAssetIds: funcCallAssetIds,
            };
            body = _body;
        }

        return fetch(endpoint, {
            method: isCreate ? "POST" : "PUT",
            headers: headers,
            body: JSON.stringify(body),
        })
            .then(ApiUtils.processApiResponse<api.CreateOrUpdateAgentResponse>);
    }
}

export default AgentsAPI;
