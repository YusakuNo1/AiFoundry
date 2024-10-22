import { Observable } from 'rxjs';
import { v4 as uuid } from "uuid";
import { AifUtils, api, consts, database, type misc } from 'aifoundry-vscode-shared';
import LmBaseProvider from './LmBaseProvider';
import ILmManager from './ILmManager';
import DatabaseManager from '../database/DatabaseManager';
import { HttpException } from '../exceptions';
import AssetUtils from '../utils/assetUtils';
import LmProviderAzureOpenAI from './LmProviderAzureOpenAI';
import LmManagerUtils from './LmManagerUtils';
import LmProviderOllama from './LmProviderOllama';
import LmProviderOpenAI from './LmProviderOpenAI';
import LmProviderGoogleGemini from './LmProviderGoogleGemini';
import LmProviderAwsBedrock from './LmProviderAwsBedrock';
import OllamaUtils from '../utils/OllamaUtils';
import { ApiOutStream } from '../types/ApiOutStream';


class LmManager implements ILmManager {
    private _lmProviderMap: Record<string, LmBaseProvider> = {};

    constructor(private databaseManager: DatabaseManager) {
        this.listAgents = this.listAgents.bind(this);
        this.createAgent = this.createAgent.bind(this);
        this.updateAgent = this.updateAgent.bind(this);
        this.chat = this.chat.bind(this);
        this.listEmbeddings = this.listEmbeddings.bind(this);
        this.createEmbedding = this.createEmbedding.bind(this);
        this.updateEmbedding = this.updateEmbedding.bind(this);
        this.listLmProviders = this.listLmProviders.bind(this);
        this.listLanguageModels = this.listLanguageModels.bind(this);
    }

    public async init(): Promise<void> {
        this._lmProviderMap[LmProviderAzureOpenAI.ID] = new LmProviderAzureOpenAI(this.databaseManager);
        this._lmProviderMap[LmProviderOpenAI.ID] = new LmProviderOpenAI(this.databaseManager);
        this._lmProviderMap[LmProviderOllama.ID] = new LmProviderOllama(this.databaseManager);
        this._lmProviderMap[LmProviderGoogleGemini.ID] = new LmProviderGoogleGemini(this.databaseManager);
        this._lmProviderMap[LmProviderAwsBedrock.ID] = new LmProviderAwsBedrock(this.databaseManager);

        for (const provider of Object.values(this._lmProviderMap)) {
            await provider.init();
        }
    }

    public async chat(
        aifSessionId: string,
        aifAgentUri: string,
        outputFormat: api.TextFormat,
        input: string,
        files: misc.UploadFileInfo[],
    ): Promise<Observable<string>> {
        const agentId = AifUtils.getAgentId(aifAgentUri);
        if (!agentId) {
            throw new HttpException(400, "Invalid agent uri");
        }

        const databaseManager = this.databaseManager;
        const inputMessageContent = LmManagerUtils.createMessageContent(input, files);
        const chain = await LmManagerUtils.getChain(this.databaseManager, this._lmProviderMap, aifSessionId, agentId, input, inputMessageContent, outputFormat);
        return new Observable<string>((subscriber) => {
            async function run() {
                const response = await chain.invoke(input);
                subscriber.next(response);
                subscriber.complete();

                databaseManager.addChatMessage(aifSessionId, aifAgentUri, api.ChatRole.USER, inputMessageContent, outputFormat);
                const responseMessageContent = LmManagerUtils.createMessageContent(response);
                databaseManager.addChatMessage(aifSessionId, aifAgentUri, api.ChatRole.ASSISTANT, responseMessageContent, api.defaultTextFormat);
            }

            run().catch((ex) => {
                // As the streaming started, we can only send error message but not send it as an error to subscriber
                subscriber.next(`Error: ${ex}`);
                subscriber.complete();
            });
        });
    }

    public listAgents(): api.ListAgentsResponse {
        const agents = this.databaseManager.listAgents();
        return { agents };
    }

    public createAgent(request: api.CreateAgentRequest): api.CreateOrUpdateAgentResponse {
        const uuidValue = uuid();
        const agentUri = AifUtils.createAifUri(consts.AIF_PROTOCOL, AifUtils.AifUriCategory.Agents, uuidValue);
        const agent = new database.AgentEntity(
            uuidValue,
            agentUri,
            request.name || uuidValue,
            request.basemodelUri ?? "",
            request.systemPrompt ?? "",
            request.ragAssetIds ?? [],
            request.functionAssetIds ?? []
        );
        this.databaseManager.saveDbEntity(agent);
        return { id: agent.id, uri: agent.agentUri };
    }

    public updateAgent(id: string, request: api.UpdateAgentRequest): api.CreateOrUpdateAgentResponse {
        if (!id) {
            throw new HttpException(400, "Agent id is required");
        }
        const agent = this.databaseManager.updateAgent(id, request);
        return { id: agent.id, uri: agent.agentUri };
    }

    public deleteAgent(id: string): api.DeleteAgentResponse {
        if (this.databaseManager.deleteAgent(id)) {
            return { id };
        } else {
            throw new HttpException(404, "Agent not found");
        }
    }

