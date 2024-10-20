import type { api } from "aifoundry-vscode-shared";
import { consts } from 'aifoundry-vscode-shared';
import { APIConfig } from "./config";
import ApiUtils from "../utils/ApiUtils";


namespace FunctionsAPI {
    export async function listFunctions(): Promise<api.ListFunctionsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/functions`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<api.ListFunctionsResponse>);
    }

    export async function createFunction(
        type: api.AifFunctionType,
        name: string | undefined,
        functionsPath: string,
        functionsName: string,
    ): Promise<api.CreateOrUpdateFunctionResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/functions`;
        const body = {
            type,
            name,
            functions_path: functionsPath,
            functions_name: functionsName,
        };
        return fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then(ApiUtils.processApiResponse<api.CreateOrUpdateFunctionResponse>);
    }

    export async function updateFunction(
        id: string,
        name: string,
    ): Promise<api.CreateOrUpdateFunctionResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/functions`;
        const body: api.UpdateFunctionRequest = { id, name };
        return fetch(endpoint, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then(ApiUtils.processApiResponse<api.CreateOrUpdateFunctionResponse>);
    }

    export async function deleteFunction(id: string): Promise<void> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/functions/${id}`;
        return fetch(endpoint, {
            method: "DELETE",
        })
            .then(ApiUtils.processApiResponse<void>);
    }
}

export default FunctionsAPI;
