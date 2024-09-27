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

    listAgents(): types.api.ListAgentsResponse;
    createAgent(agent: types.api.CreateAgentRequest): types.api.CreateOrUpdateAgentResponse;
    updateAgent(id: string, request: types.api.UpdateAgentRequest): types.api.CreateOrUpdateAgentResponse;
    deleteAgent(id: string): void;

    listEmbeddings(): types.api.ListEmbeddingsResponse;
    createEmbedding(afBaseModelUri: string | null, files: types.UploadFileInfo[], name: string | null): types.api.CreateOrUpdateEmbeddingsResponse;
}

export default ILmManager;
