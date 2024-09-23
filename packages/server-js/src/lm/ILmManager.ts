import { Observable } from 'rxjs';
import { types } from 'aifoundry-vscode-shared';

interface ILmManager {
    chat(
        aif_session_id: string,
        aif_agent_uri: string,
        outputFormat: types.api.TextFormat,
        input: string,
        requestFileInfoList: types.api.ChatHistoryMessageFile[],
    ): Observable<string>;

    listAgents(): Promise<types.api.ListAgentsResponse>;
}

export default ILmManager;