    public listEmbeddings(): api.ListEmbeddingsResponse {
        const embeddings = this.databaseManager.listEmbeddingsMetadata();
        return { embeddings };
    }

    public async createEmbedding(
        afBaseModelUri: string | undefined,
        files: misc.UploadFileInfo[] | undefined,
        name: string | undefined,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        if (!afBaseModelUri || afBaseModelUri.length === 0 || !files || files.length === 0) {
            throw new HttpException(400, "afBaseModelUri and files are required");
        }

        const llm = await LmManagerUtils.getBaseEmbeddingsModel(this._lmProviderMap, afBaseModelUri);
        return AssetUtils.createEmbeddings(this.databaseManager, llm, afBaseModelUri, files, name);
    }

    public async updateEmbedding(
        aifEmbeddingAssetId: string | undefined,
        files: misc.UploadFileInfo[] | undefined,
        name: string | undefined,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        if (!aifEmbeddingAssetId || aifEmbeddingAssetId.length === 0) {
            throw new HttpException(400, "Embedding id is required");
        }

        const embeddingMetadata = this.databaseManager.getEmbeddingsMetadata(aifEmbeddingAssetId);
        if (!embeddingMetadata) {
            throw new HttpException(404, "Embedding not found");
        }

        const llm = await LmManagerUtils.getBaseEmbeddingsModel(this._lmProviderMap, embeddingMetadata.basemodelUri);
        return AssetUtils.updateEmbeddings(this.databaseManager, llm, embeddingMetadata, files, name);
    }

    public async deleteEmbedding(id: string): Promise<api.DeleteEmbeddingResponse> {
        return AssetUtils.deleteEmbedding(this.databaseManager, id);
    }

    public listLanguageModels(llmFeature: api.LlmFeature): api.ListLanguageModelsResponse {
        const basemodels: api.LmProviderBaseModelInfo[] = [];
        for (const provider of Object.values(this._lmProviderMap)) {
            if (!provider.isHealthy) {
                continue;
            }
            const newBaseModels = provider.listLanguageModels(llmFeature);
            basemodels.push(...newBaseModels);
        }
        return { basemodels };
    }

    public downloadLocalLanguageModel(lmProviderId: string, id: string, out: ApiOutStream): void {
        const provider = this._findLmProviderModel(lmProviderId);
        provider.downloadLocalLanguageModel(id, out);
    }

    public deleteLocalLanguageModel(lmProviderId: string, id: string, out: ApiOutStream): void {
        const provider = this._findLmProviderModel(lmProviderId);
        provider.deleteLocalLanguageModel(id, out);
    }

    public setupLmProvider(request: api.SetupLmProviderRequest, out: ApiOutStream): void {
        if (!request) {
            throw new HttpException(400, "Invalid request to setup language model provider")
        }

        const lmProvider = this._lmProviderMap[request.id];
        if (lmProvider) {
            if (lmProvider.id === LmProviderOllama.ID) {
                OllamaUtils.startOllamaServer(out);
                return;
            }
        }

        throw new HttpException(404, `Language model provider ${request.id} not found`);
    }

    public async listLmProviders(force: boolean): Promise<api.ListLmProvidersResponse> {
        let providers: api.LmProviderInfoResponse[] = [];
        for (const provider of Object.values(this._lmProviderMap)) {
            const providerInfo = await provider.getLmProviderInfo(force);
            providers.push(providerInfo);
        }

        providers = providers.sort((a, b) => a.weight - b.weight);
        return { providers };
    }

    public async getLmProvider(id: string, force: boolean): Promise<api.LmProviderInfoResponse> {
        const provider = this._lmProviderMap[id];
        if (!provider) {
            throw new HttpException(404, "Language model provider not found");
        }
        return provider.getLmProviderInfo(force);
    }

    public updateLmProviderInfo(request: api.UpdateLmProviderInfoRequest): api.UpdateLmProviderResponse {
        if (!request) {
            throw new HttpException(400, "Invalid request to update language model provider")
        }

        const provider = this._findLmProviderModel(request.id);
        return provider.updateLmProviderInfo(request);
    }

    public updateLmProviderModel(request: api.UpdateLmProviderModelRequest): api.UpdateLmProviderResponse {
        if (!request) {
            throw new HttpException(400, "Invalid request to update language model provider model")
        }

        return this._updateLmProviderModel(request.id, request.modelUri, request.selected);
    }

    private _updateLmProviderModel(lmProviderId: string, modelUri: string, selected: boolean): api.UpdateLmProviderResponse {
        const provider = this._findLmProviderModel(lmProviderId);
        return provider.updateLmProviderModel(modelUri, selected);
    }

    protected _findLmProviderModel(lmProviderId: string): LmBaseProvider {
        for (const provider of Object.values(this._lmProviderMap)) {
            if (provider.id === lmProviderId) {
                return provider;
            }
        }

        throw new HttpException(404, "Language model not found");
    }
}

export default LmManager;
