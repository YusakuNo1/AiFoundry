import { Observable } from 'rxjs';
import { api, type misc } from 'aifoundry-vscode-shared';
import { ApiOutputCtrl } from '../types/ApiOutput';

interface ILmManager {
    init(): Promise<void>;

    chat(
        aif_session_id: string,
        aif_agent_uri: string,
        outputFormat: api.TextFormat,
        input: string,
        requestFileInfoList: misc.UploadFileInfo[],
    ): Promise<Observable<string>>;

    listAgents(): api.ListAgentsResponse;
    createAgent(agent: api.CreateAgentRequest): api.CreateOrUpdateAgentResponse;
    updateAgent(id: string, request: api.UpdateAgentRequest): api.CreateOrUpdateAgentResponse;
    deleteAgent(id: string): api.DeleteAgentResponse;

    listEmbeddings(): api.ListEmbeddingsResponse;
    createEmbedding(afBaseModelUri: string | undefined, files: misc.UploadFileInfo[] | undefined, name: string | undefined): Promise<api.CreateOrUpdateEmbeddingsResponse>;
    updateEmbedding(id: string | undefined, files: misc.UploadFileInfo[] | undefined, name: string | undefined): Promise<api.CreateOrUpdateEmbeddingsResponse>;
    deleteEmbedding(id: string): Promise<api.DeleteEmbeddingResponse>;

    listLanguageModels(llmFeature: api.LlmFeature): api.ListLanguageModelsResponse;
    downloadLanguageModel(lmProviderId: string, id: string): Promise<ReadableStream>;
    deleteLanguageModel(lmProviderId: string, id: string): Promise<api.DeleteLanguageModelResponse>;

    setupLmProvider(request: api.SetupLmProviderRequest, out: ApiOutputCtrl): void;
    listLmProviders(force: boolean): Promise<api.ListLmProvidersResponse>;
    getLmProvider(id: string, force: boolean): Promise<api.LmProviderInfoResponse>;
    updateLmProviderInfo(request: api.UpdateLmProviderInfoRequest): api.UpdateLmProviderResponse;
    updateLmProviderModel(request: api.UpdateLmProviderModelRequest): api.UpdateLmProviderResponse;
}

export default ILmManager;
