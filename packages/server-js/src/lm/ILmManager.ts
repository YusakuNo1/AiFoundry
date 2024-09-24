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
    createAgent(agent: types.api.CreateAgentRequest): Promise<types.api.CreateOrUpdateAgentResponse>;
    updateAgent(id: string, request: types.api.UpdateAgentRequest): Promise<types.api.CreateOrUpdateAgentResponse>;
    deleteAgent(id: string): Promise<void>;

    listEmbeddings(): Promise<types.api.ListEmbeddingsResponse>;
    createEmbedding(aifBasemodelUri: string, files: Record<string, types.FileInfo>): Promise<types.api.CreateOrUpdateEmbeddingsResponse>;
}

export default ILmManager;
