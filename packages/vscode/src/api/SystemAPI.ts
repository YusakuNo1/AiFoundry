import { APIConfig } from "./config";
import type { types } from 'aifoundry-vscode-shared';
import { consts } from 'aifoundry-vscode-shared';
import ApiUtils from "../utils/ApiUtils";


namespace SystemAPI {
    export async function getStatus(): Promise<types.StatusResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}/status/`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.StatusResponse>);
    }

    export async function getSystemConfig(): Promise<types.SystemConfig> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/system/`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.SystemConfig>);
    }
}

export default SystemAPI;
