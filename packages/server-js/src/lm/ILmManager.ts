import { Observable } from 'rxjs';
import { types } from 'aifoundry-vscode-shared';
import { ApiOutputCtrl } from '../types/ApiOutput';

interface ILmManager {
    init(): Promise<void>;

    chat(
        aif_session_id: string,
        aif_agent_uri: string,
        outputFormat: types.api.TextFormat,
        input: string,
        requestFileInfoList: types.UploadFileInfo[],
    ): Promise<Observable<string>>;

    listAgents(): types.api.ListAgentsResponse;
    createAgent(agent: types.api.CreateAgentRequest): types.api.CreateOrUpdateAgentResponse;
    updateAgent(id: string, request: types.api.UpdateAgentRequest): types.api.CreateOrUpdateAgentResponse;
    deleteAgent(id: string): types.api.DeleteAgentResponse;

    listEmbeddings(): types.api.ListEmbeddingsResponse;
    createEmbedding(afBaseModelUri: string | undefined, files: types.UploadFileInfo[] | undefined, name: string | undefined): Promise<types.api.CreateOrUpdateEmbeddingsResponse>;
    updateEmbedding(id: string | undefined, files: types.UploadFileInfo[] | undefined, name: string | undefined): Promise<types.api.CreateOrUpdateEmbeddingsResponse>;
    deleteEmbedding(id: string): Promise<types.api.DeleteEmbeddingResponse>;

    listLanguageModels(llmFeature: types.api.LlmFeature): types.api.ListLanguageModelsResponse;
    downloadLanguageModel(lmProviderId: string, id: string): Promise<ReadableStream>;
    deleteLanguageModel(lmProviderId: string, id: string): Promise<types.api.DeleteLanguageModelResponse>;

    setupLmProvider(request: types.api.SetupLmProviderRequest, out: ApiOutputCtrl): void;
    listLmProviders(force: boolean): Promise<types.api.ListLmProvidersResponse>;
    getLmProvider(id: string, force: boolean): Promise<types.api.LmProviderInfoResponse>;
    updateLmProviderInfo(request: types.api.UpdateLmProviderInfoRequest): types.api.UpdateLmProviderResponse;
    updateLmProviderModel(request: types.api.UpdateLmProviderModelRequest): types.api.UpdateLmProviderResponse;
}

export default ILmManager;
