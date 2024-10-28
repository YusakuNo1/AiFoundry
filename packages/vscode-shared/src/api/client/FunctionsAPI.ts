import { AifFunctionType, CreateOrUpdateFunctionResponse, ListFunctionsResponse, UpdateFunctionRequest } from '../types/functions';
import { ADMIN_CTRL_PREFIX } from '../../consts/misc';
import { Config } from "./config";
import ApiUtils from "./ApiUtils";


namespace FunctionsAPI {
    export async function listFunctions(): Promise<ListFunctionsResponse> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/functions`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<ListFunctionsResponse>);
    }

    export async function createFunction(
        type: AifFunctionType,
        name: string | undefined,
        functionsPath: string,
        functionsName: string,
    ): Promise<CreateOrUpdateFunctionResponse> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/functions`;
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
            .then(ApiUtils.processApiResponse<CreateOrUpdateFunctionResponse>);
    }

    export async function updateFunction(
        id: string,
        name: string,
    ): Promise<CreateOrUpdateFunctionResponse> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/functions`;
        const body: UpdateFunctionRequest = { id, name };
        return fetch(endpoint, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then(ApiUtils.processApiResponse<CreateOrUpdateFunctionResponse>);
    }

    export async function deleteFunction(id: string): Promise<void> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/functions/${id}`;
        return fetch(endpoint, {
            method: "DELETE",
        })
            .then(ApiUtils.processApiResponse<void>);
    }
}

export default FunctionsAPI;
