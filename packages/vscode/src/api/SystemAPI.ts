import { APIConfig } from "./config";
import type { api } from 'aifoundry-vscode-shared';
import ApiUtils from "../utils/ApiUtils";


namespace SystemAPI {
    export async function getStatus(): Promise<api.StatusResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}/status/`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<api.StatusResponse>);
    }
}

export default SystemAPI;
