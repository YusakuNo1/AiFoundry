import * as fs from 'fs';
import * as path from 'path';
import { types } from "aifoundry-vscode-shared";
import AssetUtils from '../utils/assetUtils';
import { HttpException } from '../exceptions';


class DatabaseManager {
    private _databaseFolderPath: string;

    constructor() {
    }

    public setup(databaseName: string) {
        try {
            this._setupDataSource(databaseName);
        } catch (error) {
            throw error;
        }
    }

    // Shared ------------------------------------------------------------------

    public saveDbEntity(dbEntity: types.database.BaseEntity): types.database.BaseEntity {
        const fileName = this._getDatabaseEntityFilePath(dbEntity.entityName);
        let content = {};
        if (!fs.existsSync(fileName)) {
            fs.writeFileSync(fileName, JSON.stringify(content));
        } else {
            content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        }

        content[dbEntity.id] = dbEntity;
        fs.writeFileSync(fileName, JSON.stringify(content));
        return dbEntity;
    }

    public getDbEntity(dbName: string, id: string): types.database.BaseEntity | null {
        const fileName = this._getDatabaseEntityFilePath(dbName);
        let content = {};
        if (!fs.existsSync(fileName)) {
            return null;
        } else {
            content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            return content[id] ?? null;
        }
    }

    public deleteDbEntity(dbName: string, id: string): boolean {
        const fileName = this._getDatabaseEntityFilePath(dbName);
        let content = {};
        if (!fs.existsSync(fileName)) {
            return false;
        } else {
            content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            if (content[id]) {
                delete content[id];
                fs.writeFileSync(fileName, JSON.stringify(content));
            } else {
                return false;
            }
            return true;
        }
    }

    public listDbEntities(dbName: string): types.database.BaseEntity[] {
        const fileName = this._getDatabaseEntityFilePath(dbName);
        let content = {};
        if (!fs.existsSync(fileName)) {
            fs.writeFileSync(fileName, JSON.stringify(content));
        } else {
            content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        }
        return Object.values(content);
    }

    // LmProvider --------------------------------------------------------------

    public listLmProviderInfo(): types.database.LmProviderInfo[] {
        return this.listDbEntities(types.database.LmProviderInfo.ENTITY_NAME) as types.database.LmProviderInfo[];
    }

    public getLmProviderInfo(providerId: string): types.database.LmProviderInfo | null {
        return this.getDbEntity(types.database.LmProviderInfo.ENTITY_NAME, providerId) as types.database.LmProviderInfo;
    }

    // Embeddings --------------------------------------------------------------

    public saveEmbeddingsMetadata(embeddingMetadata: types.database.EmbeddingMetadata) {
        this.saveDbEntity(embeddingMetadata);
    }

    public listEmbeddingsMetadata() {
        return this.listDbEntities(types.database.EmbeddingMetadata.name) as types.database.EmbeddingMetadata[];
    }

    public getEmbeddingsMetadata(assetId: string): types.database.EmbeddingMetadata | null {
        return this.getDbEntity(types.database.EmbeddingMetadata.name, assetId) as types.database.EmbeddingMetadata;
    }

    public deleteEmbeddingsMetadata(assetId: string) {
        return this.deleteDbEntity(types.database.EmbeddingMetadata.name, assetId);
    }

    // Agents ------------------------------------------------------------------

    public listAgents() {
        return this.listDbEntities(types.database.AgentMetadata.name) as types.database.AgentMetadata[];
    }

    public getAgent(agentId: string): types.database.AgentMetadata | null {
        return this.getDbEntity(types.database.AgentMetadata.name, agentId) as types.database.AgentMetadata;
    }

    public updateAgent(agentId: string, request: types.api.UpdateAgentRequest): types.database.AgentMetadata {
        const agent = this.getAgent(agentId);
        if (!agent) {
            throw new HttpException(404, `Agent not found`);
        }

        agent.basemodelUri = request.basemodelUri || agent.basemodelUri;
        agent.name = request.name || agent.name;
        agent.systemPrompt = request.systemPrompt || agent.systemPrompt;
        agent.ragAssetIds = request.ragAssetIds || agent.ragAssetIds;
        agent.functionAssetIds = request.functionAssetIds || agent.functionAssetIds;
        return this.saveDbEntity(agent) as types.database.AgentMetadata;
    }

    public deleteAgent(id: string) {
        return this.deleteDbEntity(types.database.AgentMetadata.name, id);
    }

    // Chat --------------------------------------------------------------------

    public getChatHistory(sessionId: string): types.database.ChatHistory | null {
        return this.getDbEntity(types.database.ChatHistory.name, sessionId) as types.database.ChatHistory;
    }

    public addChatMessage(
        sessionId: string,
        aifAgentUri: string,
        role: types.api.ChatRole,
        content: types.database.ChatHistoryMessageContent,
        contentTextFormat: types.api.TextFormat,
    ) {
        let chatHistory = this.getChatHistory(sessionId);
        if (!chatHistory) {
            chatHistory = new types.database.ChatHistory(sessionId, aifAgentUri, []);
        }

        const chatHistoryMessage: types.database.ChatHistoryMessage = { role, content, contentTextFormat };
        (chatHistory.messages as types.database.ChatHistoryMessage[]).push(chatHistoryMessage);
        this.saveDbEntity(chatHistory);
    }


    // Private -----------------------------------------------------------------

    private _setupDataSource(databaseName: string) {
        const assetsPath = AssetUtils.getAssetsPath();
        this._databaseFolderPath = path.join(assetsPath, databaseName);

        // In solution for JSON based database, databaseName is the folder for all the json files
        if (!fs.existsSync(this._databaseFolderPath)) {
            fs.mkdirSync(this._databaseFolderPath, { recursive: true });
        }
    }

    private _getDatabaseEntityFilePath(dbName: string) {
        return path.join(this._databaseFolderPath, dbName + '.json');
    }
}

export default DatabaseManager;
