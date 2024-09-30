import { Observable } from 'rxjs';
import { v4 as uuid } from "uuid";
import { AifUtils, types } from 'aifoundry-vscode-shared';
import ILmProvider from './ILmProvider';
import ILmManager from './ILmManager';
import DatabaseManager from '../database/DatabaseManager';
import { HttpException } from '../exceptions';
import AssetUtils from '../utils/assetUtils';
import LmProviderAzureOpenAI from './LmProviderAzureOpenAI';
import LmManagerUtils from './LmManagerUtils';
// import LmProviderOllama from './LmProviderOllama';


class LmManager implements ILmManager {
    private _lmProviderMap: Record<string, ILmProvider> = {};

    constructor(private databaseManager: DatabaseManager) {
        this.listAgents = this.listAgents.bind(this);
        this.createAgent = this.createAgent.bind(this);
        this.updateAgent = this.updateAgent.bind(this);
        this.chat = this.chat.bind(this);
        this.listEmbeddings = this.listEmbeddings.bind(this);
        this.createEmbedding = this.createEmbedding.bind(this);
        this.updateEmbedding = this.updateEmbedding.bind(this);

        this._lmProviderMap[LmProviderAzureOpenAI.ID] = new LmProviderAzureOpenAI(databaseManager);
        // this._lmProviderMap[LmProviderOllama.ID] = new LmProviderOllama(databaseManager);
    }

    public chat(
        aifSessionId: string,
        aifAgentUri: string,
        outputFormat: types.api.TextFormat,
        input: string,
        files: types.UploadFileInfo[],
    ): Observable<string> {
        const agentId = AifUtils.getAgentId(aifAgentUri);
        if (!agentId) {
            throw new HttpException(400, "Invalid agent uri");
        }

        const databaseManager = this.databaseManager;
        const chain = LmManagerUtils.getChain(this.databaseManager, this._lmProviderMap, aifSessionId, agentId, input, files, outputFormat);
        return new Observable<string>((subscriber) => {
            async function run() {
                const response = await chain.invoke(input);
                subscriber.next(response);
                subscriber.complete();

                databaseManager.addChatMessage(aifSessionId, aifAgentUri, types.api.ChatRole.USER, input, outputFormat, files);
                databaseManager.addChatMessage(aifSessionId, aifAgentUri, types.api.ChatRole.ASSISTANT, response, types.api.defaultTextFormat);
            }

            run().catch((ex) => {
                // As the streaming started, we can only send error message but not send it as an error to subscriber
                subscriber.next(`Error: ${ex}`);
                subscriber.complete();
            });
        });
    }

    public listAgents(): types.api.ListAgentsResponse {
        const agents = this.databaseManager.listAgents();
        return { agents };
    }

    public createAgent(request: types.api.CreateAgentRequest): types.api.CreateOrUpdateAgentResponse {
        const uuidValue = uuid();
        const agentUri = AifUtils.createAifAgentUri(uuidValue);
        const agent = new types.database.AgentMetadata(
            uuidValue,
            request.name || uuidValue,
            agentUri,
            request.basemodelUri ?? "",
            request.systemPrompt ?? "",
            request.ragAssetIds ?? [],
            request.functionAssetIds ?? []
        );
        this.databaseManager.saveDbEntity(agent);
        return { id: agent.id, uri: agent.agentUri };
    }

    public updateAgent(id: string, request: types.api.UpdateAgentRequest): types.api.CreateOrUpdateAgentResponse {
        if (!id) {
            throw new HttpException(400, "Agent id is required");
        }
        const agent = this.databaseManager.updateAgent(id, request);
        return { id: agent.id, uri: agent.agentUri };
    }

    public deleteAgent(id: string): void {
        this.databaseManager.deleteAgent(id);
    }

    public listEmbeddings(): types.api.ListEmbeddingsResponse {
        const embeddings = this.databaseManager.listEmbeddingsMetadata();
        return { embeddings };
    }

    public async createEmbedding(
        afBaseModelUri: string | undefined,
        files: types.UploadFileInfo[] | undefined,
        name: string | undefined,
    ): Promise<types.api.CreateOrUpdateEmbeddingsResponse> {
        if (!afBaseModelUri || afBaseModelUri.length === 0 || !files || files.length === 0) {
            throw new HttpException(400, "afBaseModelUri and files are required");
        }

        const llm = LmManagerUtils.getBaseEmbeddingsModel(this._lmProviderMap, afBaseModelUri);
        return AssetUtils.createEmbeddings(this.databaseManager, llm, afBaseModelUri, files, name);
    }

    public async updateEmbedding(
        aifEmbeddingAssetId: string | undefined,
        files: types.UploadFileInfo[] | undefined,
        name: string | undefined,
    ): Promise<types.api.CreateOrUpdateEmbeddingsResponse> {
        if (!aifEmbeddingAssetId || aifEmbeddingAssetId.length === 0) {
            throw new HttpException(400, "Embedding id is required");
        }

        const embeddingMetadata = this.databaseManager.getEmbeddingsMetadata(aifEmbeddingAssetId);
        if (!embeddingMetadata) {
            throw new HttpException(404, "Embedding not found");
        }

        const llm = LmManagerUtils.getBaseEmbeddingsModel(this._lmProviderMap, embeddingMetadata.basemodelUri);
        return AssetUtils.updateEmbeddings(this.databaseManager, llm, embeddingMetadata, files, name);
    }

}

export default LmManager;