import { APIConfig } from "./config";
import type { types } from 'aifoundry-vscode-shared';
import ApiUtils from "../utils/ApiUtils";


namespace SystemAPI {
    export async function getStatus(): Promise<types.api.StatusResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}/status/`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.api.StatusResponse>);
    }
}

export default SystemAPI;
