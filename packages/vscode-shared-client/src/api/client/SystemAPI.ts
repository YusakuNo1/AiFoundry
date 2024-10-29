import { StatusResponse } from 'aifoundry-vscode-shared/dist/api/types/system';
import { Config } from './config';
import ApiUtils from './ApiUtils';

namespace SystemAPI {
    export async function getStatus(): Promise<StatusResponse> {
        const endpoint = `${Config.getApiEndpoint()}/status/`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<StatusResponse>);
    }
}

export default SystemAPI;
