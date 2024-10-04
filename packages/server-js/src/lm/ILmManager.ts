import { Observable } from 'rxjs';
import { types } from 'aifoundry-vscode-shared';

interface ILmManager {
    chat(
        aif_session_id: string,
        aif_agent_uri: string,
        outputFormat: types.api.TextFormat,
        input: string,
        requestFileInfoList: types.UploadFileInfo[],
    ): Observable<string>;

    listAgents(): types.api.ListAgentsResponse;
    createAgent(agent: types.api.CreateAgentRequest): types.api.CreateOrUpdateAgentResponse;
    updateAgent(id: string, request: types.api.UpdateAgentRequest): types.api.CreateOrUpdateAgentResponse;
    deleteAgent(id: string): void;

    listEmbeddings(): types.api.ListEmbeddingsResponse;
    createEmbedding(afBaseModelUri: string | undefined, files: types.UploadFileInfo[] | undefined, name: string | undefined): Promise<types.api.CreateOrUpdateEmbeddingsResponse>;
    updateEmbedding(id: string | undefined, files: types.UploadFileInfo[] | undefined, name: string | undefined): Promise<types.api.CreateOrUpdateEmbeddingsResponse>;

    listLanguageModels(llmFeature: types.api.LlmFeature): types.api.ListLanguageModelsResponse;
    listLmProviders(): types.api.ListLmProvidersResponse;
    updateLmProvider(request: types.api.UpdateLmProviderRequest): types.api.UpdateLmProviderResponse;
}

export default ILmManager;
